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
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
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

  return (
    <div className="flex h-screen relative">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-64" : "ml-20"} overflow-y-auto`}>
        <div className="max-w-6xl mx-auto mt-10 p-8 space-y-8">
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
              <div className="text-center p-4">Loading comments...</div>
            ) : commentsError ? (
              <div className="text-center p-4 text-red-600">Error loading comments: {commentsError}</div>
            ) : session ? (
              userComment && !isEditingComment ? (
                 renderUserComment(userComment)
              ) : (
                 <AddComment 
                    productId={product.productID} 
                    onCommentAdded={handleCommentAdded}
                    initialComment={isEditingComment ? userComment : null}
                 />
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
        {session && <UserInfo session={session} />}
      </div>
    </div>
  );
} 