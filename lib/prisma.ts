import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: (PrismaClient & { __adapterTag?: string }) | undefined
}

function createPrismaClient() {
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
    log: ["error"],
  }) as PrismaClient & { __adapterTag?: string }

  client.__adapterTag = "pg"
  return client
}

const cached = globalForPrisma.prisma
const prismaClient = cached?.__adapterTag === "pg" ? cached : createPrismaClient()

export const prisma = prismaClient

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient
}
