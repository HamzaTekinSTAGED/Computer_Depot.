"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { calculateAverageRating } from "../../utils/ratingUtils";
import { CommentData } from "../../types";

export default function SoldProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [allComments, setAllComments] = useState<CommentData[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/comment/${id}`);
        if (response.ok) {
          const data = await response.json();
          setAllComments(data);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [id]);

  return (
    <div>
      <div className="flex items-center space-x-2 bg-yellow-50 px-6 py-3 rounded-full">
        <span className="text-yellow-600 font-semibold text-xl">
          {calculateAverageRating(allComments)}
        </span>
        <span className="text-yellow-500 text-2xl inline-flex items-center">★</span>
        <span className="text-gray-600 text-sm inline-flex items-center">
          ({allComments.length} reviews)
        </span>
      </div>
    </div>
  );
} 