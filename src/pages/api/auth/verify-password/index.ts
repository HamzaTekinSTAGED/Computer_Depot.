import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email ve şifre gereklidir" });
    }

    // Kullanıcıyı e-posta ile bul
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Mevcut şifreyi doğrula
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Mevcut şifre yanlış" });
    }

    // Şifre doğruysa başarılı yanıt döndür
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Şifre doğrulama hatası:", error);
    return res.status(500).json({ error: "Şifre doğrulanırken bir hata oluştu" });
  }
} 