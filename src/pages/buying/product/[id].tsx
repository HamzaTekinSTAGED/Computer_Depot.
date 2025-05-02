"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Sidebar from "../../../components/sidebar";
import UserInfo from "../../../components/UserInfo";
import Image from "next/image";
import CommentTableForProduct from "../../../components/commentTableForProduct";
import AddComment from "../../../components/addComment";
import { CommentData } from "../../../components/comments";
import LoadingSpinner from "../../../components/loading";

interface Product {
  title: string;
  description: string;
  price: number;
  amount: number;
  maxBuyAmount: number;
  category: {
    name: string;
  };
  imageURL: string | null;
  productID: number;
}

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
        setAllComments(commentsData);

        if (session?.user?.id) {
          const foundUserComment = commentsData.find(comment => comment.userId === Number(session.user.id));
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
  }, [id, session, refreshCommentsKey]);

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

  if (!product) {
    return (
      <div className="flex h-screen relative justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  const renderUserComment = (comment: CommentData) => (
    <div className="bg-blue-50 p-4 rounded-lg shadow flex space-x-3 border border-blue-200">
       <div className="flex-shrink-0">
          <Image
              src={comment.user.image || '/default-avatar-400x400.png'}
              alt={`${comment.user.username}'s avatar`}
              width={40}
              height={40}
              className="rounded-full"
          />
       </div>
       <div className="flex-1">
          <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">{comment.user.username} (Your Comment)</span>
              <span className="text-xs text-gray-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < comment.star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
                <span className="ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">{comment.comment || <i>No comment text provided.</i>}</p>
          <button 
            onClick={() => setIsEditingComment(true)}
            className="mt-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded"
          >
            Change Comment
          </button>
       </div>
    </div>
  );

  // Ortalama yıldız değerlendirmesini hesaplayan fonksiyon
  const calculateAverageRating = (comments: CommentData[]) => {
    if (comments.length === 0) return 0;
    const totalStars = comments.reduce((sum, comment) => sum + comment.star, 0);
    return (totalStars / comments.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 ${isSidebarExpanded ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative h-96">
                <Image
                  src={product.imageURL || '/default-product.png'}
                  alt={product.title}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold">{product.title}</h1>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded">
                    <span className="text-yellow-500 font-semibold text-lg">
                      {calculateAverageRating(allComments)}
                    </span>
                    <span className="text-yellow-500 text-2xl">★</span>
                    <span className="text-gray-600 text-sm ml-1">
                      ({allComments.length} reviews)
                    </span>
                  </div>
                </div>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-lg font-medium">${product.price}</p>
                <p className="text-gray-600">Quantity: {product.amount}</p>
                <p className="text-gray-600">Category: {product.category.name}</p>

                <div className="flex items-center space-x-2">
                  <label htmlFor="quantity" className="text-gray-700">Quantity:</label>
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1 hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => {
                        const value = Math.max(1, Math.min(product.amount, Number(e.target.value)));
                        setQuantity(value);
                      }}
                      min="1"
                      max={product.amount}
                      className="w-16 text-center border-x px-2 py-1 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setQuantity(prev => Math.min(product.amount, prev + 1))}
                      className="px-3 py-1 hover:bg-gray-100"
                      disabled={quantity >= product.amount}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    (Max: {product.amount})
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.amount === 0}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                </div>

                {message && (
                  <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 p-4 border-t space-y-4">
              <h3 className="text-xl font-semibold mb-4">Product Reviews</h3>

              {commentsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                </div>
              ) : commentsError ? (
                <div className="text-center p-4 text-red-600">Error loading comments: {commentsError}</div>
              ) : session ? (
                userComment && !isEditingComment ? (
                  renderUserComment(userComment)
                ) : (
                  <div className="text-center p-6 border rounded-lg shadow-md bg-white">
                    <p className="text-gray-600 mb-4">You can add a comment after buying the product.</p>
                    <AddComment 
                      productId={product.productID} 
                      onCommentAdded={handleCommentAdded}
                      initialComment={isEditingComment ? userComment : null}
                    />
                  </div>
                )
              ) : (
                <p className="text-center text-gray-600 my-4 p-6 border rounded-lg shadow-md bg-white">Please log in to leave a comment.</p>
              )}

              {session && userComment && !isEditingComment && <hr className="my-6"/>}

              {!commentsLoading && !commentsError && product && 
                <CommentTableForProduct 
                  comments={allComments.filter(c => c.userId !== Number(session?.user?.id || 0))}
                />
              }
            </div>
          </div>
        </div>
        {session && <UserInfo session={session} />}
      </div>
    </div>
  );
}