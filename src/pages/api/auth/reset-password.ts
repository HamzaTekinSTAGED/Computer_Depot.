import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { username, name, surname, email, newPassword } = req.body;

    if (!username || !name || !surname || !email || !newPassword) {
      return res.status(400).json({ error: "Tüm alanlar gereklidir" });
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
      return res.status(200).json({ error: "Kullanıcı bilgileri eşleşmiyor" });
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

    return res.status(200).json({ success: true, message: "Şifre başarıyla güncellendi" });
  } catch (error) {
    return res.status(200).json({ error: "Şifre sıfırlanırken bir hata oluştu" });
  }
} 