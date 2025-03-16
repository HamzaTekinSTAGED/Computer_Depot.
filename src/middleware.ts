import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // Korumalı rotalar (giriş yapmış kullanıcılar için)
  const protectedRoutes = [
    "/dashboard", 
    "/profile",
    "/products/add"
  ];

  // Kimlik doğrulama sayfaları (giriş yapmamış kullanıcılar için)
  const authRoutes = [
    "/auth/login", 
    "/auth/register"
  ];

  // Kullanıcı giriş yapmış ve auth sayfalarına erişmeye çalışıyorsa dashboard'a yönlendir
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Kullanıcı giriş yapmamış ve korumalı sayfalara erişmeye çalışıyorsa login'e yönlendir
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

// Middleware'in hangi yollar için çalışacağını yapılandır
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/products/add/:path*",
    "/auth/:path*",
  ],
}; 