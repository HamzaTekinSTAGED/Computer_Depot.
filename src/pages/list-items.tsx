"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";
import { useSession } from "next-auth/react";

export default function ProductList() {
  const { data: session } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Ürünler getirilemedi.");
        }
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Hata:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex h-screen relative">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-4xl font-semibold text-center mb-6">Products List</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.map((product: any, index: number) => (
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
              <p className="text-center text-gray-500">Henüz eklenmiş ürün yok.</p>
            )}
          </div>
        </div>
      </div>
      {session && <UserInfo session={session} />}
    </div>
  );
}
