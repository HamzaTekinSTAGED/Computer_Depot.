"use client";

import { forwardRef } from "react";
import { useRouter } from "next/router";

interface SlidingBarProps {
  activeTab: "buy" | "sell" | null;
  position: number;
  showBar: boolean;
  sidebarWidth: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const SlidingBar = forwardRef<HTMLDivElement, SlidingBarProps>(
  ({ activeTab, position, showBar, sidebarWidth, onMouseEnter, onMouseLeave }, ref) => {
    const router = useRouter();

    if (!showBar) return null;

    return (
      <div
        ref={ref}
        className="absolute text-gray-700 p-4 shadow-lg transition-all duration-300 rounded-xl z-50 bg-white border border-gray-200"
        style={{
          top: position,
          left: sidebarWidth,
          width: "280px",
          backgroundColor: activeTab === "buy" ? "#ffffff" : "#ffffff",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <ul className="space-y-3">
          {activeTab === "buy" ? (
            <>
              <li>
                <button
                  onClick={() => router.push("/my-orders")}
                  className="flex items-center w-full text-left py-3 px-4 rounded-lg hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200">
                    My Orders
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/list-items")}
                  className="flex items-center w-full text-left py-3 px-4 rounded-lg hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200">
                    List Items
                  </span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button
                  onClick={() => router.push("/sell-orders")}
                  className="flex items-center w-full text-left py-3 px-4 rounded-lg hover:bg-green-50 transition-all duration-200 group"
                >
                  <span className="text-gray-600 group-hover:text-green-600 transition-colors duration-200">
                    My Sell Orders
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/add-items")}
                  className="flex items-center w-full text-left py-3 px-4 rounded-lg hover:bg-green-50 transition-all duration-200 group"
                >
                  <span className="text-gray-600 group-hover:text-green-600 transition-colors duration-200">
                    Add Items
                  </span>
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    );
  }
);

SlidingBar.displayName = 'SlidingBar';

export default SlidingBar;
