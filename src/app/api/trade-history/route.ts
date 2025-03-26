import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
export async function GET() {
  try {
    const tradeHistory = await db.tradeHistory.findMany({
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();

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
      db.$executeRaw`UPDATE Product SET isSold = true WHERE productID = ${productId}`,
      db.tradeHistory.create({
        data: {
          buyerID: Number(session.user.id),
          sellerID: product.userID,
          productID: productId,
          price: product.price,
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
      }),
    ]);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 