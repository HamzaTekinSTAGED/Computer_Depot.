"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CommentData, ReplyData } from '@/types';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const [localComments, setLocalComments] = useState(comments);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const handleLike = async (commentUserId: number, commentProductId: number) => {
    try {
      const commentKey = `${commentUserId}-${commentProductId}`;
      const isLiked = likedComments.has(commentKey);

      const response = await fetch('/api/comments/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: commentUserId,
          productId: commentProductId,
          action: isLiked ? 'unlike' : 'like'
        }),
      });

      if (response.ok) {
        // Yerel state'i güncelle
        setLocalComments(prevComments =>
          prevComments.map(comment =>
            comment.userId === commentUserId && comment.productId === commentProductId
              ? {
                ...comment,
                getLiked: isLiked
                  ? (comment.getLiked || 0) - 1
                  : (comment.getLiked || 0) + 1
              }
              : comment
          )
        );

        // Beğeni durumunu güncelle
        setLikedComments(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.delete(commentKey);
          } else {
            newSet.add(commentKey);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Beğeni hatası:', error);
    }
  };

  if (localComments.length === 0) {
    return <div className="text-center p-4 text-gray-500"> - - - </div>;
  }

  return (
    <div className="space-y-4 mt-6">
      {localComments.map((comment) => {
        const commentKey = `${comment.userId}-${comment.productId}`;
        const isLiked = likedComments.has(commentKey);

        return (
          <div key={comment.id || commentKey} className="bg-white p-4 rounded-lg shadow">
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

                {/* Beğeni butonu ve sayacı */}
                <div className="flex items-center mt-2 space-x-2">
                  <button
                    onClick={() => handleLike(comment.userId, comment.productId)}
                    className={`flex items-center space-x-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-blue-500'
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill={isLiked ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="text-sm">{comment.getLiked || 0}</span>
                  </button>
                </div>

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
            {comment.replies && comment.replies.length > 0 && (
              <ReplyDisplay replies={comment.replies} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Comments; 