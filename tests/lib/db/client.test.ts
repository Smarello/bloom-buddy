import { describe, it, expect } from "vitest";

/**
 * Test di integrazione per il singleton Prisma Client.
 *
 * NOTA: Questo test NON esegue connessioni reali né query al database.
 * La verifica di prisma.$connect() e prisma.user.count() è delegata
 * alla pipeline CI, che dispone di un service container PostgreSQL con
 * migrazione applicata.
 *
 * Qui verifichiamo esclusivamente:
 * - che DATABASE_URL sia presente nell'ambiente
 * - che il singleton esista e sia una PrismaClient
 * - che il pattern singleton restituisca sempre la stessa istanza
 *
 * I test vengono saltati quando DATABASE_URL non è disponibile (sviluppo locale
 * senza database). In CI la variabile è sempre impostata dal service container.
 */
const databaseUrlDisponibile = !!process.env.DATABASE_URL;

describe.skipIf(!databaseUrlDisponibile)("singleton Prisma Client", () => {

  it("DATABASE_URL è definita in process.env", () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(typeof process.env.DATABASE_URL).toBe("string");
    expect(process.env.DATABASE_URL!.length).toBeGreaterThan(0);
  });

  it("il singleton prisma espone le API di PrismaClient", async () => {
    const { prisma } = await import("@/lib/db/client");

    // In Prisma 7 il client è generato tramite factory — toBeInstanceOf non funziona.
    // Verifichiamo le API pubbliche che garantiscono che il client sia correttamente inizializzato.
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.$disconnect).toBe("function");
    expect(prisma.user).toBeDefined();
  });

  it("importazioni successive restituiscono la stessa istanza (singleton)", async () => {
    /**
     * Nota: questo test verifica il caching dei moduli ESM di Vitest,
     * che garantisce la stessa istanza tra import distinti dello stesso modulo.
     * Il comportamento del pattern `globalThis.__prisma` è verificato
     * nel test seguente, che è più diretto e significativo.
     */
    const { prisma: primaImportazione } = await import("@/lib/db/client");
    const { prisma: secondaImportazione } = await import("@/lib/db/client");

    expect(primaImportazione).toBe(secondaImportazione);
  });

  it("globalThis.__prisma è impostato in ambiente non-production", async () => {
    /**
     * Verifica il comportamento del ramo `if (process.env.NODE_ENV !== 'production')`.
     * In ambiente di test NODE_ENV è 'test', quindi il singleton deve essere
     * assegnato su globalThis.__prisma al momento dell'import.
     */
    expect(process.env.NODE_ENV).not.toBe("production");

    const { prisma } = await import("@/lib/db/client");

    expect((globalThis as { __prisma?: unknown }).__prisma).toBeDefined();
    expect((globalThis as { __prisma?: unknown }).__prisma).toBe(prisma);
  });
});
