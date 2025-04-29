import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email ve şifre gereklidir" },
        { status: 400 }
      );
    }

    // Kullanıcıyı e-posta ile bul
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Mevcut şifreyi doğrula
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Mevcut şifre yanlış" },
        { status: 401 }
      );
    }

    // Şifre doğruysa başarılı yanıt döndür
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Şifre doğrulama hatası:", error);
    return NextResponse.json(
      { error: "Şifre doğrulanırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 