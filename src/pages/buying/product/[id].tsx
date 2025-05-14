"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Sidebar from "../../../components/sidebar";
import UserInfo from "../../../components/UserInfo";
import Image from "next/image";
import CommentTableForProduct from "../../../components/commentTableForProduct";
import AddComment from "../../../components/addComment";
import { CommentData } from "../../../types";
import LoadingSpinner from "../../../components/loading";
import { calculateAverageRating } from "../../../utils/ratingUtils";
import { Product } from "../../../types";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [allComments, setAllComments] = useState<CommentData[]>([]);
  const [userComment, setUserComment] = useState<CommentData | null>(null);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [refreshCommentsKey, setRefreshCommentsKey] = useState(0);

  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/products/${id}`);
          if (response.ok) {
            const data = await response.json();
            setProduct(data);
          } else {
            console.error('Error fetching product:', response.statusText);
            setProduct(null);
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          setProduct(null);
        }
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchComments = async () => {
      setCommentsLoading(true);
      setCommentsError(null);
      setUserComment(null);
      try {
        const response = await fetch(`/api/comment/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch comments');
        }
        const commentsData: CommentData[] = await response.json();

        // Beğeni durumlarını güncelle
        const updatedComments = await Promise.all(commentsData.map(async (comment) => {
          try {
            // Her yorum için beğeni durumunu kontrol et
            const likeResponse = await fetch(`/api/likes/check?commentUserId=${comment.userId}&commentProductId=${comment.productId}`);
            if (!likeResponse.ok) {
              throw new Error('Failed to check like status');
            }
            const likeData = await likeResponse.json();

            return {
              ...comment,
              currentUserLiked: likeData.isLiked || false,
              getLiked: comment.getLiked || 0
            };
          } catch (error) {
            console.error('Error checking like status:', error);
            return {
              ...comment,
              currentUserLiked: false,
              getLiked: comment.getLiked || 0
            };
          }
        }));

        setAllComments(updatedComments);

        if (currentUserId) {
          const foundUserComment = updatedComments.find(comment => comment.userId === currentUserId);
          setUserComment(foundUserComment || null);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
        setCommentsError(err instanceof Error ? err.message : 'An unknown error occurred');
        setAllComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [id, refreshCommentsKey, currentUserId]);

  const handleAddToCart = async () => {
    if (!session) {
      setMessage({ text: 'You must be logged in to add products to the cart', type: 'error' });
      return;
    }

    try {
      setIsAddingToCart(true);
      setMessage(null);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product?.productID,
          quantity: quantity
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          text: data.error || 'Failed to add to cart',
          type: 'error'
        });
        return;
      }

      setMessage({
        text: 'Product added to cart successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage({
        text: error instanceof Error ? error.message : 'Failed to add to cart',
        type: 'error'
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCommentAdded = () => {
    setRefreshCommentsKey(prevKey => prevKey + 1);
    setIsEditingComment(false);
  };

  const handleLikeComment = async (commentUserId: number, commentProductId: number) => {
    if (!currentUserId) {
      setMessage({ text: 'Please log in to like comments.', type: 'error' });
      return;
    }
    try {
      const response = await fetch('/api/likes/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentUserId: commentUserId,
          commentProductId: commentProductId,
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.message || 'Error updating like.', type: 'error' });
        return;
      }

      setAllComments(prevComments =>
        prevComments.map(comment => {
          if (comment.userId === commentUserId && comment.productId === commentProductId) {
            return {
              ...comment,
              currentUserLiked: data.isLiked,
              getLiked: data.action === 'added' ? (comment.getLiked || 0) + 1 : (comment.getLiked || 0) - 1
            };
          }
          return comment;
        })
      );

      if (userComment && userComment.userId === commentUserId && userComment.productId === commentProductId) {
        setUserComment(prev => prev ? {
          ...prev,
          currentUserLiked: data.isLiked,
          getLiked: data.action === 'added' ? (prev.getLiked || 0) + 1 : (prev.getLiked || 0) - 1
        } : null);
      }

      setMessage({
        text: data.message,
        type: 'success'
      });

    } catch (error) {
      console.error('Like error:', error);
      setMessage({ text: 'An error occurred while processing like.', type: 'error' });
    }
  };

  if (!product) {
    return (
      <div className="flex h-screen relative justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 ${isSidebarExpanded ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Product Image Section */}
              <div className="relative h-[500px] bg-gray-100 rounded-xl overflow-hidden">
                <Image
                  src={product.imageURL || '/default-product.png'}
                  alt={product.title}
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>

              {/* Product Details Section */}
              <div className="space-y-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <h1 className="text-4xl font-bold text-gray-900">{product.title}</h1>
                    <div className="flex items-center space-x-2 bg-yellow-50 px-9 py-3 rounded-full">
                      <span className="text-yellow-600 font-semibold text-xl">
                        {calculateAverageRating(allComments)}
                      </span>
                      <span className="text-yellow-500 text-2xl inline-flex items-center">★</span>
                      <span className="text-gray-600 text-sm inline-flex items-center whitespace-nowrap">
                        ({allComments.length} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-blue-600">${product.price}</span>
                    {product.amount > 0 ? (
                      <span className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                        In Stock ({product.amount} available)
                      </span>
                    ) : (
                      <span className="text-red-600 text-sm font-medium bg-red-50 px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-gray-700">{product.category.name}</span>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center space-x-4">
                      <label htmlFor="quantity" className="text-gray-700 font-medium">Quantity:</label>
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id="quantity"
                          value={quantity}
                          onChange={(e) => {
                            const value = Math.max(1, Math.min(product.maxBuyAmount, Number(e.target.value)));
                            setQuantity(value);
                          }}
                          min="1"
                          max={product.maxBuyAmount}
                          className="w-20 text-center border-x px-4 py-2 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setQuantity(prev => Math.min(product.maxBuyAmount, prev + 1))}
                          className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          disabled={quantity >= product.maxBuyAmount}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        (Buy limit: {product.maxBuyAmount})
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || product.amount === 0}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed font-medium text-lg"
                    >
                      {isAddingToCart ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>

                  {message && (
                    <div className={`p-4 rounded-xl ${message.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                      {message.text}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-200 mt-8">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
                {commentsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : commentsError ? (
                  <div className="text-center p-4 text-red-600 bg-red-50 rounded-xl">Error loading comments: {commentsError}</div>
                ) : (
                  <>
                    {session && (
                      userComment && !isEditingComment ? (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center">
                          <p className="text-gray-700">You've commented on this product. Your comment is shown below. Want to change it?</p>
                          <button
                            onClick={() => setIsEditingComment(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm whitespace-nowrap transition-colors"
                          >
                            Edit Your Comment
                          </button>
                        </div>
                      ) : (isEditingComment || !userComment) ? (
                        <div className="bg-white mb-6">
                          <AddComment
                            productId={product.productID}
                            onCommentAdded={handleCommentAdded}
                            initialComment={isEditingComment ? userComment : null}
                          />
                        </div>
                      ) : null
                    )}
                    {!session && (
                      <p className="text-center text-gray-600 my-4 p-6 border rounded-xl shadow-sm bg-gray-50">
                        Please log in to leave a comment.
                      </p>
                    )}

                    <CommentTableForProduct
                      comments={allComments}
                      onLikeComment={handleLikeComment}
                      currentUserId={currentUserId}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {session && <UserInfo session={session} />}
      </div>
    </div>
  );
}