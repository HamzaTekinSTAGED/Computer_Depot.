"use client";

import React from 'react';
import Comments, { CommentData } from './comments'; // Import the Comments component and CommentData type

// Update props to accept comments array
interface CommentTableForProductProps {
  // productId: number; // Removed productId
  comments: CommentData[];
}

const CommentTableForProduct: React.FC<CommentTableForProductProps> = ({ comments }) => {
  // Basic structure, you can add more layout, headers, etc.
  return (
    <div className="mt-8 p-4 border-t">
      <h3 className="text-xl font-semibold mb-4">Product Reviews</h3>
      {/* Pass the received comments array to the Comments component */}
      <Comments comments={comments} /> 
    </div>
  );
};

export default CommentTableForProduct; 