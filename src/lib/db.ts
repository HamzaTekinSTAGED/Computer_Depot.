import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient'ın sıcak yeniden yükleme sırasında birden çok örneğinin oluşmasını önler
export const db = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
} 