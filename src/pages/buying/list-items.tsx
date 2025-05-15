"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import UserInfo from "../../components/UserInfo";
import { useSession } from "next-auth/react";
import ProductPopup from "../../components/ProductPopup";
import Image from "next/image";
import { useRouter } from "next/router";
import LoadingSpinner from "../../components/loading";
import { calculateAverageRating } from "../../utils/ratingUtils";
import { Category, Product } from "@/types";




export default function ProductList() {
  const { data: session } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); 
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
        setIsLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Failed to fetch products.");
        }
        const data = await res.json();
        // Filter out only current user's products, show all other products regardless of amount
        const filteredProducts = data.filter((product: Product) => 
          product.userID !== Number(session?.user?.id)
        );

        // Her ürün için yorumları getir
        const productsWithComments = await Promise.all(
          filteredProducts.map(async (product: Product) => {
            try {
              const commentsRes = await fetch(`/api/comment/${product.productID}`);
              if (commentsRes.ok) {
                const comments = await commentsRes.json();
                return { ...product, comments };
              }
              return product;
            } catch (error) {
              console.error(`Error fetching comments for product ${product.productID}:`, error);
              return product;
            }
          })
        );

        setProducts(productsWithComments);
        setFilteredProducts(productsWithComments);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
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
    router.push(`/buying/product/${product.productID}`);
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

      // Update the products list to reflect the new amount
      setProducts(products.map(product => {
        if (product.productID === productId) {
          return {
            ...product,
            amount: product.amount - 1
          };
        }
        return product;
      }));
      setFilteredProducts(filteredProducts.map(product => {
        if (product.productID === productId) {
          return {
            ...product,
            amount: product.amount - 1
          };
        }
        return product;
      }));
      setSelectedProduct(null);
    } catch (error) {
      console.error("Purchase error:", error);
      alert(error instanceof Error ? error.message : "Purchase failed");
    } finally {
      setIsPurchasing(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 relative">
        <Sidebar onExpand={setIsSidebarExpanded} />
        <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
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
                        <div className="relative w-full h-48">
                          <Image
                            src={product.imageURL}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <h2 className="text-xl font-semibold text-gray-900">{product.title}</h2>
                          <div className="flex items-center space-x-1 px-2 py-1 rounded-full">
                            <span className="text-yellow-500 font-semibold text-lg">
                              {calculateAverageRating(product.comments)}
                            </span>
                            <span className="text-yellow-500 text-2xl">★</span>
                            <span className="text-gray-600 text-sm">
                              ({product.comments?.length || 0})
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{product.category?.name || 'Uncategorized'}</p>
                        <p className="text-gray-800 text-lg mt-2 font-medium">${product.price}</p>
                        <p className="text-gray-600 text-sm">Amount: {product.amount}</p>
                        {product.amount === 0 && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-semibold">
                            Sold Out
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 col-span-full">No products found.</p>
                )}
              </div>
            </div>
          )}
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
    </div>
  );
}
