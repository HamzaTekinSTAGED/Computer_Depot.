"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CommentData } from '@/types';

interface AddCommentProps {
  productId: number;
  onCommentAdded?: () => void;
  initialComment?: CommentData | null;
}

export default function AddComment({ productId, onCommentAdded, initialComment }: AddCommentProps) {
  const { data: session } = useSession();
  const [star, setStar] = useState<number>(initialComment?.star ?? 5);
  const [comment, setComment] = useState<string>(initialComment?.comment ?? '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (initialComment) {
      setStar(initialComment.star);
      setComment(initialComment.comment || '');
      setMessage(null);
    }
  }, [initialComment]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!session) {
      setMessage({ text: 'You must be logged in to comment.', type: 'error' });
      return;
    }

    if (star < 1 || star > 5) {
      setMessage({ text: 'Please select a star rating between 1 and 5.', type: 'error' });
      return;
    }
     if (comment.length > 200) {
         setMessage({ text: 'Comment cannot exceed 200 characters.', type: 'error' });
         return;
     }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/comment/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ star, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.error === 'You can only comment on products you have purchased.' 
          ? 'You can only comment on products you have purchased.' 
          : data.error || `Failed to ${initialComment ? 'update' : 'submit'} comment.`, 
          type: 'error' });
      } else {
        setMessage({ text: `Comment ${initialComment ? 'updated' : 'submitted'} successfully!`, type: 'success' });
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error) {
      console.error(`Error ${initialComment ? 'updating' : 'submitting'} comment:`, error);
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  const isEditing = !!initialComment;

  return (
    <div className={`mt-8 p-6 border rounded-xl shadow-sm ${isEditing ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Update Your Comment' : 'Leave a Comment'}</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="star" className="block text-lg font-medium text-gray-700 mb-2">Rating:</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStar(s)}
                className={`p-2 rounded-full text-2xl transition-all transform hover:scale-110 ${
                  star >= s 
                    ? 'text-yellow-400 hover:text-yellow-500' 
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
                aria-label={`Rate ${s} out of 5 stars`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-lg font-medium text-gray-700 mb-2">Comment (Optional):</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={200}
            className="mt-1 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base p-4 transition-colors"
            placeholder="Share your thoughts about the product..."
          />
          <p className="text-sm text-gray-500 mt-2 text-right">{comment.length}/200</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-[1.02] disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditing ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            isEditing ? 'Update Comment' : 'Submit Comment'
          )}
        </button>
      </form>
    </div>
  );
} 