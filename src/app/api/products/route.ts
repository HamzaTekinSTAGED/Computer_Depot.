import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET tüm ürünleri getir
export async function GET() {
  try {
    const products = await db.product.findMany({
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
    console.error('Ürünler getirilirken hata:', error);
    return NextResponse.json({ error: 'Ürünler getirilemedi' }, { status: 500 });
  }
}

// POST yeni ürün oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, price, category, imageURL, userID } = body;

    // Validate required fields
    if (!title || !description || !price || !category || !userID) {
      return NextResponse.json(
        { error: 'Başlık, açıklama, fiyat ve kategori alanları zorunludur' },
        { status: 400 }
      );
    }

    // Validate price
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Geçerli bir fiyat giriniz' },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        imageURL: imageURL || null,
        user: {
          connect: {
            userID: userID
          }
        }
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
    console.error('Ürün oluşturulurken hata:', error);
    return NextResponse.json({ 
      error: 'Ürün oluşturulamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}