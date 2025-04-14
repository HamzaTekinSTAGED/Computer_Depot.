import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Cart = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [productCount, setProductCount] = useState(0);
  
  // LocalStorage'dan sepetteki ürün sayısını al
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      setProductCount(cartItems.length);
    }
  }, []);
  
  // LocalStorage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      setProductCount(cartItems.length);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClick = () => {
    if (session) {
      router.push('/cart');
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
      
      {productCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {productCount}
        </div>
      )}
    </div>
  );
};

export default Cart; 