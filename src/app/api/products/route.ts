import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET tüm ürünleri getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
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
    return NextResponse.json(products);
  } catch (error) {
    console.error('Ürünler getirilirken hata:', error);
    return NextResponse.json({ error: 'Ürünler getirilemedi' }, { status: 500 });
  }
}

// POST yeni ürün oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, price, amount, category, imageURL, userID } = body;

    // Validate required fields
    if (!title || !description || !price || !category || !userID || !amount) {
      return NextResponse.json(
        { error: 'Title, description, price, amount and category fields are required' },
        { status: 400 }
      );
    }

    // Validate price
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Please enter a valid price' },
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Please enter a valid amount' },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        amount: parseInt(amount),
        categoryID: parseInt(category),
        imageURL: imageURL || "",
        userID: parseInt(userID),
        isSold: false
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}