"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";
import { useSession } from "next-auth/react";

interface Product {
  title: string;
  category: string;
  imageURL: string;
  price: number;
}

export default function ProductList() {
  const { data: session } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); 
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Ürünler getirilemedi.");
        }
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Hata:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) => {
      return category === "" || product.category === category;
    });
    setFilteredProducts(filtered);
  }, [category, products]);

  const uniqueCategories = [...new Set(products.map(product => product.category))];


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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* Ürün Listesi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  {product.imageURL && (
                    <img src={product.imageURL} alt={product.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900">{product.title}</h2>
                    <p className="text-gray-600 text-sm">{product.category}</p>
                    <p className="text-gray-800 text-lg mt-2 font-medium">${product.price}</p>
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
    </div>
  );
}
