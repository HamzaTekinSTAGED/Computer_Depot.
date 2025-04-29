import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { hash } from 'bcrypt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET tüm kullanıcıları getir
  if (req.method === 'GET') {
    try {
      const users = await db.user.findMany({
        select: {
          userID: true,
          username: true,
          name: true,
          surname: true,
          email: true,
          role: true,
          products: true, // Consider if this is needed and potential performance impact
        },
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error('GET Users Error:', error);
      return res.status(500).json({ error: 'Kullanıcılar getirilemedi' });
    }
  }

  // POST yeni kullanıcı oluştur
  if (req.method === 'POST') {
    try {
      const { username, name, surname, email, password } = req.body;

      // Gerekli alanları kontrol et
      if (!username || !name || !surname || !email || !password) {
        return res.status(400).json({ error: 'Tüm alanların doldurulması zorunludur' });
      }

      // Email formatını kontrol et
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Geçersiz email formatı' });
      }

      // Kullanıcı adı veya email zaten var mı kontrol et
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' });
        }
        if (existingUser.username === username) {
          return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanımda' });
        }
      }

      // Şifreyi hashle
      const hashedPassword = await hash(password, 10);

      const user = await db.user.create({
        data: {
          username,
          name,
          surname,
          email,
          password: hashedPassword,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Create User Error:', error);
      const message = error instanceof Error ? error.message : 'Kullanıcı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
      return res.status(500).json({ error: message });
    }
  }

  // Handle other methods or return method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
} 