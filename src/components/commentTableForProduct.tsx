"use client";

import React from 'react';
import Comments from './comments'; // Import the Comments component and CommentData type
import { CommentData } from '@/types';
// Update props to accept comments array
interface CommentTableForProductProps {
  // productId: number; // Removed productId
  comments: CommentData[];
  isSellerView?: boolean;
  onInitiateReply?: (commentUserId: number, commentProductId: number) => void;
  onLikeComment: (commentUserId: number, commentProductId: number) => Promise<void>;
  currentUserId: number | null;
}

const CommentTableForProduct: React.FC<CommentTableForProductProps> = ({ comments, isSellerView, onInitiateReply, onLikeComment, currentUserId }) => {
  // Basic structure, you can add more layout, headers, etc.
  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Reviews</h3>
      <Comments
        comments={comments}
        isSellerView={isSellerView}
        onInitiateReply={onInitiateReply}
        onLikeComment={onLikeComment}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default CommentTableForProduct; 