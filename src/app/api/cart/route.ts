import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET method to retrieve cart items for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);

    // Get cart items for the user
    const cartItems = await prisma.cart.findMany({
      where: {
        user_id: userId
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 });
  }
}

// POST method to add an item to the cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { productId, quantity } = await request.json();

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }

    // Check if the product exists and has enough amount
    const product = await prisma.product.findUnique({
      where: {
        productID: productId
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.amount < quantity) {
      return NextResponse.json({ error: 'Not enough product available' }, { status: 400 });
    }

    // Check if the product is already in the cart
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    if (existingCartItem) {
      // Update the quantity
      const updatedCartItem = await prisma.cart.update({
        where: {
          id: existingCartItem.id
        },
        data: {
          added_amount: existingCartItem.added_amount + quantity
        }
      });

      return NextResponse.json(updatedCartItem);
    } else {
      // Add new item to cart
      const newCartItem = await prisma.cart.create({
        data: {
          user_id: userId,
          product_id: productId,
          added_amount: quantity,
          priceforoneItem: product.price
        }
      });

      return NextResponse.json(newCartItem);
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}

// DELETE method to remove an item from the cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { cartItemId } = await request.json();

    if (!cartItemId) {
      return NextResponse.json({ error: 'Cart item ID is required' }, { status: 400 });
    }

    // Delete the cart item
    await prisma.cart.delete({
      where: {
        id: cartItemId,
        user_id: userId // Ensure the user can only delete their own cart items
      }
    });

    return NextResponse.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 });
  }
}
