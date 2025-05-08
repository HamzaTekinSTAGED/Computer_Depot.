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
    <div className="mt-8 p-4 border-t">
      <h3 className="text-xl font-semibold mb-4">Product Reviews</h3>
      {/* Pass the received comments array and new props to the Comments component */}
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