import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma'; // Adjust path to your prisma client if different
import { getServerSession } from 'next-auth/next'; // Changed from next-auth/react
import { authOptions } from '@/lib/auth'; // Assuming authOptions are here

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions); // Changed to getServerSession

    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { commentUserId, commentProductId, text } = req.body;

    if (!commentUserId || !commentProductId || !text) {
      return res.status(400).json({ error: 'Missing required fields: commentUserId, commentProductId, text' });
    }
    
    if (typeof text !== 'string' || text.trim().length === 0 || text.length > 500) {
        return res.status(400).json({ error: 'Invalid reply text. Max 500 chars.' });
    }

    try {
      // Optional: Check if the user is the seller of the product associated with the comment
      // This requires fetching the product and comparing its userID with session.user.id
      // For brevity, this check is omitted here but is recommended for production.

      const newReply = await prisma.reply.create({
        data: {
          commentUser: Number(commentUserId),
          commentProduct: Number(commentProductId),
          userID: Number(session.user.id), // The currently logged-in user is making the reply
          text: text.trim(),
        },
        include: {
            user: { // Include user details in the response
                select: {
                    username: true,
                    image: true,
                }
            }
        }
      });

      // Potentially, you might want to update the related Product to set newCommentExist or similar
      // or send a notification to the user who made the comment.

      return res.status(201).json(newReply);
    } catch (error) {
      console.error('Failed to create reply:', error);
      // Check for specific Prisma errors, e.g., if the comment doesn't exist
      if (error instanceof Error && 'code' in error && (error.code === 'P2003' || error.code === 'P2025')) { // Foreign key constraint failed or record not found
        return res.status(404).json({ error: 'Comment not found or other data integrity issue.' });
      }
      return res.status(500).json({ error: 'Internal server error while creating reply.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 