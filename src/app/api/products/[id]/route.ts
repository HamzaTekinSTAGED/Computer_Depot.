import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"; 

const prisma = new PrismaClient();

// GET a single product by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { productID: parseInt(id) },
      // Include category and user if needed, similar to the main products fetch
      include: {
        category: true,
        user: {
          select: { username: true } // Only select necessary user fields
        }
      }
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT (update) a product by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const { id } = params;
  
    // 1. Check Authentication & Authorization
    if (!session) {
      return NextResponse.json({ message: 'Not Authenticated' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Not Authorized' }, { status: 403 });
    }

    // 2. Validate ID
    if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }

    // 3. Parse Body and Validate Data
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { title, description, price, amount, categoryID, imageURL, isSold } = body;

    // Add more specific validation as needed (e.g., check types, ranges)
    if (typeof title !== 'string' || title.trim() === '' ||
        typeof description !== 'string' || description.trim() === '' ||
        typeof price !== 'number' || price < 0 ||
        typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0 ||
        typeof categoryID !== 'number' ||
        (imageURL !== null && typeof imageURL !== 'string') || // Allow null or string
        typeof isSold !== 'boolean') {
        return NextResponse.json({ message: 'Invalid product data provided' }, { status: 400 });
    }

    // 4. Perform Update
    try {
        // Check if category exists (optional but good practice)
        const categoryExists = await prisma.category.findUnique({
            where: { categoryID: categoryID },
        });
        if (!categoryExists) {
            return NextResponse.json({ message: `Category with ID ${categoryID} not found` }, { status: 400 });
        }

        const updatedProduct = await prisma.product.update({
            where: { productID: parseInt(id) },
            data: {
                title,
                description,
                price,
                amount,
                categoryID,
                imageURL,
                isSold,
                // Exclude fields that shouldn't be updated here: productID, userID, publishingDate
            },
        });

        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error('Error updating product:', error);
        // Check for specific Prisma errors (e.g., P2025 Record to update not found)
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Failed to update product' }, { status: 500 });
    }
}

// You might also want a DELETE handler here
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const { id } = params;

    if (!session) {
        return NextResponse.json({ message: 'Not Authenticated' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Not Authorized' }, { status: 403 });
    }

    if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }

    try {
        // Check relationships before deleting if necessary (e.g., TradeHistory)
        // Depending on your schema's onDelete behavior, this might not be strictly needed
        // but can prevent accidental data loss if relations aren't set to cascade correctly.

        await prisma.product.delete({
            where: { productID: parseInt(id) },
        });

        return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 }); // Or 204 No Content
    } catch (error: any) {
        console.error('Error deleting product:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
        // Handle other potential errors like foreign key constraints if onDelete isn't CASCADE
        return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 });
    }
} 