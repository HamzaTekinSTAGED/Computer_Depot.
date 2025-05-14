import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const userId = req.query.userId as string | undefined;
      const whereClause = userId ? { userID: parseInt(userId) } : {};

      const products = await db.product.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              username: true,
              name: true,
              surname: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      });
      return res.status(200).json(products);
    } catch (error) {
      console.error('Ürünler getirilirken hata:', error);
      return res.status(500).json({ error: 'Ürünler getirilemedi' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description, price, amount, maxBuyAmount, category, imageURL, userID } = req.body;

      // Validate required fields
      if (!title || !description || !price || !category || !userID || !amount || !maxBuyAmount) {
        return res.status(400).json({ error: 'Title, description, price, amount, maxBuyAmount and category fields are required' });
      }

      // Validate price
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Please enter a valid price' });
      }

      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Please enter a valid amount' });
      }

      // Validate maxBuyAmount
      if (isNaN(maxBuyAmount) || maxBuyAmount <= 0 || maxBuyAmount > amount) {
        return res.status(400).json({ error: 'Max buy amount must be at least 1 and cannot exceed the total amount' });
      }

      const product = await db.product.create({
        data: {
          title,
          description,
          price: parseFloat(price),
          amount: parseInt(amount),
          maxBuyAmount: parseInt(maxBuyAmount),
          categoryID: parseInt(category),
          imageURL: imageURL || "",
          userID: parseInt(userID)
        },
        include: {
          user: {
            select: {
              username: true,
              name: true,
              surname: true,
            },
          },
        },
      });

      return res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
        const { productId, amount } = req.body;

        if (!productId || typeof amount !== 'number') {
            return res.status(400).json({ error: 'productId ve amount gereklidir' });
        }

        // Ürünü bul
        const product = await db.product.findUnique({ where: { productID: productId } });
        if (!product) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        // Yeni miktarı hesapla
        const newAmount = product.amount - amount;
        if (newAmount < 0) {
            return res.status(400).json({ error: 'Yeterli ürün yok' });
        }

        // Güncelle
        const updated = await db.product.update({
            where: { productID: productId },
            data: {
                amount: newAmount
            },
        });
        return res.status(200).json(updated);
    } catch (error) {
        console.error('Ürün miktarı güncellenemedi:', error);
        return res.status(500).json({ error: 'Ürün miktarı güncellenemedi' });
    }
}

  // Handle other methods or return method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
} 