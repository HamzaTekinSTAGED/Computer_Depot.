import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { userId, productId, action } = req.body;

        if (!userId || !productId || !action) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Yorumu bul ve beğeni sayısını güncelle
        const updatedComment = await db.comment.update({
            where: {
                userId_productId: {
                    userId: userId,
                    productId: productId,
                },
            },
            data: {
                getLiked: {
                    increment: action === 'like' ? 1 : -1,
                },
            },
        });

        return res.status(200).json(updatedComment);
    } catch (error) {
        console.error('Beğeni hatası:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 