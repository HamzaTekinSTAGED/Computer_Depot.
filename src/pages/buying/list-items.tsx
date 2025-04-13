"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import UserInfo from "../../components/UserInfo";
import { useSession } from "next-auth/react";
import ProductPopup from "../../components/ProductPopup";

interface Product {
  title: string;
  categoryID: number;
  category: {
    name: string;
  };
  imageURL: string;
  price: number;
  amount: number;
  isSold: boolean;
  userID: number;
  productID: number;
  description: string;
}

interface Category {
  categoryID: number;
  name: string;
  description: string | null;
}

export default function ProductList() {
  const { data: session } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); 
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) {
          throw new Error("Kategoriler getirilemedi.");
        }
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Kategori hatası:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Ürünler getirilemedi.");
        }
        const data = await res.json();
        // Filter out sold products and current user's products
        const unsoldProducts = data.filter((product: Product) => 
          !product.isSold && product.userID !== Number(session?.user?.id)
        );
        setProducts(unsoldProducts);
        setFilteredProducts(unsoldProducts);
      } catch (error) {
        console.error("Hata:", error);
      }
    };

    if (session?.user?.id) {
      fetchProducts();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const filtered = products.filter((product) => {
      return selectedCategoryId === "" || product.categoryID === selectedCategoryId;
    });
    setFilteredProducts(filtered);
  }, [selectedCategoryId, products]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleClosePopup = () => {
    setSelectedProduct(null);
  };

  const handlePurchase = async (productId: number) => {
    try {
      setIsPurchasing(productId);
      const response = await fetch("/api/trade-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Purchase failed");
      }

      // Update the products list to remove the purchased item
      setProducts(products.filter(product => product.productID !== productId));
      setFilteredProducts(filteredProducts.filter(product => product.productID !== productId));
      setSelectedProduct(null);
    } catch (error) {
      console.error("Purchase error:", error);
      alert(error instanceof Error ? error.message : "Purchase failed");
    } finally {
      setIsPurchasing(null);
    }
  };

  return (
    <div className="flex h-screen relative">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-4xl font-semibold text-center mb-6">Products List</h1>
          
          {/* Filtreleme Alanı */}
          <div className="mb-6 flex gap-4">
            <select
              className="p-2 border rounded"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.categoryID} value={cat.categoryID}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          {/* Ürün Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div 
                  key={index} 
                  className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 relative cursor-pointer hover:shadow-xl transition-shadow duration-300"
                  onClick={() => handleProductClick(product)}
                >
                  {product.imageURL && (
                    <img src={product.imageURL} alt={product.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900">{product.title}</h2>
                    <p className="text-gray-600 text-sm">{product.category?.name || 'Uncategorized'}</p>
                    <p className="text-gray-800 text-lg mt-2 font-medium">${product.price}</p>
                    <p className="text-gray-600 text-sm">Amount: {product.amount}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Uygun ürün bulunamadı.</p>
            )}
          </div>
        </div>
      </div>
      {session && <UserInfo session={session} />}
      
      {/* Pop-up */}
      {selectedProduct && (
        <ProductPopup
          product={selectedProduct}
          onClose={handleClosePopup}
          onPurchase={handlePurchase}
          isPurchasing={isPurchasing === selectedProduct.productID}
        />
      )}
    </div>
  );
}
