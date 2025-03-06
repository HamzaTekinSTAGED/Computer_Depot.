"use client";

// components/SlidingBar.tsx
import { FC } from "react";
import { useRouter } from "next/router";

interface SlidingBarProps {
  activeTab: "buy" | "sell" | null;
  position: number;
  showBar: boolean;
}

const SlidingBar: FC<SlidingBarProps> = ({ activeTab, position, showBar }) => {
  const router = useRouter();

  return (
    <>
      {showBar && (
        <div
          className={`absolute top-${position} left-20 w-64 bg-gray-800 text-white p-4 shadow-lg transition-all duration-300`}
        >
          <ul>
            {activeTab === "buy" ? (
              <>
                <li>
                  <button onClick={() => router.push("/my-orders")} className="block py-2">
                    My Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push("/list-items")} className="block py-2">
                    List Items
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button onClick={() => router.push("/sell-orders")} className="block py-2">
                    My Sell Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push("/add-items")} className="block py-2">
                    Add Items
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default SlidingBar;
