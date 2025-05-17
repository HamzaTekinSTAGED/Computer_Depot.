import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = Number(session.user.id);

  if (req.method === 'POST') {
    // Add favorite
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Missing productId' });
    }

    try {
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId,
          },
        },
      });

      if (existingFavorite) {
        return res.status(409).json({ message: 'Product already favorited' });
      }

      const favorite = await prisma.favorite.create({
        data: {
          userId: userId,
          productId: productId,
        },
      });
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else if (req.method === 'DELETE') {
    // Remove favorite
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Missing productId' });
    }

    try {
      const favorite = await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId,
          },
        },
      });
      res.status(200).json(favorite);
    } catch (error) {
      console.error("Error removing favorite:", error);
      // If the favorite doesn't exist, it's still a success from the client's perspective
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
           return res.status(200).json({ message: 'Favorite not found, nothing to delete.' });
      }
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else if (req.method === 'GET') {
    // Get user favorites
    try {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: userId,
        },
        include: {
          product: true, // Include product details
        },
      });
      res.status(200).json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Close Prisma client connection when done
  // This is generally not recommended in serverless environments or Next.js API routes
  // due to connection pooling. Keep the prisma client outside the handler.
  // await prisma.$disconnect();
}
