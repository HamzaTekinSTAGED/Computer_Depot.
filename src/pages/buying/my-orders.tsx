"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "../../components/sidebar";
import UserInfo from "../../components/UserInfo";
import { useSession } from "next-auth/react";
import Image from "next/image";
import LoadingSpinner from "../../components/loading";
import Link from "next/link";
import { TradeHistory, Category } from "@/types";
import FilterProduct from "../../components/filterProduct";

const MyOrdersPage = () => {
  const { data: session } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [filteredTradeHistory, setFilteredTradeHistory] = useState<TradeHistory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({
    selectedCategoryIds: [] as number[],
    dateRange: "",
    minPrice: "",
    maxPrice: "",
  });

  // Fetch categories
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

  const TradeItem = ({ trade }: { trade: TradeHistory }) => (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 flex flex-col h-full">
      {trade.product.imageURL && (
        <div className="w-full h-48 relative border-b border-gray-200">
          <Image
            src={trade.product.imageURL}
            alt={trade.product.title}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={trade.product.title}>{trade.product.title}</h2>
        <p 
          className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow" 
          title={trade.product.description}
        >
          {trade.product.description}
        </p>
        <div className="space-y-1 mb-3 text-sm">
          <p className="text-gray-800 font-medium text-base">${trade.price}</p>
          <p className="text-gray-600">
            Seller: <span className="font-medium text-gray-700">{trade.seller.username}</span>
          </p>
          <p className="text-gray-600">
            Amount: <span className="font-medium text-gray-700">{trade.amount}</span>
          </p>
          <p className="text-gray-500 text-xs pt-1">
            {new Date(trade.sellingDate).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 mt-auto">
        <Link href={`/buying/product/${trade.productID}`} legacyBehavior>
          <a className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md text-sm text-center transition duration-150 ease-in-out">
            Review Product
          </a>
        </Link>
      </div>
    </div>
  );

  TradeItem.displayName = 'TradeItem';

  const MemoizedTradeItem = useMemo(() => TradeItem, []);

  const handleFilterChange = useCallback((filters: typeof filterValues) => {
    setFilterValues(filters);
  },[]);

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

  useEffect(() => {
    const now = new Date();
    let filtered = tradeHistory.filter((trade) => {
      // Category filter
      const categoryMatch = filterValues.selectedCategoryIds.length === 0 || 
        filterValues.selectedCategoryIds.includes(trade.product.categoryID);
      
      // Date filter
      let dateMatch = true;
      if (filterValues.dateRange) {
        const tradeDate = new Date(trade.sellingDate);
        let diff = (now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24); // difference in days
        if (filterValues.dateRange === "1week") dateMatch = diff <= 7;
        else if (filterValues.dateRange === "1month") dateMatch = diff <= 30;
        else if (filterValues.dateRange === "3month") dateMatch = diff <= 90;
        else if (filterValues.dateRange === "6month") dateMatch = diff <= 180;
      }

      // Price filter
      let priceMatch = true;
      if (filterValues.minPrice !== "" && !isNaN(Number(filterValues.minPrice))) 
        priceMatch = trade.price >= Number(filterValues.minPrice);
      if (filterValues.maxPrice !== "" && !isNaN(Number(filterValues.maxPrice))) 
        priceMatch = priceMatch && trade.price <= Number(filterValues.maxPrice);

      return categoryMatch && dateMatch && priceMatch;
    });
    setFilteredTradeHistory(filtered);
  }, [filterValues, tradeHistory]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 relative">
        <Sidebar onExpand={setIsSidebarExpanded} />
        <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"} overflow-y-auto`}>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="p-6 md:p-10 max-w-7xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8 md:mb-12">
                My Orders
              </h1>

              {/* Update FilterProduct to use categories */}
              <FilterProduct 
                categories={categories}
                onFilterChange={handleFilterChange}
                pageType="my-orders"
              />

              {/* Trade History List */}
              {filteredTradeHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTradeHistory.map((trade) => (
                    <MemoizedTradeItem key={trade.id} trade={trade} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">
                    No purchase history found.
                  </p>
                  <Link href="/hero" legacyBehavior>
                    <a className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-md transition duration-150 ease-in-out">
                      Browse Products
                    </a>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {session && <UserInfo session={session} />}
    </div>
  );
};

MyOrdersPage.displayName = 'MyOrdersPage';

export default MyOrdersPage;
