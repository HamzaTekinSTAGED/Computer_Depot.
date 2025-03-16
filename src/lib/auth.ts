import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "./db";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Kullanıcıyı veritabanında ara
        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        // Kullanıcı yoksa veya şifre yanlışsa null döndür
        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
          return null;
        }

        // Kimlik doğrulama başarılı ise kullanıcı nesnesini döndür
        return {
          id: String(user.userID),
          email: user.email,
          name: user.name,
          surname: user.surname,
          username: user.username,
          image: user.image,
        };
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  callbacks: {
    // JWT oluşturma sırasında çalışır
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.surname = user.surname;
      }
      return token;
    },
    // Oturum oluşturma sırasında çalışır
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username as string;
        session.user.surname = token.surname as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions); 