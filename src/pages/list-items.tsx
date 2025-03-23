"use client";

import { useState } from "react";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  const staticPosts = [
    {
      name: "RTX 4090",
      brand: "NVIDIA",
      price: 350,
    },
    {
      name: "DDR5 32GB",
      brand: "Samsung",
      price: 100,
    },
    {
      name: "Intel Core i9-12900K",
      brand: "Intel",
      price: 1000,
    },
  ];

  return (
    <div className="flex h-screen relative">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"}`}>
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-4xl font-semibold text-center mb-6">Posts List</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {staticPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900">{post.name}</h2>
                  <p className="text-gray-600 text-sm">{post.brand}</p>
                  <p className="text-gray-800 text-lg mt-2 font-medium">${post.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {session && <UserInfo session={session} />}
    </div>
  );
}
