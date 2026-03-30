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
      delete: vi.fn(),
    },
  },
}));

/* ── Mock: Vercel Blob ────────────────────────────────────────── */

vi.mock("@vercel/blob", () => ({
  del: vi.fn(),
}));

/* ── Import handler e moduli mockati ───────────────────────────── */

import { DELETE } from "@/app/api/collezione/[idAnalisi]/route";
import { ottieniSessione } from "@/lib/auth/sessione";
import { prisma } from "@/lib/db/client";
import { del } from "@vercel/blob";

const ottieniSessioneMock = vi.mocked(ottieniSessione);
const findUniqueMock = vi.mocked(prisma.analisi.findUnique);
const deleteMock = vi.mocked(prisma.analisi.delete);
const delBlobMock = vi.mocked(del);

/* ── Helper ────────────────────────────────────────────────────── */

function creaRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/collezione/abc123", {
    method: "DELETE",
  });
}

function creaParams(idAnalisi = "analisi-1") {
  return { params: Promise.resolve({ idAnalisi }) };
}

/* ── Test ───────────────────────────────────────────────────────── */

describe("DELETE /api/collezione/[idAnalisi]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ottieniSessioneMock.mockResolvedValue({ utenteId: undefined } as never);
  });

  it("restituisce 401 se l'utente non è autenticato", async () => {
    const risposta = await DELETE(creaRequest(), creaParams());

    expect(risposta.status).toBe(401);
    const corpo = await risposta.json();
    expect(corpo).toEqual({
      errore: "Devi effettuare l'accesso per eliminare un'analisi.",
    });
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("restituisce 404 se l'analisi non esiste", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    findUniqueMock.mockResolvedValue(null);

    const risposta = await DELETE(creaRequest(), creaParams("inesistente"));

    expect(risposta.status).toBe(404);
    const corpo = await risposta.json();
    expect(corpo).toEqual({ errore: "Analisi non trovata." });
    expect(deleteMock).not.toHaveBeenCalled();
    expect(delBlobMock).not.toHaveBeenCalled();
  });

  it("restituisce 404 se l'analisi appartiene a un altro utente", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    findUniqueMock.mockResolvedValue({
      id: "analisi-altrui",
      utenteId: "utente-diverso",
      urlFoto: "https://blob.example.com/foto.webp",
    } as never);

    const risposta = await DELETE(creaRequest(), creaParams("analisi-altrui"));

    expect(risposta.status).toBe(404);
    const corpo = await risposta.json();
    expect(corpo).toEqual({ errore: "Analisi non trovata." });
    expect(deleteMock).not.toHaveBeenCalled();
    expect(delBlobMock).not.toHaveBeenCalled();
  });

  it("elimina l'analisi e la foto dal blob e restituisce 200", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    findUniqueMock.mockResolvedValue({
      id: "analisi-1",
      utenteId: "utente-1",
      urlFoto: "https://blob.example.com/girasole.webp",
    } as never);
    deleteMock.mockResolvedValue({} as never);
    delBlobMock.mockResolvedValue(undefined as never);

    const risposta = await DELETE(creaRequest(), creaParams("analisi-1"));

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo).toEqual({ messaggio: "Analisi eliminata con successo." });

    expect(deleteMock).toHaveBeenCalledWith({
      where: { id: "analisi-1" },
    });
    expect(delBlobMock).toHaveBeenCalledWith(
      "https://blob.example.com/girasole.webp",
    );
  });

  it("completa l'eliminazione anche se la cancellazione dal blob fallisce", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    findUniqueMock.mockResolvedValue({
      id: "analisi-1",
      utenteId: "utente-1",
      urlFoto: "https://blob.example.com/girasole.webp",
    } as never);
    deleteMock.mockResolvedValue({} as never);
    delBlobMock.mockRejectedValue(new Error("Blob non raggiungibile"));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const risposta = await DELETE(creaRequest(), creaParams("analisi-1"));

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo).toEqual({ messaggio: "Analisi eliminata con successo." });
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
