"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CommentData } from './comments';

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
    <div className={`mt-8 p-6 border rounded-lg shadow-md ${isEditing ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
      <h3 className="text-xl font-semibold mb-4">{isEditing ? 'Update Your Comment' : 'Leave a Comment'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="star" className="block text-sm font-medium text-gray-700 mb-1">Rating:</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStar(s)}
                className={`p-2 rounded-full text-xl transition-colors ${star >= s ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                aria-label={`Rate ${s} out of 5 stars`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment (Optional):</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={200}
            className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Share your thoughts about the product..."
          />
          <p className="text-sm text-gray-500 mt-1 text-right">{comment.length}/200</p>
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
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