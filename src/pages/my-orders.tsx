"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";
import { useSession } from "next-auth/react";

interface TradeHistory {
  id: number;
  buyerID: number;
  sellerID: number;
  productID: number;
  price: number;
  sellingDate: string;
  product: {
    title: string;
    description: string;
    imageURL: string;
  };
  buyer: {
    username: string;
  };
  seller: {
    username: string;
  };
}

export default function MyOrders() {
  const { data: session } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);

  useEffect(() => {
    const fetchTradeHistory = async () => {
      if (!session?.user?.id) return;

      try {
        const res = await fetch(`/api/trade-history?buyerId=${session.user.id}`);
        if (!res.ok) {
          throw new Error("Trade history could not be fetched.");
        }
        const data = await res.json();
        setTradeHistory(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchTradeHistory();
  }, [session?.user?.id]);

  return (
    <div className="flex h-screen relative">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-4xl font-semibold text-center mb-6">My Orders</h1>

          {/* Trade History List */}
          <div className="space-y-4">
            {tradeHistory.length > 0 ? (
              tradeHistory.map((trade) => (
                <div key={trade.id} className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      {trade.product.imageURL && (
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={trade.product.imageURL}
                            alt={trade.product.title}
                            className="w-full h-full object-contain rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900">{trade.product.title}</h2>
                        <p className="text-gray-600 text-sm">{trade.product.description}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-gray-800 font-medium">${trade.price}</p>
                          <p className="text-gray-600 text-sm">
                            Bought from: {trade.seller.username}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Date: {new Date(trade.sellingDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                No purchase history found.
              </p>
            )}
          </div>
        </div>
      </div>
      {session && <UserInfo session={session} />}
    </div>
  );
}
