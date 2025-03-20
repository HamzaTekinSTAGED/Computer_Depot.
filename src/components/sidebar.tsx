"use client";

import { FC, useState, useRef, useEffect } from "react";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import SlidingBar from "./SlidingBar";

interface SidebarProps {
  onExpand?: (expanded: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ onExpand }) => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | null>(null);
  const [showBar, setShowBar] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileMenuOpen] = useState(false);
  const [barPosition, setBarPosition] = useState<number>(0);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const buyButtonRef = useRef<HTMLButtonElement | null>(null);
  const sellButtonRef = useRef<HTMLButtonElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const slidingBarRef = useRef<HTMLDivElement | null>(null);

  const handleTabClick = (tab: "buy" | "sell") => {
    setActiveTab(tab);
    setShowBar(true);

    if (tab === "buy" && buyButtonRef.current) {
      setBarPosition(buyButtonRef.current.offsetTop);
    } else if (tab === "sell" && sellButtonRef.current) {
      setBarPosition(sellButtonRef.current.offsetTop);
    }
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
      if (!showBar || (slidingBarRef.current && !slidingBarRef.current.matches(':hover'))) {
        setIsExpanded(false);
        setShowBar(false);
        setActiveTab(null);
        onExpand?.(false);
      }
    }, 200);
  };

  const handleSlidingBarMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  const handleSlidingBarMouseLeave = () => {
    setIsExpanded(false);
    setShowBar(false);
    setActiveTab(null);
    onExpand?.(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      sidebarRef.current && 
      !sidebarRef.current.contains(e.target as Node) &&
      slidingBarRef.current && 
      !slidingBarRef.current.contains(e.target as Node)
    ) {
      setShowBar(false);
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

        {/* Sidebar Buttons */}
        <nav className="flex flex-col items-start mt-10 space-y-4 px-4">
          <button
            ref={buyButtonRef}
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

          <button
            ref={sellButtonRef}
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
        </nav>

        <SlidingBar
          ref={slidingBarRef}
          activeTab={activeTab}
          position={barPosition}
          showBar={showBar}
          sidebarWidth={isExpanded ? 288 : 80}
          onMouseEnter={handleSlidingBarMouseEnter}
          onMouseLeave={handleSlidingBarMouseLeave}
        />
      </aside>
    </div>
  );
};

export default Sidebar;
