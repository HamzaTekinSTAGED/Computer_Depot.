import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Cart = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (session) {
      router.push('/buying/cart');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary hover:bg-primary/90 transition-colors"
      >
        <ShoppingCart className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};

export default Cart; 