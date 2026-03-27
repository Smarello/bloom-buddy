/**
 * Test suite per POST /api/auth/cambio-password
 *
 * NOTA sui mock: i factory di vi.mock vengono hoistati da Vitest prima di qualsiasi
 * altra istruzione del file. Per questo motivo i factory NON possono referenziare
 * variabili definite nel file — devono essere completamente autonomi.
 * I mock vengono recuperati dopo l'import tramite vi.mocked().
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Factory dei mock — nessun riferimento a variabili esterne
// ---------------------------------------------------------------------------

vi.mock("@/lib/db/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessione: vi.fn(),
  ottieniSessioneServer: vi.fn(),
  OPZIONI_SESSIONE: {},
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Import dell'handler e dei moduli mockati (DOPO i vi.mock)
// ---------------------------------------------------------------------------

import { POST } from "@/app/api/auth/cambio-password/route";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";
import bcrypt from "bcryptjs";

// Riferimento tipizzato ai mock per usare le API di Vitest
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockUpdate = vi.mocked(prisma.user.update);
const mockOttieniSessione = vi.mocked(ottieniSessione);
const mockBcryptCompare = vi.mocked(bcrypt.compare);
const mockBcryptHash = vi.mocked(bcrypt.hash);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function creaRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/cambio-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function creaSessioneAutenticata() {
  return {
    utenteId: "id-utente-abc123",
    email: "utente@esempio.it",
    save: vi.fn().mockResolvedValue(undefined),
  };
}

function creaSessioneNonAutenticata() {
  return {
    utenteId: undefined as string | undefined,
    email: undefined as string | undefined,
    save: vi.fn().mockResolvedValue(undefined),
  };
}

const UTENTE_ESISTENTE = {
  passwordHash: "$2b$12$hashFintoPertestUnitario",
};

const BODY_VALIDO = {
  passwordAttuale: "VecchiaPassword1",
  nuovaPassword: "NuovaPassword1",
  confermaPassword: "NuovaPassword1",
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("POST /api/auth/cambio-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOttieniSessione.mockResolvedValue(creaSessioneAutenticata() as never);
    mockFindUnique.mockResolvedValue(UTENTE_ESISTENTE as never);
    mockBcryptCompare.mockResolvedValue(true as never);
    mockBcryptHash.mockResolvedValue("$2b$12$nuovoHashFinto" as never);
    mockUpdate.mockResolvedValue({} as never);
  });

  // -------------------------------------------------------------------------
  describe("utente non autenticato", () => {
    it("restituisce 401 se la sessione non ha utenteId", async () => {
      mockOttieniSessione.mockResolvedValue(
        creaSessioneNonAutenticata() as never,
      );

      const richiesta = creaRequest(BODY_VALIDO);
      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(401);
      expect(dati.errore).toBe("Devi effettuare l'accesso.");
    });
  });

  // -------------------------------------------------------------------------
  describe("body mancante o invalido", () => {
    it("restituisce 400 se il body non è JSON valido", async () => {
      const richiestaRotta = new NextRequest(
        "http://localhost/api/auth/cambio-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "non è JSON{{{",
        },
      );

      const risposta = await POST(richiestaRotta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBe("Richiesta non valida.");
    });

    it("restituisce 400 se manca passwordAttuale", async () => {
      const richiesta = creaRequest({
        nuovaPassword: "NuovaPassword1",
        confermaPassword: "NuovaPassword1",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBe("Tutti i campi sono obbligatori.");
    });

    it("restituisce 400 se manca nuovaPassword", async () => {
      const richiesta = creaRequest({
        passwordAttuale: "VecchiaPassword1",
        confermaPassword: "NuovaPassword1",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBe("Tutti i campi sono obbligatori.");
    });

    it("restituisce 400 se manca confermaPassword", async () => {
      const richiesta = creaRequest({
        passwordAttuale: "VecchiaPassword1",
        nuovaPassword: "NuovaPassword1",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBe("Tutti i campi sono obbligatori.");
    });
  });

  // -------------------------------------------------------------------------
  describe("validazione nuova password", () => {
    it("restituisce 400 se la nuova password è più corta di 8 caratteri", async () => {
      const richiesta = creaRequest({
        passwordAttuale: "VecchiaPassword1",
        nuovaPassword: "corta",
        confermaPassword: "corta",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBe(
        "La nuova password deve essere di almeno 8 caratteri.",
      );
    });

    it("restituisce 400 se la conferma non corrisponde alla nuova password", async () => {
      const richiesta = creaRequest({
        passwordAttuale: "VecchiaPassword1",
        nuovaPassword: "NuovaPassword1",
        confermaPassword: "PasswordDiversa1",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBe(
        "La nuova password e la conferma non coincidono.",
      );
    });
  });

  // -------------------------------------------------------------------------
  describe("password attuale errata", () => {
    it("restituisce 401 se la password attuale non corrisponde", async () => {
      mockBcryptCompare.mockResolvedValue(false as never);

      const richiesta = creaRequest(BODY_VALIDO);
      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(401);
      expect(dati.errore).toBe("La password attuale non è corretta.");
    });
  });

  // -------------------------------------------------------------------------
  describe("cambio password riuscito", () => {
    it("restituisce 200 con { successo: true }", async () => {
      const richiesta = creaRequest(BODY_VALIDO);
      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(200);
      expect(dati.successo).toBe(true);
    });

    it("aggiorna l'hash della password nel database", async () => {
      const richiesta = creaRequest(BODY_VALIDO);
      await POST(richiesta);

      expect(mockBcryptHash).toHaveBeenCalledWith("NuovaPassword1", 12);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "id-utente-abc123" },
        data: { passwordHash: "$2b$12$nuovoHashFinto" },
      });
    });
  });
});
