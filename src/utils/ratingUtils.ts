export interface Comment {
  star: number;
}

export const calculateAverageRating = (comments: Comment[] | undefined): string => {
  if (!comments || comments.length === 0) return "--";
  const totalStars = comments.reduce((sum, comment) => sum + comment.star, 0);
  return (totalStars / comments.length).toFixed(1);
}; 