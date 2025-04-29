import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email ve yeni şifre gereklidir" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalıdır" },
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

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Kullanıcı şifresini güncelle
    await db.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Şifre başarıyla güncellendi" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Şifre güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Şifre güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 