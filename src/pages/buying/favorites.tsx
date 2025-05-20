import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/sidebar';
import UserInfo from '@/components/UserInfo';
import LoadingSpinner from '@/components/loading';
import Image from 'next/image';
import { Favorite, Product } from '@/types';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline'; // Outline heart icon
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'; // Solid heart icon
import { calculateAverageRating } from '@/utils/ratingUtils';

const FavoritesPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteProducts, setFavoriteProducts] = useState<Favorite[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState<number[]>([]);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session status

    if (!session) {
      router.push('/Authentication/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/favorite');
        if (!res.ok) {
          throw new Error('Failed to fetch favorites.');
        }
        const data: Favorite[] = await res.json();
        setFavoriteProducts(data);
        setFavoriteProductIds(data.map(fav => fav.productId));
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();

  }, [session, status, router]);

  const handleProductClick = (productId: number) => {
    router.push(`/buying/product/${productId}`);
  };

  const handleToggleFavorite = async (productId: number) => {
    if (!session?.user?.id) return;

    const isFavorited = favoriteProductIds.includes(productId);
    const method = isFavorited ? 'DELETE' : 'POST';

    try {
      const response = await fetch("/api/favorite", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isFavorited ? 'remove from' : 'add to'} favorites.`);
      }

      // Update local state
      setFavoriteProducts(prevFavorites => 
        isFavorited
          ? prevFavorites.filter(fav => fav.productId !== productId)
          : prevFavorites // Should refetch or add the new favorite with product details if adding here
      );
      setFavoriteProductIds(prevIds => 
        isFavorited 
          ? prevIds.filter(id => id !== productId) 
          : [...prevIds, productId]
      );

    } catch (error) {
      console.error("Favorite toggle error:", error);
      alert(error instanceof Error ? error.message : "Failed to update favorites.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar onExpand={setIsSidebarExpanded} />

        {/* Main Content */}
        <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'ml-[304px]' : 'ml-20'}`}>
          {(status === "loading" || isLoading) ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : session ? (
            <div className="p-6 max-w-7xl mx-auto">
              <h1 className="text-4xl font-semibold text-center mb-6">My Favorites</h1>
              
              {/* Favorited Products List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {favoriteProducts.length > 0 ? (
                  favoriteProducts.map(({ product }) => { // Destructure product from the Favorite object
                    if (!product) return null; // Handle case where product might be null
                    const isFavorited = favoriteProductIds.includes(product.productID);
                    return (
                      <div 
                        key={product.productID} 
                        className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 relative cursor-pointer hover:shadow-xl transition-shadow duration-300"
                      >
                        {product.imageURL && (
                          <div className="relative w-full h-48">
                            <Image
                              src={product.imageURL}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <h2 
                              className="text-xl font-semibold text-gray-900 cursor-pointer hover:underline"
                              onClick={() => handleProductClick(product.productID)}
                            >
                              {product.title}
                            </h2>
                            {/* Favorite Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent product click when clicking heart
                                handleToggleFavorite(product.productID);
                              }}
                              className="text-red-500 hover:text-red-600 transition-colors duration-200"
                            >
                              {isFavorited ? (
                                <HeartIconSolid className="h-6 w-6" />
                              ) : (
                                <HeartIconOutline className="h-6 w-6" />
                              )}
                            </button>
                          </div>
                          <p className="text-gray-600 text-sm">{product.category?.name || ''}</p>
                          <p className="text-gray-800 text-lg mt-2 font-medium">${product.price}</p>
                          {/* Amount is not directly in the Favorite object, might need to fetch product details if needed */}
                          {/* <p className="text-gray-600 text-sm">Amount: {product.amount}</p> */}
                          {/* Sold Out logic might need adjustment based on available data */}
                          {/* {product.amount === 0 && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-semibold">
                              Sold Out
                            </div>
                          )} */}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-500 col-span-full">No favorite products found.</p>
                )}
              </div>
            </div>
          ) : null}
        </main>

        {/* User Info */}
        {session && <UserInfo session={session} />}
      </div>
    </div>
  );
};

export default FavoritesPage;
