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
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email ve yeni şifre gereklidir" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır" });
    }

    // Kullanıcıyı e-posta ile bul
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
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

    return res.status(200).json({ 
      success: true,
      message: "Şifre başarıyla güncellendi" 
    });
  } catch (error) {
    console.error("Şifre güncelleme hatası:", error);
    return res.status(500).json({ error: "Şifre güncellenirken bir hata oluştu" });
  }
} 