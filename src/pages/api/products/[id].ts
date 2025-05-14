import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth";
import { db } from '@/lib/db';
import prisma from '@/lib/prisma'; 

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query; // Get ID from query parameters
  const productId = parseInt(id as string);

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  // --- GET a single product by ID ---
  if (req.method === 'GET') {
    try {
      const product = await db.product.findUnique({
        where: { productID: productId },
        include: {
          category: true
        }
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
  }

  // --- PUT (update) a product by ID ---
  if (req.method === 'PUT') {
    const session = await getServerSession(req, res, authOptions);

    // 1. Check Authentication & Authorization
    if (!session) {
      return res.status(401).json({ message: 'Not Authenticated' });
    }
    // Assuming role is available on session.user
    if ((session.user as any).role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    // 3. Parse Body and Validate Data (already validated ID above)
    try {
        const { title, description, price, amount, categoryID, imageURL } = req.body;

        // Add more specific validation as needed
        if (typeof title !== 'string' || title.trim() === '' ||
            typeof description !== 'string' || description.trim() === '' ||
            typeof price !== 'number' || price < 0 ||
            typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0 ||
            typeof categoryID !== 'number' ||
            (imageURL !== null && typeof imageURL !== 'string')) {
            return res.status(400).json({ message: 'Invalid product data provided' });
        }

        // Check if category exists
        const categoryExists = await prisma.category.findUnique({
            where: { categoryID: categoryID },
        });
        if (!categoryExists) {
            return res.status(400).json({ message: `Category with ID ${categoryID} not found` });
        }

        const updatedProduct = await prisma.product.update({
            where: { productID: productId },
            data: {
                title,
                description,
                price,
                amount,
                categoryID,
                imageURL,
            },
        });

        return res.status(200).json(updatedProduct);
    } catch (error: any) {
        console.error('Error updating product:', error);
        if (error.code === 'P2025') { // Prisma record not found error
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(500).json({ message: 'Failed to update product' });
    }
  }

  // --- PATCH to update specific fields (like newCommentExist) ---
  if (req.method === 'PATCH') {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.id) {
        return res.status(401).json({ message: 'Not Authenticated' });
    }

    const userId = parseInt(session.user.id);
    const { newCommentExist } = req.body;

    if (typeof newCommentExist !== 'boolean') {
        return res.status(400).json({ message: 'Invalid value for newCommentExist. Must be boolean.' });
    }

    try {
        // 1. Find the product to verify ownership
        const product = await prisma.product.findUnique({
            where: { productID: productId },
            select: { userID: true } // Only select the owner's ID
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // 2. Check if the authenticated user is the seller
        if (product.userID !== userId) {
            return res.status(403).json({ message: 'Not Authorized. Only the seller can modify this.' });
        }

        // 3. Update the product
        const updatedProduct = await prisma.product.update({
            where: { productID: productId },
            data: { newCommentExist },
        });

        return res.status(200).json(updatedProduct);
    } catch (error: any) {
        console.error('Error updating product (PATCH):', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Product not found during update' });
        }
        return res.status(500).json({ message: 'Failed to update product' });
    }
  }

  // --- DELETE a product by ID ---
  if (req.method === 'DELETE') {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(401).json({ message: 'Not Authenticated' });
    }
    // Assuming role is available on session.user
    if ((session.user as any).role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not Authorized' });
    }

    try {
        await prisma.product.delete({
            where: { productID: productId },
        });
        // Use 204 No Content for successful DELETE with no body
        return res.status(204).end(); 
    } catch (error: any) {
        console.error('Error deleting product:', error);
        if (error.code === 'P2025') { // Prisma record not found error
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(500).json({ message: 'Failed to delete product' });
    }
  }

  // Handle other methods or return method not allowed
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
} 