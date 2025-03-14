import { NextResponse } from 'next/server';
import { prisma } from 'C:/firebasetime/myapp/lib/prisma';
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
    return NextResponse.json({ error: 'Kullanıcılar getirilemedi' }, { status: 500 });
  }
}

// POST yeni kullanıcı oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, name, surname, email, password } = body;

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

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Kullanıcı oluşturulamadı' }, { status: 500 });
  }
} 