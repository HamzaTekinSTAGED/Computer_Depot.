import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export const authOptions: AuthOptions = {
  // Adapter'ı şimdilik kaldırıyoruz
  // adapter: PrismaAdapter(db),
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
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
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
      if (token && session.user) {
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

export default NextAuth(authOptions); 