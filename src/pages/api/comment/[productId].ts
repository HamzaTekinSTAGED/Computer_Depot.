import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { productId } = req.query;
  const id = Number(productId);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  // Handle GET request to fetch comments
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const currentUserId = session?.user?.id ? Number(session.user.id) : null;

      const commentsData = await prisma.comment.findMany({
        where: { productId: id },
        include: {
          user: {
            select: {
              username: true,
              image: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  username: true,
                  image: true,
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
          // We will fetch likes separately if a user is logged in
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (currentUserId) {
        // Fetch all 'true' likes by the current user for the comments of this product
        const userLikes = await prisma.like.findMany({
          where: {
            userID: currentUserId,
            commentProductID: id, // All comments are for this product
            isLiked: true,
          },
          select: {
            commentUserID: true, // We only need to know which comment (by its author's ID) was liked
            // commentProductID is already known (it's `id`)
          }
        });

        // Create a set of commentUserIds that the current user has liked for efficient lookup
        const likedCommentUserIds = new Set(userLikes.map(like => like.commentUserID));

        // Augment comments with currentUserLiked status
        const commentsWithLikeStatus = commentsData.map(comment => ({
          ...comment,
          currentUserLiked: likedCommentUserIds.has(comment.userId),
        }));
        return res.status(200).json(commentsWithLikeStatus);

      } else {
        // If no user is logged in, add currentUserLiked: false (or undefined, which is fine)
        const commentsWithLikeStatus = commentsData.map(comment => ({
          ...comment,
          currentUserLiked: false, // Explicitly false if no session
        }));
        return res.status(200).json(commentsWithLikeStatus);
      }

    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  } 
  // Handle POST request to add or update a comment
  else if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      console.log("API LOG: Returning 401 - Unauthorized (No session/user ID)");
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    const userId = Number(session.user.id);
    const { star, comment } = req.body;

    // Validate input
    if (typeof star !== 'number' || star < 1 || star > 5) {
        console.log("API LOG: Returning 400 - Invalid star input");
        return res.status(400).json({ error: 'Star rating must be a number between 1 and 5.' });
    }
    if (comment && typeof comment !== 'string') {
        console.log("API LOG: Returning 400 - Invalid comment type");
        return res.status(400).json({ error: 'Comment must be a string.' });
    }
     if (comment && comment.length > 200) {
         console.log("API LOG: Returning 400 - Comment too long");
         return res.status(400).json({ error: 'Comment cannot exceed 200 characters.' });
     }

    try {
      // Check if the user has purchased this product
      console.log(`API LOG: Checking purchase history for userId: ${userId}, productId: ${id}`);
      const purchaseRecord = await prisma.tradeHistory.findFirst({
        where: {
          buyerID: userId,
          productID: id,
        },
      });

      if (!purchaseRecord) {
        console.log("API LOG: Returning 403 - User has not purchased this product");
        return res.status(403).json({ error: 'You can only comment on products you have purchased.' });
      }

      // Use upsert to create or update the comment
      console.log("API LOG: Purchase verified, proceeding with comment upsert");

      // Use a transaction to ensure both operations succeed or fail together
      const [newOrUpdatedComment] = await prisma.$transaction([
        prisma.comment.upsert({
          where: {
            userId_productId: {
              userId: userId,
              productId: id,
            },
          },
          update: {
            star: star,
            comment: comment || null,
          },
          create: {
            userId: userId,
            productId: id,
            star: star,
            comment: comment || null,
          },
          include: {
            user: {
              select: {
                username: true,
                image: true,
              },
            },
          }
        }),
        prisma.product.update({
          where: { productID: id },
          data: { newCommentExist: true }
        })
      ]);

      console.log("API LOG: Returning 201 - Comment upsert and product update successful");
      return res.status(201).json(newOrUpdatedComment);

    } catch (error) {
      console.error('API ERROR: Failed to add/update comment:', error);
      console.log("API LOG: Returning 500 - Internal server error during add/update");
      return res.status(500).json({ error: 'Failed to add or update comment' });
    }
  } 
  // Handle other methods
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    console.log(`API LOG: Returning 405 - Method Not Allowed (${req.method})`);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 