import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from 'next';

async function handlePost(req: Request) {
  try {
    const body = await req.json();
    const { name, surname, username, email, password } = body;

    // Validasyon
    if (!name || !surname || !username || !email || !password) {
      return NextResponse.json(
        { error: "Tüm alanlar gereklidir" },
        { status: 400 }
      );
    }

    // E-posta ve kullanıcı adının benzersiz olduğunu kontrol et
    const existingUserByEmail = await db.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const existingUserByUsername = await db.user.findUnique({
      where: { username }
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten kullanılıyor" },
        { status: 400 }
      );
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
    const userWithoutPassword = {
      userID: user.userID,
      name: user.name,
      surname: user.surname,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
      notf_number: user.notf_number
    };

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "Kayıt başarılı"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kayıt hatası:", error);
    // Ensure this returns a Response object for consistency with NextResponse
    return new Response(JSON.stringify({ error: "Kullanıcı kaydı sırasında bir hata oluştu" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // For NextApiRequest, we need to pass it directly if the underlying
    // function expects a standard Request object.
    // However, our handlePost function expects a standard Request.
    // Next.js under the hood might pass a different object type for req
    // when using NextApiRequest.
    // To be safe and align with the original 'req: Request' type in POST,
    // we create a new Request object.
    // The body needs to be stringified if it's not already a ReadableStream.
    // NextApiRequest's body is already parsed, so we use it directly.

    const body = req.body; // NextApiRequest already has the parsed body

    // Construct the full URL for the Request constructor
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const fullUrl = `${protocol}://${host}${req.url}`;

    const standardRequest = new Request(fullUrl, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: JSON.stringify(body), // Stringify the already parsed body for the Request constructor
    });


    const response = await handlePost(standardRequest);
    const responseBody = await response.json();
    return res.status(response.status).json(responseBody);
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// The original POST function is now encapsulated by handlePost
// and invoked through the default handler.
// We can remove or comment out the direct export of POST if it's no longer needed.
// export async function POST(req: Request) { ... } 