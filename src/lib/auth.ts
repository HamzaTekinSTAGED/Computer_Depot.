import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "./db";
import { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

interface ExtendedToken extends JWT {
  id?: string;
  username?: string;
  surname?: string;
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as any, // Type assertion to resolve adapter compatibility
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
    async jwt({ token, user }): Promise<ExtendedToken> {
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
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.surname = token.surname as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 