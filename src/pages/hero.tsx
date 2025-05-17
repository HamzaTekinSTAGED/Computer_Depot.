import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "../components/sidebar";
import UserInfo from "../components/UserInfo";
import { useRoleBasedRedirect } from "../functions/functions";
import LoadingSpinner from "../components/loading";
import ProductPopup from "../components/ProductPopup";
import Image from "next/image";
import { calculateAverageRating } from "../utils/ratingUtils";
import { Category, Product, Favorite } from "@/types";
import FilterProduct from "../components/filterProduct";
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const HeroPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterValues, setFilterValues] = useState({
    selectedCategoryIds: [] as number[],
    dateRange: "",
    minPrice: "",
    maxPrice: "",
  });
  const [favoriteProductIds, setFavoriteProductIds] = useState<number[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/Authentication/login");
    }
  }, [status, router]);

  useRoleBasedRedirect(status, session, setIsLoading);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) {
          throw new Error("Kategoriler getirilemedi.");
        }
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Kategori hatası:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProductsAndFavorites = async () => {
      try {
        setIsLoading(true);
        const productsRes = await fetch("/api/products");
        if (!productsRes.ok) {
          throw new Error("Failed to fetch products.");
        }
        const productsData = await productsRes.json();
        const filteredProducts = productsData.filter((product: Product) => 
          product.userID !== Number(session?.user?.id)
        );

        const productsWithComments = await Promise.all(
          filteredProducts.map(async (product: Product) => {
            try {
              const commentsRes = await fetch(`/api/comment/${product.productID}`);
              if (commentsRes.ok) {
                const comments = await commentsRes.json();
                return { ...product, comments };
              }
              return product;
            } catch (error) {
              console.error(`Error fetching comments for product ${product.productID}:`, error);
              return product;
            }
          })
        );

        setProducts(productsWithComments);
        setFilteredProducts(productsWithComments);

        if (session?.user?.id) {
          const favoritesRes = await fetch("/api/favorite");
          if (favoritesRes.ok) {
            const favoritesData: Favorite[] = await favoritesRes.json();
            setFavoriteProductIds(favoritesData.map(fav => fav.productId));
          } else {
            console.error("Error fetching favorites:", favoritesRes.statusText);
          }
        }

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchProductsAndFavorites();
    }
  }, [session?.user?.id]);

  const handleFilterChange = useCallback((filters: typeof filterValues) => {
    setFilterValues(filters);
  }, []);

  useEffect(() => {
    const now = new Date();
    let filtered = products.filter((product) => {
      const categoryMatch = filterValues.selectedCategoryIds.length === 0 || filterValues.selectedCategoryIds.includes(product.categoryID);
      let dateMatch = true;
      if (filterValues.dateRange) {
        const productDate = new Date(product.publishingDate);
        let diff = (now.getTime() - productDate.getTime()) / (1000 * 60 * 60 * 24);
        if (filterValues.dateRange === "1week") dateMatch = diff <= 7;
        else if (filterValues.dateRange === "1month") dateMatch = diff <= 30;
        else if (filterValues.dateRange === "3month") dateMatch = diff <= 90;
        else if (filterValues.dateRange === "6month") dateMatch = diff <= 180;
      }
      let priceMatch = true;
      if (filterValues.minPrice !== "" && !isNaN(Number(filterValues.minPrice))) priceMatch = product.price >= Number(filterValues.minPrice);
      if (filterValues.maxPrice !== "" && !isNaN(Number(filterValues.maxPrice))) priceMatch = priceMatch && product.price <= Number(filterValues.maxPrice);
      return categoryMatch && dateMatch && priceMatch;
    });
    setFilteredProducts(filtered);
  }, [filterValues, products]);

  const handleProductClick = (product: Product) => {
    router.push(`/buying/product/${product.productID}`);
  };

  const handleClosePopup = () => {
    setSelectedProduct(null);
  };

  const handlePurchase = async (productId: number) => {
    try {
      setIsPurchasing(productId);
      const response = await fetch("/api/trade-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Purchase failed");
      }

      setProducts(products.map(product => {
        if (product.productID === productId) {
          return {
            ...product,
            amount: product.amount - 1
          };
        }
        return product;
      }));
      setFilteredProducts(filteredProducts.map(product => {
        if (product.productID === productId) {
          return {
            ...product,
            amount: product.amount - 1
          };
        }
        return product;
      }));
      setSelectedProduct(null);
    } catch (error) {
      console.error("Purchase error:", error);
      alert(error instanceof Error ? error.message : "Purchase failed");
    } finally {
      setIsPurchasing(null);
    }
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
              <h1 className="text-4xl font-semibold text-center mb-6">Products Lists</h1>
              <h1 className="text-sm font-semibold text-center mb-6">Find the best tech equipment - quickly and easily!</h1>
              
              {/* Filtreleme Alanı */}
              <FilterProduct 
                categories={categories} 
                onFilterChange={handleFilterChange} 
                pageType="list-items"
              />
              
              {/* Ürün Listesi */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
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
                              onClick={() => handleProductClick(product)}
                            >
                              {product.title}
                            </h2>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
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
                          <p className="text-gray-600 text-sm">{product.category?.name || 'Uncategorized'}</p>
                          <p className="text-gray-800 text-lg mt-2 font-medium">${product.price}</p>
                          <p className="text-gray-600 text-sm">Amount: {product.amount}</p>
                          {product.amount === 0 && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-semibold">
                              Sold Out
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-500 col-span-full">No products found.</p>
                )}
              </div>
            </div>
          ) : null}
        </main>

        {/* User Info */}
        {session && <UserInfo session={session!} />}

        {/* Pop-up */}
        {selectedProduct && (
          <ProductPopup
            product={selectedProduct!}
            onClose={handleClosePopup}
            onPurchase={handlePurchase}
            isPurchasing={isPurchasing === selectedProduct!.productID}
          />
        )}
      </div>
    </div>
  );
};

export default HeroPage;
