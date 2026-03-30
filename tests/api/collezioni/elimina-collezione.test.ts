import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/* ── Mock: sessione ────────────────────────────────────────────── */

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessione: vi.fn(),
}));

/* ── Mock: Prisma ──────────────────────────────────────────────── */

const collezioneFindUniqueMock = vi.fn();
const analisiDeleteManyMock = vi.fn();
const collezioneDeleteMock = vi.fn();
const transactionMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    $transaction: (...args: unknown[]) => transactionMock(...args),
    collezione: {
      findUnique: (...args: unknown[]) => collezioneFindUniqueMock(...args),
      delete: (...args: unknown[]) => collezioneDeleteMock(...args),
    },
    analisi: {
      deleteMany: (...args: unknown[]) => analisiDeleteManyMock(...args),
    },
  },
}));

/* ── Mock: Vercel Blob ────────────────────────────────────────── */

vi.mock("@vercel/blob", () => ({
  del: vi.fn(),
}));

/* ── Import handler e moduli mockati ───────────────────────────── */

import { DELETE } from "@/app/api/collezioni/[idCollezione]/route";
import { ottieniSessione } from "@/lib/auth/sessione";
import { del } from "@vercel/blob";

const ottieniSessioneMock = vi.mocked(ottieniSessione);
const delMock = vi.mocked(del);

/* ── Helper ────────────────────────────────────────────────────── */

function creaRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/collezioni/abc123", {
    method: "DELETE",
  });
}

function creaParams(idCollezione = "collezione-1") {
  return { params: Promise.resolve({ idCollezione }) };
}

/* ── Test ───────────────────────────────────────────────────────── */

describe("DELETE /api/collezioni/[idCollezione]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ottieniSessioneMock.mockResolvedValue({ utenteId: undefined } as never);
    transactionMock.mockResolvedValue(undefined);
  });

  it("restituisce 401 se l'utente non è autenticato", async () => {
    const risposta = await DELETE(creaRequest(), creaParams());

    expect(risposta.status).toBe(401);
    const corpo = await risposta.json();
    expect(corpo).toEqual({
      errore: "Devi effettuare l'accesso per eliminare una collezione.",
    });
    expect(collezioneFindUniqueMock).not.toHaveBeenCalled();
  });

  it("restituisce 404 se la collezione non esiste", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    collezioneFindUniqueMock.mockResolvedValue(null);

    const risposta = await DELETE(creaRequest(), creaParams("inesistente"));

    expect(risposta.status).toBe(404);
    const corpo = await risposta.json();
    expect(corpo).toEqual({ errore: "Collezione non trovata." });
  });

  it("restituisce 403 se la collezione appartiene a un altro utente", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    collezioneFindUniqueMock.mockResolvedValue({
      id: "collezione-altrui",
      utenteId: "utente-diverso",
      analisi: [],
    });

    const risposta = await DELETE(creaRequest(), creaParams("collezione-altrui"));

    expect(risposta.status).toBe(403);
    const corpo = await risposta.json();
    expect(corpo).toEqual({
      errore: "Non sei autorizzato a eliminare questa collezione.",
    });
    expect(transactionMock).not.toHaveBeenCalled();
  });

  it("elimina una collezione vuota con successo (200)", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    collezioneFindUniqueMock.mockResolvedValue({
      id: "collezione-vuota",
      utenteId: "utente-1",
      analisi: [],
    });

    const risposta = await DELETE(creaRequest(), creaParams("collezione-vuota"));

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo).toEqual({ messaggio: "Collezione eliminata con successo." });
    expect(transactionMock).toHaveBeenCalledOnce();
    expect(delMock).not.toHaveBeenCalled();
  });

  it("elimina una collezione con 3 analisi e rimuove i blob associati", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);

    const urlFoto = [
      "https://blob.vercel-storage.com/foto-1.jpg",
      "https://blob.vercel-storage.com/foto-2.jpg",
      "https://blob.vercel-storage.com/foto-3.jpg",
    ];

    collezioneFindUniqueMock.mockResolvedValue({
      id: "collezione-piena",
      utenteId: "utente-1",
      analisi: [
        { urlFoto: urlFoto[0] },
        { urlFoto: urlFoto[1] },
        { urlFoto: urlFoto[2] },
      ],
    });

    delMock.mockResolvedValue(undefined as never);

    const risposta = await DELETE(creaRequest(), creaParams("collezione-piena"));

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo).toEqual({ messaggio: "Collezione eliminata con successo." });

    // Verifica che la transazione sia stata chiamata con deleteMany + delete
    expect(transactionMock).toHaveBeenCalledOnce();

    // Verifica che del() sia stato chiamato per ogni URL blob
    expect(delMock).toHaveBeenCalledTimes(3);
    expect(delMock).toHaveBeenCalledWith(urlFoto[0]);
    expect(delMock).toHaveBeenCalledWith(urlFoto[1]);
    expect(delMock).toHaveBeenCalledWith(urlFoto[2]);
  });
});
