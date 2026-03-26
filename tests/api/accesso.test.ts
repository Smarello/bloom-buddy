/**
 * Test suite per POST /api/auth/accesso
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
  },
}));

// ---------------------------------------------------------------------------
// Import dell'handler e dei moduli mockati (DOPO i vi.mock)
// ---------------------------------------------------------------------------

import { POST } from "@/app/api/auth/accesso/route";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";
import bcrypt from "bcryptjs";

// Riferimento tipizzato ai mock per usare le API di Vitest
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockOttieniSessione = vi.mocked(ottieniSessione);
const mockBcryptCompare = vi.mocked(bcrypt.compare);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function creaRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/accesso", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function creaSessioneFinta() {
  return {
    utenteId: undefined as string | undefined,
    email: undefined as string | undefined,
    save: vi.fn().mockResolvedValue(undefined),
  };
}

const UTENTE_ESISTENTE = {
  id: "id-utente-abc123",
  email: "utente@esempio.it",
  passwordHash: "$2b$12$hashFintoPertestUnitario",
};

const MESSAGGIO_CREDENZIALI_ERRATE =
  "Email o password non corrispondono. Nessun problema, riprova con calma!";

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("POST /api/auth/accesso", () => {
  let sessioneFinta: ReturnType<typeof creaSessioneFinta>;

  beforeEach(() => {
    vi.clearAllMocks();
    sessioneFinta = creaSessioneFinta();
    mockOttieniSessione.mockResolvedValue(sessioneFinta as never);
  });

  // -------------------------------------------------------------------------
  describe("payload mancante o malformato", () => {
    it("restituisce 400 con errore 'Richiesta non valida.' se il body non è JSON valido", async () => {
      const richiestaRotta = new NextRequest(
        "http://localhost/api/auth/accesso",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "questo non è JSON{{{",
        },
      );

      const risposta = await POST(richiestaRotta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBe("Richiesta non valida.");
    });

    it("restituisce 400 con errore 'Email e password sono obbligatori.' se manca l'email", async () => {
      const richiesta = creaRequest({ password: "password123" });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBe("Email e password sono obbligatori.");
    });

    it("restituisce 400 con errore 'Email e password sono obbligatori.' se manca la password", async () => {
      const richiesta = creaRequest({ email: "utente@esempio.it" });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBe("Email e password sono obbligatori.");
    });
  });

  // -------------------------------------------------------------------------
  describe("credenziali errate", () => {
    it("restituisce 401 con messaggio incoraggiante se l'utente non esiste", async () => {
      mockFindUnique.mockResolvedValue(null);

      const richiesta = creaRequest({
        email: "inesistente@esempio.it",
        password: "password123",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(401);
      expect(dati.errore).toBe(MESSAGGIO_CREDENZIALI_ERRATE);
    });

    it("restituisce 401 con lo stesso messaggio se la password è sbagliata (anti-enumerazione)", async () => {
      mockFindUnique.mockResolvedValue(UTENTE_ESISTENTE as never);
      mockBcryptCompare.mockResolvedValue(false as never);

      const richiesta = creaRequest({
        email: "utente@esempio.it",
        password: "passwordSbagliata",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(401);
      expect(dati.errore).toBe(MESSAGGIO_CREDENZIALI_ERRATE);
    });
  });

  // -------------------------------------------------------------------------
  describe("accesso valido", () => {
    beforeEach(() => {
      mockFindUnique.mockResolvedValue(UTENTE_ESISTENTE as never);
      mockBcryptCompare.mockResolvedValue(true as never);
    });

    it("restituisce 200 con { successo: true } per credenziali corrette", async () => {
      const richiesta = creaRequest({
        email: "utente@esempio.it",
        password: "passwordCorretta",
      });

      const risposta = await POST(richiesta);
      const dati = await risposta.json();

      expect(risposta.status).toBe(200);
      expect(dati.successo).toBe(true);
    });

    it("popola la sessione con utenteId e email e chiama save()", async () => {
      const richiesta = creaRequest({
        email: "utente@esempio.it",
        password: "passwordCorretta",
      });

      await POST(richiesta);

      expect(sessioneFinta.utenteId).toBe(UTENTE_ESISTENTE.id);
      expect(sessioneFinta.email).toBe(UTENTE_ESISTENTE.email);
      expect(sessioneFinta.save).toHaveBeenCalledOnce();
    });
  });
});
