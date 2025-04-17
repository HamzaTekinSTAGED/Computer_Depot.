import { UserRole } from "@prisma/client"

declare module "next-auth" {
  /**
   * Session tipini genişleterek daha fazla kullanıcı bilgisi ekleyebiliriz
   */
  interface Session {
    user: User & {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  /**
   * User tipini genişleterek yeni alanlar ekleyebiliriz
   */
  interface User {
    id: string;
    username: string;
    surname: string;
    role: UserRole;
  }
} 