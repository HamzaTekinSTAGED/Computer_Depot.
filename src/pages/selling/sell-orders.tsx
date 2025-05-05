"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import UserInfo from "../../components/UserInfo";
import Image from "next/image";
import LoadingSpinner from "../../components/loading";
import { Product } from "@/types";

export default function SellOrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Authentication/register");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/products?userId=${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            const userProducts = data.filter((product: Product) => product.userID === parseInt(session.user.id));
            setProducts(userProducts);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }
      setLoading(false);
    };

    fetchProducts();
  }, [session]);

  const handleProductClick = (product: Product) => {
    router.push(`/selling/sold/${product.productID}`);
  };


  return (
    <div className="flex h-screen relative">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
        {(status === "loading" || loading) ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto mt-10 p-8">
            <h2 className="text-2xl font-semibold mb-6">My Sell Orders</h2>
            {products.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl shadow-md">
                <p className="text-xl text-gray-600">Henüz hiç ürün eklenmemiş</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div 
                    key={product.productID} 
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.imageURL && (
                      <div className="h-48 w-full overflow-hidden relative">
                        <Image
                          src={product.imageURL}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2 flex items-center">
                        {product.title}
                        {product.newCommentExist && (
                          <span className="ml-2 w-3 h-3 bg-blue-500 rounded-full" title="New comment"></span>
                        )}
                      </h3>
                      <p className="text-gray-600 mb-2">{product.description}</p>
                      <p className="text-lg font-bold mb-2">${product.price}</p>
                      <p className="text-sm text-gray-500 mb-2">Amount: {product.amount}</p>
                      <p className="text-sm text-gray-500 mb-4">Kategori: {product.category.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {session && <UserInfo session={session} />}
    </div>
  );
}
