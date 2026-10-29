import { env } from "@Batman/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

import { Prisma, PrismaClient } from "../prisma/generated/client";

function resolveConnectionString(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DIRECT_URL,
  ];

  for (const value of candidates) {
    const url = value?.trim();
    if (!url) continue;
    if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
      return url;
    }
  }

  throw new Error(
    "No valid Postgres connection string found. Set DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL, or DIRECT_URL to a postgres:// URL.",
  );
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = resolveConnectionString();
  const adapter = new PrismaPg({
    connectionString,
    max: 5,
  });
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
export { Prisma };
