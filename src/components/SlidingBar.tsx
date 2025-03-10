"use client";

import { FC } from "react";
import { useRouter } from "next/router";

interface SlidingBarProps {
  activeTab: "buy" | "sell" | null;
  position: number;
  showBar: boolean;
  sidebarWidth: number;
}

const SlidingBar: FC<SlidingBarProps> = ({ activeTab, position, showBar, sidebarWidth }) => {
  const router = useRouter();

  if (!showBar) return null;

  return (
    <div
      className="absolute text-white p-4 shadow-lg transition-all duration-300 rounded-md z-50"
      style={{
        top: position,
        left: sidebarWidth, // dynamic left value
        width: "240px", // fixed width
        backgroundColor: "#3b4e78", // Lighter blue matching sidebar
      }}
    >
      <ul className="space-y-2">
        {activeTab === "buy" ? (
          <>
            <li>
              <button
                onClick={() => router.push("/my-orders")}
                className="block w-full text-left py-2 hover:text-blue-400"
              >
                My Orders
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push("/list-items")}
                className="block w-full text-left py-2 hover:text-blue-400"
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
                className="block w-full text-left py-2 hover:text-green-400"
              >
                My Sell Orders
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push("/add-items")}
                className="block w-full text-left py-2 hover:text-green-400"
              >
                Add Items
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default SlidingBar;
