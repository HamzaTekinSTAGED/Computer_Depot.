"use client";

import { FC, useState, useRef, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaShoppingCart, FaDollarSign, FaBars } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import SlidingBar from "./SlidingBar";

const Sidebar: FC = () => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | null>(null);
  const [showBar, setShowBar] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Start with collapsed sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [barPosition, setBarPosition] = useState<number>(0);

  const buyButtonRef = useRef<HTMLButtonElement | null>(null);
  const sellButtonRef = useRef<HTMLButtonElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const handleTabClick = (tab: "buy" | "sell") => {
    setActiveTab(tab);
    setShowBar(true);

    if (tab === "buy" && buyButtonRef.current) {
      setBarPosition(buyButtonRef.current.offsetTop);
    } else if (tab === "sell" && sellButtonRef.current) {
      setBarPosition(sellButtonRef.current.offsetTop);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setShowBar(false); // Close the sliding bar if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full bg-[#4a6c91] text-white shadow-lg transition-all duration-300 ease-in-out z-40
          ${isExpanded ? "w-64" : "w-20"} 
          ${mobileMenuOpen ? "translate-x-0" : "translate-x-[-100%] md:translate-x-0"}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600 mt-16 md:mt-0">
          <Link href="/hero" className="flex items-center space-x-2">
            <Image src="/logo.svg" alt="logo" width={40} height={40} />
            {isExpanded && <span className="text-xl font-bold">Pro Sidebar</span>}
          </Link>
        </div>

        {/* Sidebar Buttons */}
        <nav className="flex flex-col items-start mt-10 space-y-4 px-2">
          <button
            ref={buyButtonRef}
            onClick={() => handleTabClick("buy")}
            className="flex items-center w-full px-4 py-3 hover:bg-[#2f4a6b] rounded-lg transition group"
          >
            <FaShoppingCart className="text-lg" />
            {isExpanded && <span className="ml-3 text-sm">Buy</span>}
          </button>

          <button
            ref={sellButtonRef}
            onClick={() => handleTabClick("sell")}
            className="flex items-center w-full px-4 py-3 hover:bg-[#2f4a6b] rounded-lg transition group"
          >
            <FaDollarSign className="text-lg" />
            {isExpanded && <span className="ml-3 text-sm">Sell</span>}
          </button>
        </nav>

        <SlidingBar
          activeTab={activeTab}
          position={barPosition}
          showBar={showBar}
          sidebarWidth={isExpanded ? 256 : 80} // pixel width uyumu için SlidingBar'a gönderiyoruz
        />
      </aside>
    </div>
  );
};

export default Sidebar;
