import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET tüm ürünleri getir
export async function GET() {
  try {
    const products = await prisma.product.findMany({
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
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Ürünler getirilemedi' }, { status: 500 });
  }
}

// POST yeni ürün oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, price, category, imageURL, userID } = body;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        category,
        imageURL,
        userID,
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
    return NextResponse.json({ error: 'Ürün oluşturulamadı' }, { status: 500 });
  }
}