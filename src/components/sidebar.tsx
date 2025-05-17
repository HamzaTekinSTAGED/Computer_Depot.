"use client";

import { FC, useState, useRef, useEffect } from "react";
import { FaShoppingCart, FaDollarSign, FaHome, FaUser, FaCog, FaQuestionCircle, FaShoppingBag, FaClipboardList, FaPlus, FaRegGrinHearts, FaRegHeart } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

interface SidebarProps {
  onExpand?: (expanded: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ onExpand }) => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const handleTabClick = (tab: "buy" | "sell") => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsExpanded(true);
    onExpand?.(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
      onExpand?.(false);
    }, 200);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setActiveTab(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div>
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full 
          bg-gradient-to-b from-white to-gray-50 text-gray-700
          shadow-lg border-r border-gray-200
          transition-all duration-300 ease-in-out z-40
          ${isExpanded ? "w-72" : "w-20"} 
          ${mobileMenuOpen ? "translate-x-0" : "translate-x-[-100%] md:translate-x-0"}
          rounded-r-3xl
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sidebar Header */}
        <div className="flex items-center p-6 border-b border-gray-200 mt-16 md:mt-0">
          <Link href="/hero" className={`flex items-center space-x-3 ${isExpanded ? 'w-full justify-center' : ''}`}>
            <Image src="/logo-clean.png" alt="logo" width={45} height={45} className="rounded-lg" />
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col items-start mt-10 space-y-4 px-4">
          {/* Main Navigation */}
          <Link href="/" className="w-full">
            <button className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-gray-100 text-gray-600 hover:text-blue-600">
              <FaHome className="text-xl flex-shrink-0" />
              <span className={`ml-4 text-sm font-medium overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Home
              </span>
            </button>
          </Link>

          {/* Buy Section */}
          <div className="w-full">
            <button
              onClick={() => handleTabClick("buy")}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 group
                ${activeTab === "buy" 
                  ? "bg-blue-50 text-blue-600" 
                  : "hover:bg-gray-100 text-gray-600 hover:text-blue-600"}`}
            >
              <FaShoppingCart className="text-xl flex-shrink-0" />
              <span className={`ml-4 text-sm font-medium overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Buy
              </span>
            </button>

            {activeTab === "buy" && isExpanded && (
              <div className="ml-8 mt-2 space-y-2">
                <Link href="/buying/my-orders" className="w-full">
                  <button className="flex items-center w-full px-4 py-2 rounded-lg transition-all duration-300 group hover:bg-blue-50 text-gray-600 hover:text-blue-600">
                    <FaShoppingBag className="text-lg flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium">My Orders</span>
                  </button>
                </Link>
                <Link href="/buying/favorites" className="w-full">
                  <button className="flex items-center w-full px-4 py-2 rounded-lg transition-all duration-300 group hover:bg-blue-50 text-gray-600 hover:text-blue-600">
                    <FaRegHeart className="text-lg flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium">Favourites</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Sell Section */}
          <div className="w-full">
            <button
              onClick={() => handleTabClick("sell")}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 group
                ${activeTab === "sell" 
                  ? "bg-green-50 text-green-600" 
                  : "hover:bg-gray-100 text-gray-600 hover:text-green-600"}`}
            >
              <FaDollarSign className="text-xl flex-shrink-0" />
              <span className={`ml-4 text-sm font-medium overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Sell
              </span>
            </button>

            {activeTab === "sell" && isExpanded && (
              <div className="ml-8 mt-2 space-y-2">
                <Link href="/selling/sell-orders" className="w-full">
                  <button className="flex items-center w-full px-4 py-2 rounded-lg transition-all duration-300 group hover:bg-green-50 text-gray-600 hover:text-green-600">
                    <FaClipboardList className="text-lg flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium">My Sell Orders</span>
                  </button>
                </Link>
                <Link href="/selling/add-items" className="w-full">
                  <button className="flex items-center w-full px-4 py-2 rounded-lg transition-all duration-300 group hover:bg-green-50 text-gray-600 hover:text-green-600">
                    <FaPlus className="text-lg flex-shrink-0" />
                    <span className="ml-3 text-sm font-medium">Add Items</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <Link href="/profile" className="w-full">
            <button className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-gray-100 text-gray-600 hover:text-purple-600">
              <FaUser className="text-xl flex-shrink-0" />
              <span className={`ml-4 text-sm font-medium overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Profile
              </span>
            </button>
          </Link>

          {/* Settings Section */}
          <Link href="/settings" className="w-full">
            <button className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-gray-100 text-gray-600 hover:text-yellow-600">
              <FaCog className="text-xl flex-shrink-0" />
              <span className={`ml-4 text-sm font-medium overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Settings
              </span>
            </button>
          </Link>

          {/* Help Section */}
          <Link href="/help" className="w-full">
            <button className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-gray-100 text-gray-600 hover:text-red-600">
              <FaQuestionCircle className="text-xl flex-shrink-0" />
              <span className={`ml-4 text-sm font-medium overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Help
              </span>
            </button>
          </Link>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
