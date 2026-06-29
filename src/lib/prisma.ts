import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error(
      'Environment variable "DATABASE_URL" is not set. Check your .env file or Vercel environment variables.'
    )
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  })

  try {
    return new PrismaClient({ adapter })
  } catch (error) {
    throw new Error(
      `Failed to initialize PrismaClient: ${error instanceof Error ? error.message : "unknown error"}`
    )
  }
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
