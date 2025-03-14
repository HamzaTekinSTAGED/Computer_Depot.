import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hash } from 'bcrypt';

// GET tüm kullanıcıları getir
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        userID: true,
        username: true,
        name: true,
        surname: true,
        email: true,
        products: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET Users Error:', error);
    return NextResponse.json({ error: 'Kullanıcılar getirilemedi' }, { status: 500 });
  }
}

// POST yeni kullanıcı oluştur
export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { username, name, surname, email, password } = body;

    // Gerekli alanları kontrol et
    if (!username || !name || !surname || !email || !password) {
      return NextResponse.json(
        { error: 'Tüm alanların doldurulması zorunludur' },
        { status: 400 }
      );
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçersiz email formatı' },
        { status: 400 }
      );
    }

    // Kullanıcı adı veya email zaten var mı kontrol et
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanımda' },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanımda' },
          { status: 400 }
        );
      }
    }

    // Şifreyi hashle
    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        name,
        surname,
        email,
        password: hashedPassword,
      },
    });

    const { password: __password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Create User Error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
} 