import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getSession({ req });

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ error: 'Unauthorized. Please log in to like a comment.' });
  }

  const userId = Number(session.user.id); // ID of the user performing the action
  const { commentUserId, commentProductId } = req.body;

  if (typeof commentUserId !== 'number' || typeof commentProductId !== 'number') {
    return res.status(400).json({ error: 'Invalid input: commentUserId and commentProductId must be numbers.' });
  }

  try {
    // Find the existing like, if any
    const existingLike = await prisma.like.findUnique({
      where: {
        userID_commentUserID_commentProductID: {
          userID: userId,
          commentUserID: commentUserId,
          commentProductID: commentProductId,
        },
      },
    });

    let newIsLikedStatus: boolean;

    if (existingLike) {
      // Toggle the like status
      newIsLikedStatus = !existingLike.isLiked;
      await prisma.like.update({
        where: {
          userID_commentUserID_commentProductID: {
            userID: userId,
            commentUserID: commentUserId,
            commentProductID: commentProductId,
          },
        },
        data: {
          isLiked: newIsLikedStatus,
        },
      });
    } else {
      // Create a new like
      newIsLikedStatus = true;
      await prisma.like.create({
        data: {
          userID: userId,
          commentUserID: commentUserId,
          commentProductID: commentProductId,
          isLiked: newIsLikedStatus,
        },
      });
    }

    // Update the getLiked count on the Comment model
    const likesCount = await prisma.like.count({
      where: {
        commentUserID: commentUserId,
        commentProductID: commentProductId,
        isLiked: true,
      },
    });

    const updatedComment = await prisma.comment.update({
      where: {
        userId_productId: {
          userId: commentUserId,
          productId: commentProductId,
        },
      },
      data: {
        getLiked: likesCount,
      },
    });

    return res.status(200).json({ 
      message: `Successfully ${newIsLikedStatus ? 'liked' : 'unliked'} comment.`, 
      getLiked: updatedComment.getLiked,
      isLiked: newIsLikedStatus // Return the new like status for the current user
    });

  } catch (error) {
    console.error('Error processing like request:', error);
    // Check for specific Prisma errors if needed, e.g., record not found for comment update
    if (error instanceof Error) {
        // Check if the error is related to the comment not being found during the update
        // This is a simplified check; Prisma might throw different error types/codes
        if (error.message.includes("Record to update not found")) {
            return res.status(404).json({ error: 'Comment not found when trying to update like count.' });
        }
        return res.status(500).json({ error: 'Failed to process like request.', details: error.message });
    }
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  } finally {
    await prisma.$disconnect();
  }
} 