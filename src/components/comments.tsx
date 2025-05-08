"use client";

import React, { useState } from 'react';
import Image from 'next/image';

import { CommentData, ReplyData } from '@/types';

// Placeholder for Reply component/list - we will create this later
const ReplyDisplay: React.FC<{ replies: ReplyData[] }> = ({ replies }) => {
  if (!replies || replies.length === 0) {
    return null;
  }
  return (
    <div className="mt-3 ml-10 space-y-2 border-l-2 border-gray-200 pl-3">
      {replies.map(reply => (
        <div key={reply.replyID} className="bg-gray-50 p-2 rounded-md shadow-sm">
          <div className="flex items-center space-x-2">
            <Image
              src={reply.user.image || '/default-avatar-400x400.png'}
              alt={`${reply.user.username}'s avatar`}
              width={25}
              height={25}
              className="rounded-full"
            />
            <span className="font-semibold text-xs">{reply.user.username} (Seller)</span>
            <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-gray-700 mt-1">{reply.text}</p>
        </div>
      ))}
    </div>
  );
};

// Updated Props: Expect an array of comments
interface CommentsProps {
  comments: CommentData[];
  isSellerView?: boolean; // To conditionally show reply button
  // Function to handle opening reply modal/form
  onInitiateReply?: (commentUserId: number, commentProductId: number) => void;
}

const Comments: React.FC<CommentsProps> = ({ comments, isSellerView = false, onInitiateReply }) => {
  // Removed useState for comments, isLoading, error
  // Removed useEffect for fetching

  // Handle case where comments might be loading in the parent initially
  // Parent component should handle loading state, but add a safeguard
  // if (!comments) {
  //   return <div className="text-center p-4">Loading comments...</div>;
  // }
  
  // Parent component should handle error state

  if (comments.length === 0) {
    return <div className="text-center p-4 text-gray-500"> - - - </div>; // Updated message
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Map over the passed-in comments array */}
      {comments.map((comment) => (
        // Using comment.id if available, otherwise fallback. Ensure your API provides a unique key.
        <div key={comment.id || `${comment.userId}-${comment.productId}`} className="bg-white p-4 rounded-lg shadow">
          <div className="flex space-x-3">
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
              {isSellerView && onInitiateReply && (
                <button
                  onClick={() => onInitiateReply(comment.userId, comment.productId)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Give Reply
                </button>
              )}
            </div>
          </div>
          {/* Display replies if they exist */}
          {comment.replies && comment.replies.length > 0 && (
            <ReplyDisplay replies={comment.replies} />
          )}
        </div>
      ))}
    </div>
  );
};

export default Comments; 