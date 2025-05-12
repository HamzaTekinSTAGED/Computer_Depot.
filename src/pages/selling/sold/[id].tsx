"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Sidebar from "../../../components/sidebar";
import UserInfo from "../../../components/UserInfo";
import Image from "next/image";
import CommentTableForProduct from "../../../components/commentTableForProduct";
import { checkIfUserIsSellerOfProduct } from "../../../utils/accessControl";
import { CommentData, ReplyData } from "../../../types";
import LoadingSpinner from "../../../components/loading";
import { Product } from "../../../types";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [allComments, setAllComments] = useState<CommentData[]>([]);
  const [userComment, setUserComment] = useState<CommentData | null>(null);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [refreshCommentsKey, setRefreshCommentsKey] = useState(0);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isAccessChecking, setIsAccessChecking] = useState(true);

  // State for reply functionality
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState<{ userId: number; productId: number } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // To check if the user really the seller of the product
  useEffect(() => {
    if (!id || Array.isArray(id) || !session?.user?.id) {
      setHasAccess(false);
      setIsAccessChecking(false);
      return;
    }

    setIsAccessChecking(true);
    checkIfUserIsSellerOfProduct(id, Number(session.user.id))
      .then(accessGranted => {
        setHasAccess(accessGranted);
      })
      .catch(err => {
        console.error("Access check failed:", err);
        setHasAccess(false);
      })
      .finally(() => {
        setIsAccessChecking(false);
      });
  }, [id, session]);

  // Get product infos from database
  useEffect(() => {
    const fetchProduct = async () => {
      if (id && hasAccess !== false) {
        try {
          const response = await fetch(`/api/products/${id}`);
          if (response.ok) {
            const data = await response.json();
            setProduct(data);
            // Mark new comment as read if user is the seller and new comment exists
            if (data.newCommentExist && hasAccess === true) {
              fetch(`/api/products/${id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newCommentExist: false }),
              });
            }
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
  }, [id, hasAccess]);

  // Get comments from database
  useEffect(() => {
    if (!id || hasAccess === false) return;

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
  }, [id, session, refreshCommentsKey, hasAccess]);

  const handleInitiateReply = (commentUserId: number, commentProductId: number) => {
    setReplyingToComment({ userId: commentUserId, productId: commentProductId });
    setShowReplyModal(true);
    setReplyText("");
    setReplyError(null);
  };

  const handleReplySubmit = async () => {
    if (!replyingToComment || !replyText.trim() || !session?.user?.id) {
      setReplyError("Cannot submit empty reply or not properly initiated.");
      return;
    }

    setIsSubmittingReply(true);
    setReplyError(null);

    try {
      const response = await fetch('/api/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentUserId: replyingToComment.userId,
          commentProductId: replyingToComment.productId,
          text: replyText.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit reply.");
      }

      const newReply: ReplyData = await response.json();

      setAllComments(prevComments =>
        prevComments.map(comment =>
          comment.userId === replyingToComment.userId && comment.productId === replyingToComment.productId
            ? {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            }
            : comment
        )
      );

      setShowReplyModal(false);
      setReplyingToComment(null);
      setReplyText("");

    } catch (error) {
      console.error("Error submitting reply:", error);
      setReplyError(error instanceof Error ? error.message : "An unknown error occurred while submitting reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Consolidated Loading State
  const isLoading = !id || status === "loading" || isAccessChecking || (hasAccess === true && !product);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Explicit Access Denied State (checked after loading)
  if (hasAccess === false) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-600 font-semibold">
          Sorry, you don't have access to this page.
        </p>
      </div>
    );
  }

  // Product not found (or error fetching product) after access check passed
  if (!product) {
    return (
      <div className="flex h-screen relative justify-center items-center">
        <p className="text-xl text-red-600 font-semibold">
          Could not load product details.
        </p>
      </div>
    );
  }

  // Calculating Average Rating
  const calculateAverageRating = (comments: CommentData[]) => {
    if (comments.length === 0) return 0;
    const totalStars = comments.reduce((sum, comment) => sum + comment.star, 0);
    return (totalStars / comments.length).toFixed(1);
  };

  // PAGE
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
                    {product.amount > 0 && (
                      <span className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                        In Stock ({product.amount} available)
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
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-gray-200 mt-8">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
                {!commentsLoading && !commentsError && product && (
                  <CommentTableForProduct
                    comments={allComments.filter(c => c.userId !== Number(session?.user?.id || 0))}
                    isSellerView={hasAccess === true}
                    onInitiateReply={handleInitiateReply}
                    onLikeComment={async () => Promise.resolve()}
                    currentUserId={session?.user?.id ? Number(session.user.id) : 0}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        {session && <UserInfo session={session} />}
      </div>

      {/* Reply Modal - Enhanced Design */}
      {showReplyModal && replyingToComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Reply to Comment</h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            {replyError && (
              <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded-lg">{replyError}</p>
            )}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyingToComment(null);
                  setReplyError(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                disabled={isSubmittingReply}
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                disabled={isSubmittingReply || !replyText.trim()}
              >
                {isSubmittingReply ? <LoadingSpinner /> : "Submit Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}