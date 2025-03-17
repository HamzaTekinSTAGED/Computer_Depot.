import { PrismaClient } from "@prisma/client";

class Database {
  private static instance: Database;
  private _prisma: PrismaClient;

  private constructor() {
    this._prisma = new PrismaClient({
      log: ['error', 'warn']
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public get prisma(): PrismaClient {
    return this._prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this._prisma.$connect();
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await this._prisma.$disconnect();
  }
}

// Global instance for development
declare global {
  var db: Database | undefined;
}

const database = global.db || Database.getInstance();

if (process.env.NODE_ENV !== "production") {
  global.db = database;
}

export const db = database.prisma; 