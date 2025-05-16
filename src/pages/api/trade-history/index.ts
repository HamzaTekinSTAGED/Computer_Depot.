import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { RawProduct } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const buyerId = req.query.buyerId as string | undefined;
      const sellerId = req.query.sellerId as string | undefined;

      if (!buyerId && !sellerId) {
        return res.status(400).json({ error: "Either buyerId or sellerId must be provided" });
      }

      const where = buyerId
        ? { buyerID: parseInt(buyerId) }
        : { sellerID: parseInt(sellerId!) }; // Non-null assertion for sellerId if buyerId is null

      const tradeHistory = await prisma.tradeHistory.findMany({
        where,
        include: {
          product: {
            select: {
              title: true,
              description: true,
              imageURL: true,
              amount: true,
              categoryID: true,
              category: {
                select: {
                  name: true
                }
              }
            },
          },
          buyer: {
            select: {
              username: true,
            },
          },
          seller: {
            select: {
              username: true,
            },
          },
        },
        orderBy: {
          sellingDate: 'desc',
        },
      });

      return res.status(200).json(tradeHistory);
    } catch (error) {
      console.error("Error fetching trade history:", error);
      return res.status(500).json({ error: "Failed to fetch trade history" });
    }
  }

  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { productId, amount = 1 } = req.body;

      // Get the product details using raw query
      const products = await db.$queryRaw<RawProduct[]>`
        SELECT * FROM Product WHERE productID = ${productId}
      `;
      const product = products[0];

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (product.amount < amount) { // Check available amount
        return res.status(400).json({ error: "Insufficient stock" });
      }

      if (product.userID === Number(session.user.id)) {
        return res.status(400).json({ error: "Cannot buy your own product" });
      }

      // Create transaction to update product and create trade history
      const result = await db.$transaction([
        db.$executeRaw`UPDATE Product SET amount = amount - ${amount} WHERE productID = ${productId}`,
        db.tradeHistory.create({
          data: {
            buyerID: Number(session.user.id),
            sellerID: product.userID,
            productID: productId,
            price: product.price,
            amount: amount,
          },
          include: {
            buyer: {
              select: {
                username: true,
                name: true,
                surname: true,
              },
            },
            seller: {
              select: {
                username: true,
                name: true,
                surname: true,
              },
            },
            product: {
              select: {
                title: true,
                description: true,
                imageURL: true,
                amount: true,
              },
            },
          },
        }),
      ]);

      // result[1] contains the created trade history (since we removed the isSold update)
      return res.status(200).json({ success: true, data: result[1] });
    } catch (error) {
      console.error("Purchase error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Handle other methods or return method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
} 