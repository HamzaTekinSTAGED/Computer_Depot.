import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { commentUserId, commentProductId } = req.query;

        if (!commentUserId || !commentProductId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const like = await prisma.like.findFirst({
            where: {
                userID: Number(session.user.id),
                commentUserID: Number(commentUserId),
                commentProductID: Number(commentProductId),
            },
        });

        return res.status(200).json({
            isLiked: like?.isLiked || false
        });

    } catch (error) {
        console.error('Error checking like status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 