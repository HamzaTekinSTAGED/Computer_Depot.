"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import router from "next/router";
import SlidingBar from "./SlidingBar";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell" |null>(null);
  const [showBar, setShowBar] = useState(false); // Navbar'ın sağında buy|sell için açılan bar için
  const buyButtonRef=useRef<HTMLButtonElement |null>(null);
  const sellButtonRef=useRef<HTMLButtonElement |null>(null);
  const [barPosition,setbarPosition]= useState<number>(0);
  const handleTabClick = (tab: "buy"|"sell") =>{
    setActiveTab(tab);
    setShowBar(true);
    
    
    if(tab==="buy"&&buyButtonRef.current){
      setbarPosition( buyButtonRef.current.offsetTop)
    }else if(tab==="sell" && sellButtonRef.current){
      setbarPosition( sellButtonRef.current.offsetTop)
    }
  };



  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-white shadow-lg flex flex-col items-center py-6">
      <Link href="/hero" className="mb-8">
        <Image src="/logo.svg" alt="logo" width={50} height={50} className="object-contain" />
      </Link>
      <nav className="flex flex-col space-y-6">
      <div className="mt-8">
        <button
            ref={buyButtonRef}
          onClick={() => handleTabClick("buy")}
          className="bg-blue-500  text-white py-2 px-6 rounded"
          >
            Buy
          </button>

          <button
            ref={sellButtonRef}
          onClick={() => handleTabClick("sell")}
          className="bg-green-500 mt-2 text-white py-2 px-6 rounded"
          >
            Sell
          </button>
        </div>

        <SlidingBar
          activeTab={activeTab}
          position={barPosition}
          showBar={showBar}
        />
      
      </nav>
    </aside>

    
  );
};

export default Navbar;
