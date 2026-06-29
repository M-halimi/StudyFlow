import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { getEnvVar } from "@/lib/env"

const databaseUrl = getEnvVar("DATABASE_URL")

const adapter = new PrismaPg({
  connectionString: databaseUrl,
})

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
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
