"use client";

import { forwardRef } from "react";
import { useRouter } from "next/router";

interface SlidingBarProps {
  activeTab: "buy" | "sell" | null;
  position: number;
  showBar: boolean;
  sidebarWidth: number;
}

const SlidingBar = forwardRef<HTMLDivElement, SlidingBarProps>(
  ({ activeTab, position, showBar, sidebarWidth }, ref) => {
    const router = useRouter();

    if (!showBar) return null;

    return (
      <div
        ref={ref}
        className="absolute text-white p-4 shadow-lg transition-all duration-300 rounded-md z-50"
        style={{
          top: position,
          left: sidebarWidth,
          width: "240px",
          backgroundColor: "#3b4e78", // Original blue color
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }}
      >
        <ul className="space-y-2">
          {activeTab === "buy" ? (
            <>
              <li>
                <button
                  onClick={() => router.push("/my-orders")}
                  className="block w-full text-left py-2 hover:text-blue-400 transition-colors duration-200"
                >
                  My Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/list-items")}
                  className="block w-full text-left py-2 hover:text-blue-400 transition-colors duration-200"
                >
                  List Items
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button
                  onClick={() => router.push("/sell-orders")}
                  className="block w-full text-left py-2 hover:text-green-400 transition-colors duration-200"
                >
                  My Sell Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/add-items")}
                  className="block w-full text-left py-2 hover:text-green-400 transition-colors duration-200"
                >
                  Add Items
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
