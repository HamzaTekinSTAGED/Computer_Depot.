"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Sidebar from "../../../components/sidebar";
import UserInfo from "../../../components/UserInfo";
import Image from "next/image";
import CommentTableForProduct from "../../../components/commentTableForProduct";
import {checkIfUserIsSellerOfProduct} from "../../../utils/accessControl";
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [allComments, setAllComments] = useState<CommentData[]>([]);
  const [userComment, setUserComment] = useState<CommentData | null>(null);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [refreshCommentsKey, setRefreshCommentsKey] = useState(0);
  const [hasAccess, setHasAccess] = useState<boolean>(true); 

  // To check if the user really the seller of the product
  useEffect(() => {
    if (!id || Array.isArray(id) || !session?.user?.id) return;
  
    checkIfUserIsSellerOfProduct(id, Number(session.user.id))
      .then(setHasAccess)
      .catch(err => {
        console.error("Access check failed:", err);
        setHasAccess(false);
      });
  }, [id, session]);

  // Get product infos from database
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

  // Get comments from database
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


  // While these operation happens loading state shown
  const isLoading = !id || status === "loading" || hasAccess === null;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // If user not the seller dont let go to page
  if (!hasAccess) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-600 font-semibold">
          Sorry, you don't have access to this page.
        </p>
      </div>
    );
  }

  // Till the product brought from database, user will see loadind spinner
  if (!product) {
    return (
      <div className="flex h-screen relative justify-center items-center">
        <LoadingSpinner />
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
              </div>
            </div>

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