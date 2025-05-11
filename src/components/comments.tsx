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
    <div className="mt-4 ml-8 space-y-3 border-l-2 border-gray-200 pl-4">
      {replies.map(reply => (
        <div key={reply.replyID} className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <Image
              src={reply.user.image || '/default-avatar-400x400.png'}
              alt={`${reply.user.username}'s avatar`}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{reply.user.username}</span>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Seller</span>
              <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-2 ml-11">{reply.text}</p>
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
  onLikeComment: (commentUserId: number, commentProductId: number) => Promise<void>;
  currentUserId: number | null;
}

const Comments: React.FC<CommentsProps> = ({ comments, isSellerView = false, onInitiateReply, onLikeComment, currentUserId }) => {
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
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id || `${comment.userId}-${comment.productId}`} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <Image
                src={comment.user.image || '/default-avatar-400x400.png'}
                alt={`${comment.user.username}'s avatar`}
                width={48}
                height={48}
                className="rounded-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-base">{comment.user.username}</span>
                  <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < comment.star ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-base text-gray-700 mt-2">{comment.comment || <i>No comment text provided.</i>}</p>
              {comment.photo && (
                <div className="mt-3">
                  <Image 
                    src={comment.photo} 
                    alt="Comment attachment" 
                    width={120} 
                    height={120} 
                    className="rounded-lg object-cover" 
                  />
                </div>
              )}
              <div className="flex items-center mt-4 space-x-6">
                {currentUserId && (
                  <button
                    onClick={() => onLikeComment(comment.userId, comment.productId)}
                    className={`text-sm font-medium flex items-center space-x-2 transition-colors ${
                      comment.currentUserLiked 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-gray-500 hover:text-red-400'
                    }`}
                    title={comment.currentUserLiked ? "Unlike" : "Like"}
                  >
                    <span className="text-lg">{comment.currentUserLiked ? '❤' : '♡'}</span>
                    <span>{comment.getLiked || 0}</span>
                  </button>
                )}
                {!currentUserId && comment.getLiked !== undefined && (
                  <span className="text-sm text-gray-500 flex items-center space-x-2">
                    <span className="text-lg">♡</span>
                    <span>{comment.getLiked || 0}</span>
                  </span>
                )}
                {isSellerView && onInitiateReply && (
                  <button
                    onClick={() => onInitiateReply(comment.userId, comment.productId)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <ReplyDisplay replies={comment.replies} />
          )}
        </div>
      ))}
    </div>
  );
};

export default Comments; 