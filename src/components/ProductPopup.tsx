import { FC } from 'react';
import Image from 'next/image';

interface Product {
  title: string;
  description: string;
  price: number;
  amount: number;
  category: {
    name: string;
  };
  imageURL: string;
  productID: number;
}

interface ProductPopupProps {
  product: Product;
  onClose: () => void;
  onPurchase: (productId: number) => void;
  isPurchasing: boolean;
}

const ProductPopup: FC<ProductPopupProps> = ({ product, onClose, onPurchase, isPurchasing }) => {
  // Sepete ekleme fonksiyonu
  const handleAddToCart = () => {
    if (typeof window !== 'undefined') {
      // Mevcut sepeti al
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      // Ürün zaten sepette mi kontrol et
      const isAlreadyInCart = cartItems.some((item: any) => item.productID === product.productID);
      
      if (!isAlreadyInCart) {
        // Ürünü sepete ekle
        cartItems.push({
          productID: product.productID,
          title: product.title,
          price: product.price,
          imageURL: product.imageURL
        });
        
        // Sepeti güncelle
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        // Storage event'ini manuel olarak tetikle (aynı pencerede çalışması için)
        window.dispatchEvent(new Event('storage'));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-64 md:h-80">
            {product.imageURL && (
              <Image
                src={product.imageURL}
                alt={product.title}
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">{product.title}</h2>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-lg font-medium">${product.price}</p>
            <p className="text-gray-600">Amount: {product.amount}</p>
            <p className="text-gray-600">Category: {product.category.name}</p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Add to Cart
              </button>
              
              <button
                onClick={() => onPurchase(product.productID)}
                disabled={isPurchasing}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isPurchasing ? "Purchasing..." : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPopup; 