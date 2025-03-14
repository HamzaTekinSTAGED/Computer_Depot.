import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET tüm alışveriş geçmişini getir
export async function GET() {
  try {
    const tradeHistory = await prisma.tradeHistory.findMany({
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
        product: true,
      },
    });
    return NextResponse.json(tradeHistory);
  } catch {
    return NextResponse.json({ error: 'Alışveriş geçmişi getirilemedi' }, { status: 500 });
  }
}

// POST yeni alışveriş kaydı oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyerID, sellerID, productID, price } = body;

    const tradeHistory = await prisma.tradeHistory.create({
      data: {
        buyerID,
        sellerID,
        productID,
        price,
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
        product: true,
      },
    });

    return NextResponse.json(tradeHistory, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Alışveriş kaydı oluşturulamadı' }, { status: 500 });
  }
} 