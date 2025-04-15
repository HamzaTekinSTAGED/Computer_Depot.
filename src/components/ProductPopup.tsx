import { FC, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

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
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const { data: session } = useSession();

  // Sepete ekleme fonksiyonu
  const handleAddToCart = async () => {
    if (!session) {
      setMessage({ text: 'Sepete ürün eklemek için giriş yapmalısınız', type: 'error' });
      return;
    }

    try {
      setIsAddingToCart(true);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.productID,
          quantity: quantity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sepete ekleme başarısız oldu');
      }

      setMessage({ text: 'Ürün sepete eklendi', type: 'success' });

      // Mesajı 3 saniye sonra temizle
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      setMessage({
        text: error instanceof Error ? error.message : 'Sepete ekleme başarısız oldu',
        type: 'error'
      });

      // Mesajı 3 saniye sonra temizle
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } finally {
      setIsAddingToCart(false);
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

        {message && (
          <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

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
            <p className="text-gray-600">Miktar: {product.amount}</p>
            <p className="text-gray-600">Kategori: {product.category.name}</p>

            <div className="flex items-center space-x-2">
              <label htmlFor="quantity" className="text-gray-700">Miktar:</label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border rounded-md px-2 py-1"
              >
                {[...Array(product.amount)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? "Ekleniyor..." : "Sepete Ekle"}
              </button>

              <button
                onClick={() => onPurchase(product.productID)}
                disabled={isPurchasing}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isPurchasing ? "Satın Alınıyor..." : "Hemen Satın Al"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPopup; 