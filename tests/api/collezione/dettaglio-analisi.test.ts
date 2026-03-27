import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/* ── Mock: sessione ────────────────────────────────────────────── */

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessione: vi.fn(),
}));

/* ── Mock: Prisma ──────────────────────────────────────────────── */

vi.mock("@/lib/db/client", () => ({
  prisma: {
    analisi: {
      findUnique: vi.fn(),
    },
  },
}));

/* ── Import handler e moduli mockati ───────────────────────────── */

import { GET } from "@/app/api/collezione/[idAnalisi]/route";
import { ottieniSessione } from "@/lib/auth/sessione";
import { prisma } from "@/lib/db/client";

const ottieniSessioneMock = vi.mocked(ottieniSessione);
const findUniqueMock = vi.mocked(prisma.analisi.findUnique);

/* ── Helper ────────────────────────────────────────────────────── */

function creaRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/collezione/abc123");
}

function creaParams(idAnalisi = "analisi-1") {
  return { params: Promise.resolve({ idAnalisi }) };
}

/* ── Test ───────────────────────────────────────────────────────── */

describe("GET /api/collezione/[idAnalisi]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ottieniSessioneMock.mockResolvedValue({ utenteId: undefined } as never);
  });

  it("restituisce 401 se l'utente non è autenticato", async () => {
    const risposta = await GET(creaRequest(), creaParams());

    expect(risposta.status).toBe(401);
    const corpo = await risposta.json();
    expect(corpo).toEqual({
      errore: "Devi effettuare l'accesso per visualizzare un'analisi.",
    });
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("restituisce 404 se l'analisi non esiste", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    findUniqueMock.mockResolvedValue(null);

    const risposta = await GET(creaRequest(), creaParams("inesistente"));

    expect(risposta.status).toBe(404);
    const corpo = await risposta.json();
    expect(corpo).toEqual({ errore: "Analisi non trovata." });
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { id: "inesistente" },
    });
  });

  it("restituisce 404 se l'analisi appartiene a un altro utente", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    findUniqueMock.mockResolvedValue({
      id: "analisi-altrui",
      utenteId: "utente-diverso",
      datiAnalisi: { nome: "Rosa" },
      urlFoto: "https://example.com/rosa.jpg",
      createdAt: new Date("2026-01-15"),
    } as never);

    const risposta = await GET(creaRequest(), creaParams("analisi-altrui"));

    expect(risposta.status).toBe(404);
    const corpo = await risposta.json();
    expect(corpo).toEqual({ errore: "Analisi non trovata." });
  });

  it("restituisce 200 con i dati dell'analisi per il proprietario", async () => {
    const dataCreazione = new Date("2026-03-20T10:00:00.000Z");
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    findUniqueMock.mockResolvedValue({
      id: "analisi-1",
      utenteId: "utente-1",
      datiAnalisi: { nomeComune: "Girasole", salute: "buona" },
      urlFoto: "https://blob.example.com/girasole.webp",
      createdAt: dataCreazione,
      hashFoto: "abc",
    } as never);

    const risposta = await GET(creaRequest(), creaParams("analisi-1"));

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo).toEqual({
      datiAnalisi: { nomeComune: "Girasole", salute: "buona" },
      urlFoto: "https://blob.example.com/girasole.webp",
      createdAt: dataCreazione.toISOString(),
    });
  });

  it("il JSON restituito contiene solo datiAnalisi, urlFoto e createdAt", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    findUniqueMock.mockResolvedValue({
      id: "analisi-1",
      utenteId: "utente-1",
      datiAnalisi: { tipo: "orchidea" },
      urlFoto: "https://blob.example.com/orchidea.webp",
      createdAt: new Date("2026-02-10"),
      hashFoto: "hash-segreto",
    } as never);

    const risposta = await GET(creaRequest(), creaParams("analisi-1"));
    const corpo = await risposta.json();

    const chiavi = Object.keys(corpo);
    expect(chiavi).toHaveLength(3);
    expect(chiavi).toEqual(
      expect.arrayContaining(["datiAnalisi", "urlFoto", "createdAt"]),
    );
    // Campi interni come hashFoto e utenteId non devono apparire
    expect(corpo).not.toHaveProperty("hashFoto");
    expect(corpo).not.toHaveProperty("utenteId");
    expect(corpo).not.toHaveProperty("id");
  });
});
