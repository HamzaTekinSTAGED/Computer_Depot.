import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const authOptions: AuthOptions = {
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

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
          return null;
        }

        return {
          id: String(user.userID),
          email: user.email,
          name: user.name,
          surname: user.surname,
          username: user.username,
          role: user.role,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/Authentication/login",
    signOut: "/Authentication/logout",
    error: "/Authentication/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            const newUser = await db.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                surname: user.name?.split(' ').slice(1).join(' ') || "",
                username: user.email!.split('@')[0],
                password: await bcrypt.hash(Math.random().toString(36), 10),
                image: user.image,
                role: UserRole.USER,
              }
            });

            user.id = String(newUser.userID);
            user.username = newUser.username;
            user.surname = newUser.surname;
            user.role = newUser.role;
          } else {
            user.id = String(existingUser.userID);
            user.username = existingUser.username;
            user.surname = existingUser.surname;
            user.role = existingUser.role;
          }
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.surname = user.surname;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.surname = token.surname as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 