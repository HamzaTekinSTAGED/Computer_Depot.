import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Session tipini genişleterek daha fazla kullanıcı bilgisi ekleyebiliriz
   */
  interface Session {
    user: {
      id: string;
      username: string;
      surname: string;
    } & DefaultSession["user"];
  }

  /**
   * User tipini genişleterek yeni alanlar ekleyebiliriz
   */
  interface User {
    id: string;
    username: string;
    surname: string;
  }
} 