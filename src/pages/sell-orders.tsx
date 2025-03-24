"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  imageURL: string | null;
  userID: number;
}

export default function SellOrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/register");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/products?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setProducts(data);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }
      setLoading(false);
    };

    fetchProducts();
  }, [session]);

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen relative">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
        <div className="max-w-6xl mx-auto mt-10 p-8">
          <h2 className="text-2xl font-semibold mb-6">Satış Listesi</h2>
          {products.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-md">
              <p className="text-xl text-gray-600">Henüz hiç ürün eklenmemiş</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {product.imageURL && (
                    <div className="h-48 w-full overflow-hidden">
                      <img
                        src={product.imageURL}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <p className="text-lg font-bold mb-2">${product.price}</p>
                    <p className="text-sm text-gray-500 mb-4">Kategori: {product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {session && <UserInfo session={session} />}
    </div>
  );
}
