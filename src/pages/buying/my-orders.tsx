"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/sidebar";
import UserInfo from "../../components/UserInfo";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTradeHistory = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        const res = await fetch(`/api/trade-history?buyerId=${session.user.id}`);
        if (!res.ok) {
          throw new Error("Trade history could not be fetched.");
        }
        const data = await res.json();
        setTradeHistory(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTradeHistory();
  }, [session?.user?.id]);

  const TradeItem = useMemo(() => ({ trade }: { trade: TradeHistory }) => (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          {trade.product.imageURL && (
            <div className="w-24 h-24 flex-shrink-0 relative">
              <Image
                src={trade.product.imageURL}
                alt={trade.product.title}
                fill
                className="object-contain rounded"
                sizes="(max-width: 96px) 100vw, 96px"
                priority={false}
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
  ), []);

  return (
    <div className="flex h-screen relative">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-4xl font-semibold text-center mb-6">My Orders</h1>

          {/* Trade History List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : tradeHistory.length > 0 ? (
              tradeHistory.map((trade) => (
                <TradeItem key={trade.id} trade={trade} />
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
