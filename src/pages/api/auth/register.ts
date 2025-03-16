import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = req.body;
    const { name, surname, username, email, password } = body;

    // Validasyon
    if (!name || !surname || !username || !email || !password) {
      return res.status(400).json({ error: "Tüm alanlar gereklidir" });
    }

    // E-posta ve kullanıcı adının benzersiz olduğunu kontrol et
    const existingUserByEmail = await db.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return res.status(400).json({ error: "Bu e-posta adresi zaten kullanılıyor" });
    }

    const existingUserByUsername = await db.user.findUnique({
      where: { username }
    });

    if (existingUserByUsername) {
      return res.status(400).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const user = await db.user.create({
      data: {
        name,
        surname,
        username,
        email,
        password: hashedPassword,
      },
    });

    // Hassas bilgileri hariç tut
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      user: userWithoutPassword,
      message: "Kayıt başarılı"
    });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return res.status(500).json({ error: "Kullanıcı kaydı sırasında bir hata oluştu" });
  }
} 