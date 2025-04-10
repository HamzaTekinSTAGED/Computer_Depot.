import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, name, surname, email, newPassword } = await req.json();

    if (!username || !name || !surname || !email || !newPassword) {
      return NextResponse.json(
        { error: "Tüm alanlar gereklidir" },
        { status: 400 }
      );
    }

    // Kullanıcıyı bilgilerle eşleştir
    const user = await db.user.findFirst({
      where: {
        username,
        name,
        surname,
        email
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bilgileri eşleşmiyor" },
        { status: 200 }
      );
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Kullanıcının şifresini güncelle
    await db.user.update({
      where: {
        userID: user.userID
      },
      data: {
        password: hashedPassword
      }
    });

    return NextResponse.json(
      { success: true, message: "Şifre başarıyla güncellendi" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Şifre sıfırlanırken bir hata oluştu" },
      { status: 200 }
    );
  }
} 