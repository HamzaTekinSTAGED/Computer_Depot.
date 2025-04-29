"use client";

import React from 'react';
import Image from 'next/image';

interface CommentUser {
  username: string;
  image: string | null;
}

// This interface should align with the actual data structure from the API
export interface CommentData { // Exporting for use in parent component
  id?: number; // Added optional id if available from API
  userId: number;
  productId: number;
  star: number;
  comment: string | null;
  getLiked?: number; // Optional fields
  photo?: string | null; // Optional fields
  createdAt: string; // Keep as string for simplicity, format later if needed
  user: CommentUser;
}

// Updated Props: Expect an array of comments
interface CommentsProps {
  comments: CommentData[];
}

const Comments: React.FC<CommentsProps> = ({ comments }) => {
  // Removed useState for comments, isLoading, error
  // Removed useEffect for fetching

  // Handle case where comments might be loading in the parent initially
  // Parent component should handle loading state, but add a safeguard
  // if (!comments) {
  //   return <div className="text-center p-4">Loading comments...</div>;
  // }
  
  // Parent component should handle error state

  if (comments.length === 0) {
    return <div className="text-center p-4 text-gray-500">No comments yet for other users.</div>; // Updated message
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Map over the passed-in comments array */}
      {comments.map((comment) => (
        // Using comment.id if available, otherwise fallback. Ensure your API provides a unique key.
        <div key={comment.id || `${comment.userId}-${comment.productId}`} className="bg-white p-4 rounded-lg shadow flex space-x-3">
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
              <span className="font-semibold text-sm">{comment.user.username}</span>
              <span className="text-xs text-gray-500">
                 {/* Added Star display directly */}
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < comment.star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
                 <span className="ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{comment.comment || <i>No comment text provided.</i>}</p>
            {comment.photo && (
                <div className="mt-2">
                    <Image src={comment.photo} alt="Comment attachment" width={100} height={100} className="rounded" />
                </div>
            )}
            {/* Optional: Like display placeholder */}
            {/* <p className="text-xs text-gray-500 mt-1">Likes: {comment.getLiked ?? 0}</p> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comments; 