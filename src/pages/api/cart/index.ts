import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = Number(session.user.id);

  // GET method to retrieve cart items for the current user
  if (req.method === 'GET') {
    try {
      const cartItems = await prisma.cart.findMany({
        where: {
          user_id: userId
        },
        include: {
          product: true
        }
      });
      return res.status(200).json(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return res.status(500).json({ error: 'Failed to fetch cart items' });
    }
  }

  // POST method to add an item to the cart
  if (req.method === 'POST') {
    try {
      const { productId, quantity } = req.body;

      if (!productId || !quantity) {
        return res.status(400).json({ error: 'Product ID and quantity are required' });
      }

      const product = await prisma.product.findUnique({
        where: {
          productID: productId
        }
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (quantity > product.maxBuyAmount) {
        return res.status(400).json({ 
          error: `Cannot add more than ${product.maxBuyAmount} items at once. Please adjust your quantity.` 
        });
      }

      if (product.amount < quantity) {
        return res.status(400).json({ error: 'Not enough product available' });
      }

      const existingCartItem = await prisma.cart.findFirst({
        where: {
          user_id: userId,
          product_id: productId
        }
      });

      if (existingCartItem) {
        const newTotalQuantity = existingCartItem.added_amount + quantity;
        if (newTotalQuantity > product.maxBuyAmount) {
          return res.status(400).json({ 
            error: `Cannot add more than ${product.maxBuyAmount} items at once. You already have ${existingCartItem.added_amount} in your cart.` 
          });
        }

        const updatedCartItem = await prisma.cart.update({
          where: {
            id: existingCartItem.id
          },
          data: {
            added_amount: newTotalQuantity
          }
        });
        return res.status(200).json(updatedCartItem);
      } else {
        const newCartItem = await prisma.cart.create({
          data: {
            user_id: userId,
            product_id: productId,
            added_amount: quantity,
            priceforoneItem: product.price
          }
        });
        return res.status(201).json(newCartItem);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return res.status(500).json({ error: 'Failed to add item to cart' });
    }
  }

  // DELETE method to remove an item from the cart
  if (req.method === 'DELETE') {
    try {
      // Note: For DELETE, data might come in query or body depending on client
      // Assuming body here based on original code structure
      const { cartItemId } = req.body; 

      if (!cartItemId) {
        return res.status(400).json({ error: 'Cart item ID is required' });
      }

      await prisma.cart.delete({
        where: {
          id: cartItemId,
          user_id: userId // Ensure the user can only delete their own cart items
        }
      });
      return res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (error) {
      // Handle potential errors like item not found for the user
      console.error('Error removing item from cart:', error);
      return res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  }

  // PATCH method to update cart item quantity
  if (req.method === 'PATCH') {
    try {
      const { cartItemId, quantity } = req.body;

      if (!cartItemId || quantity === undefined) { // Check quantity explicitly
        return res.status(400).json({ error: 'Cart item ID and quantity are required' });
      }

      const cartItem = await prisma.cart.findFirst({
        where: {
          id: cartItemId,
          user_id: userId
        },
        include: {
          product: true
        }
      });

      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      if (quantity > cartItem.product.maxBuyAmount) {
        return res.status(400).json({ 
          error: `Cannot set quantity above max buy amount (${cartItem.product.maxBuyAmount}).` 
        });
      }

      // Check available stock only if increasing quantity? 
      // Or just cap at available stock?
      // Capping at stock for safety:
      const effectiveQuantity = Math.min(quantity, cartItem.product.amount);
      if (effectiveQuantity <= 0) {
         // If quantity is 0 or less, consider deleting the item instead?
         // For now, just prevent setting non-positive quantity
         return res.status(400).json({ error: 'Quantity must be positive.' });
      }

      const updatedCartItem = await prisma.cart.update({
        where: {
          id: cartItemId
        },
        data: {
          added_amount: effectiveQuantity
        }
      });
      return res.status(200).json(updatedCartItem);
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return res.status(500).json({ error: 'Failed to update cart item quantity' });
    }
  }

  // Handle other methods or return method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
} 