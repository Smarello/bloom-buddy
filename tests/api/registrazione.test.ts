/**
 * Test suite per POST /api/auth/registrazione
 *
 * NOTA sui mock: i factory di vi.mock vengono hoistati da Vitest prima di qualsiasi
 * altra istruzione del file. Per questo motivo i factory NON possono referenziare
 * variabili definite nel file — devono essere completamente autonomi.
 * I mock vengono recuperati dopo l'import tramite vi.mocked().
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Factory dei mock — nessun riferimento a variabili esterne
// ---------------------------------------------------------------------------

vi.mock("@/lib/db/client", () => ({
  prisma: {
    user: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessione: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$12$hashFintoPertestUnitario"),
  },
}));

// ---------------------------------------------------------------------------
// Import dell'handler e dei moduli mockati (DOPO i vi.mock)
// ---------------------------------------------------------------------------

import { POST } from "@/app/api/auth/registrazione/route";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";

// Riferimento tipizzato ai mock per usare le API di Vitest
const mockUserCreate = vi.mocked(prisma.user.create);
const mockOttieniSessione = vi.mocked(ottieniSessione);

// Valore hash restituito dal mock bcrypt (stesso letterale nel factory)
const HASH_FINTO = "$2b$12$hashFintoPertestUnitario";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function creaRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/registrazione", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function creaErroreDuplicatoEmail(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(
    "Unique constraint failed on the fields: (`email`)",
    { code: "P2002", clientVersion: "6.0.0" },
  );
}

// Crea un oggetto sessione finto con save spiabile
function creaSessioneFinta() {
  return {
    utenteId: undefined as string | undefined,
    email: undefined as string | undefined,
    save: vi.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("POST /api/auth/registrazione", () => {
  let sessioneFinta: ReturnType<typeof creaSessioneFinta>;

  beforeEach(() => {
    vi.clearAllMocks();
    sessioneFinta = creaSessioneFinta();
    mockOttieniSessione.mockResolvedValue(sessioneFinta as never);
  });

  // -------------------------------------------------------------------------
  describe("payload mancante o malformato", () => {
    it("restituisce 400 se il body non è JSON valido", async () => {
      const richiestaRotta = new NextRequest(
        "http://localhost/api/auth/registrazione",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "questo non è JSON{{{",
        },
      );

      const risposta = await POST(richiestaRotta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBeTruthy();
    });

    it("restituisce 400 se il body è null", async () => {
      const richiesta = creaRequest(null);

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBeTruthy();
    });

    it("restituisce 400 se manca il campo email", async () => {
      const richiesta = creaRequest({ password: "password123" });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBeTruthy();
    });

    it("restituisce 400 se manca il campo password", async () => {
      const richiesta = creaRequest({ email: "utente@esempio.it" });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  describe("validazione email", () => {
    it("restituisce 400 per un'email senza @", async () => {
      const richiesta = creaRequest({
        email: "indirizzoSenzaChiocciola.it",
        password: "password123",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBeTruthy();
    });

    it("il messaggio di errore email è comprensibile all'utente", async () => {
      const richiesta = creaRequest({
        email: "emailsbagliata",
        password: "password123",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(typeof dati.errore).toBe("string");
      expect(dati.errore.length).toBeGreaterThan(0);
      expect(dati.errore).not.toContain("undefined");
      expect(dati.errore).not.toContain("null");
    });
  });

  // -------------------------------------------------------------------------
  describe("validazione password", () => {
    it("restituisce 400 per una password di 7 caratteri (sotto la soglia minima)", async () => {
      const richiesta = creaRequest({
        email: "utente@esempio.it",
        password: "1234567", // 7 caratteri
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBeTruthy();
    });

    it("restituisce 400 per una password vuota", async () => {
      const richiesta = creaRequest({
        email: "utente@esempio.it",
        password: "",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBeTruthy();
    });

    it("accetta una password esattamente di 8 caratteri (limite inferiore incluso)", async () => {
      mockUserCreate.mockResolvedValue({
        id: "id-utente-test",
        email: "utente@esempio.it",
      } as never);

      const richiesta = creaRequest({
        email: "utente@esempio.it",
        password: "12345678", // 8 caratteri esatti
      });

      const risposta = await POST(richiesta);

      expect(risposta.status).toBe(200);
    });
  });

  // -------------------------------------------------------------------------
  describe("email duplicata", () => {
    it("restituisce 409 quando Prisma lancia P2002 (violazione unique constraint)", async () => {
      mockUserCreate.mockRejectedValue(creaErroreDuplicatoEmail());

      const richiesta = creaRequest({
        email: "giàregistrata@esempio.it",
        password: "password123",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(409);
      expect(dati.errore).toBeTruthy();
    });

    it("il messaggio di errore 409 non espone dettagli tecnici di Prisma", async () => {
      mockUserCreate.mockRejectedValue(creaErroreDuplicatoEmail());

      const richiesta = creaRequest({
        email: "giàregistrata@esempio.it",
        password: "password123",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(typeof dati.errore).toBe("string");
      expect(dati.errore.length).toBeGreaterThan(0);
      expect(dati.errore).not.toContain("P2002");
      expect(dati.errore).not.toContain("Unique constraint");
      expect(dati.errore).not.toContain("prisma");
    });

    it("rilancia errori Prisma con codice diverso da P2002 (errori inattesi)", async () => {
      const erroreInatteso = new Prisma.PrismaClientKnownRequestError(
        "Errore generico del database",
        { code: "P1001", clientVersion: "6.0.0" },
      );
      mockUserCreate.mockRejectedValue(erroreInatteso);

      const richiesta = creaRequest({
        email: "utente@esempio.it",
        password: "password123",
      });

      await expect(POST(richiesta)).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  describe("registrazione valida", () => {
    const UTENTE_CREATO = { id: "id-utente-abc123", email: "nuovo@esempio.it" };

    beforeEach(() => {
      mockUserCreate.mockResolvedValue(UTENTE_CREATO as never);
    });

    it("restituisce 200 con { successo: true } per credenziali valide", async () => {
      const richiesta = creaRequest({
        email: "nuovo@esempio.it",
        password: "passwordSicura99",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(200);
      expect(dati.successo).toBe(true);
    });

    it("chiama sessione.save() al termine della registrazione", async () => {
      const richiesta = creaRequest({
        email: "nuovo@esempio.it",
        password: "passwordSicura99",
      });

      await POST(richiesta);

      expect(sessioneFinta.save).toHaveBeenCalledOnce();
    });

    it("popola la sessione con l'id e l'email del nuovo utente", async () => {
      const richiesta = creaRequest({
        email: "nuovo@esempio.it",
        password: "passwordSicura99",
      });

      await POST(richiesta);

      expect(sessioneFinta.utenteId).toBe(UTENTE_CREATO.id);
      expect(sessioneFinta.email).toBe(UTENTE_CREATO.email);
    });

    it("normalizza l'email a minuscolo prima di salvarla nel database", async () => {
      const richiesta = creaRequest({
        email: "MAIUSCOLO@Esempio.IT",
        password: "passwordSicura99",
      });

      await POST(richiesta);

      expect(mockUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "maiuscolo@esempio.it",
          }),
        }),
      );
    });

    it("salva l'hash bcrypt nel campo passwordHash, non la password in chiaro", async () => {
      const richiesta = creaRequest({
        email: "nuovo@esempio.it",
        password: "passwordSicura99",
      });

      await POST(richiesta);

      expect(mockUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: HASH_FINTO,
          }),
        }),
      );
    });
  });
});
