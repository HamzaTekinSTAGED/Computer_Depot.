import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RawProduct {
  productID: number;
  title: string;
  description: string;
  price: number;
  category: string;
  imageURL: string;
  isSold: boolean;
  publishingDate: Date;
  userID: number;
}

// GET tüm alışveriş geçmişini getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');

    if (!buyerId && !sellerId) {
      return NextResponse.json(
        { error: "Either buyerId or sellerId must be provided" },
        { status: 400 }
      );
    }

    const where = buyerId
      ? { buyerID: parseInt(buyerId) }
      : { sellerID: parseInt(sellerId!) };

    const tradeHistory = await prisma.tradeHistory.findMany({
      where,
      include: {
        product: {
          select: {
            title: true,
            description: true,
            imageURL: true,
            amount: true,
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

    return NextResponse.json(tradeHistory);
  } catch (error) {
    console.error("Error fetching trade history:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade history" },
      { status: 500 }
    );
  }
}

// POST yeni alışveriş kaydı oluştur
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, amount = 1 } = await request.json();

    // Get the product details using raw query
    const products = await db.$queryRaw<RawProduct[]>`
      SELECT * FROM Product WHERE productID = ${productId}
    `;
    const product = products[0];

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.isSold) {
      return NextResponse.json({ error: "Product is already sold" }, { status: 400 });
    }

    if (product.userID === Number(session.user.id)) {
      return NextResponse.json({ error: "Cannot buy your own product" }, { status: 400 });
    }

    // Create transaction to update product and create trade history
    const result = await db.$transaction([
      db.$executeRaw`UPDATE Product SET amount = amount - ${amount} WHERE productID = ${productId}`,
      db.$executeRaw`UPDATE Product SET isSold = true WHERE productID = ${productId} AND amount = 0`,
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

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 