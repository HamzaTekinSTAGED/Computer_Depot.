import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Create a module-scoped variable to hold the singleton instance
let prismaInstance: PrismaClientSingleton;

// Export a function that returns the singleton instance
const getPrismaClient = (): PrismaClientSingleton => {
  if (process.env.NODE_ENV === 'production') {
    return prismaClientSingleton();
  }
  
  if (!prismaInstance) {
    prismaInstance = prismaClientSingleton();
  }
  
  return prismaInstance;
};

const prisma = getPrismaClient();

export default prisma; 