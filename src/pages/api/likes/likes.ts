import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { commentUserId, commentProductId } = req.body;

    if (!commentUserId || !commentProductId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        userID: Number(session.user.id),
        commentUserID: commentUserId,
        commentProductID: commentProductId,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userID_commentUserID_commentProductID: {
            userID: Number(session.user.id),
            commentUserID: commentUserId,
            commentProductID: commentProductId,
          },
        },
      });

      await prisma.comment.update({
        where: {
          userId_productId: {
            userId: commentUserId,
            productId: commentProductId,
          },
        },
        data: {
          getLiked: {
            decrement: 1,
          },
        },
      });

      return res.status(200).json({
        message: 'Like removed successfully',
        action: 'removed',
        isLiked: false
      });
    }

    await prisma.like.create({
      data: {
        userID: Number(session.user.id),
        commentUserID: commentUserId,
        commentProductID: commentProductId,
        isLiked: true,
      },
    });

    await prisma.comment.update({
      where: {
        userId_productId: {
          userId: commentUserId,
          productId: commentProductId,
        },
      },
      data: {
        getLiked: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({
      message: 'Like added successfully',
      action: 'added',
      isLiked: true
    });

  } catch (error) {
    console.error('Error in like handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 