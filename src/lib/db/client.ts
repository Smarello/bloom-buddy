import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Singleton del client Prisma.
 * In sviluppo, il hot reload di Next.js ricrea i moduli ad ogni modifica —
 * senza questo pattern ogni reload aprirebbe una nuova connessioni al database.
 * In produzione viene sempre creata una sola istanza.
 *
 * Prisma 7 con Query Compiler richiede un driver adapter esplicito.
 */
function creaPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL non configurata. Copia .env.example in .env e imposta la stringa di connessione."
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? creaPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
