import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessione: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {
    analisi: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  del: vi.fn(),
}));


import { ottieniSessione } from "@/lib/auth/sessione";
import { prisma } from "@/lib/db/client";
import { put, del } from "@vercel/blob";
import { POST } from "@/app/api/collezione/route";

const ottieniSessioneMock = vi.mocked(ottieniSessione);
const createMock = vi.mocked(prisma.analisi.create);
const putMock = vi.mocked(put);
const delMock = vi.mocked(del);

const DATI_ANALISI_VALIDI = JSON.stringify({
  nomeComune: "Rosa",
  nomeScientifico: "Rosa gallica",
  statoSalute: "good",
  descrizioneSalute: "Buona salute",
  consigliCura: [],
});

function creaRichiestaConFormData(campi: Record<string, string | File>): NextRequest {
  const formData = new FormData();
  for (const [chiave, valore] of Object.entries(campi)) {
    formData.append(chiave, valore);
  }

  const richiesta = new NextRequest("http://localhost/api/collezione", {
    method: "POST",
  });

  // Sovrascrive formData() per restituire direttamente il FormData costruito,
  // evitando incompatibilità tra il File di jsdom e quello di Node/undici.
  vi.spyOn(richiesta, "formData").mockResolvedValue(formData);

  return richiesta;
}

describe("POST /api/collezione", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("salvataggio con successo (201)", async () => {
    ottieniSessioneMock.mockResolvedValue({
      utenteId: "utente-123",
      email: "mario@example.com",
    } as any);

    putMock.mockResolvedValue({
      url: "https://blob.vercel-storage.com/collezione/utente-123/abc.jpg",
    } as any);

    const analisiAttesa = {
      id: "analisi-1",
      urlFoto: "https://blob.vercel-storage.com/collezione/utente-123/abc.jpg",
      createdAt: new Date().toISOString(),
    };
    createMock.mockResolvedValue(analisiAttesa as any);

    const foto = new File([new Uint8Array([0xff, 0xd8, 0xff])], "test.jpg", {
      type: "image/jpeg",
    });

    const richiesta = creaRichiestaConFormData({ foto, datiAnalisi: DATI_ANALISI_VALIDI });
    const risposta = await POST(richiesta);
    const corpo = await risposta.json();

    expect(risposta.status).toBe(201);
    expect(corpo.messaggio).toBe("Analisi salvata nella tua collezione!");
    expect(corpo.analisi).toEqual(analisiAttesa);
    expect(putMock).toHaveBeenCalledOnce();
    expect(createMock).toHaveBeenCalledOnce();
  });

  it("rifiuto utente non autenticato (401)", async () => {
    ottieniSessioneMock.mockResolvedValue({} as any);

    const foto = new File([new Uint8Array([0xff])], "test.jpg", {
      type: "image/jpeg",
    });

    const richiesta = creaRichiestaConFormData({ foto, datiAnalisi: DATI_ANALISI_VALIDI });
    const risposta = await POST(richiesta);
    const corpo = await risposta.json();

    expect(risposta.status).toBe(401);
    expect(corpo.errore).toBeDefined();
  });

  it("rifiuto duplicato tramite constraint unique (409)", async () => {
    ottieniSessioneMock.mockResolvedValue({
      utenteId: "utente-123",
      email: "mario@example.com",
    } as any);

    putMock.mockResolvedValue({
      url: "https://blob.vercel-storage.com/collezione/utente-123/abc.jpg",
    } as any);

    delMock.mockResolvedValue(undefined as any);

    const erroreUniqueViolation = Object.assign(new Error("Unique constraint violation"), {
      code: "P2002",
      name: "PrismaClientKnownRequestError",
    });
    createMock.mockRejectedValue(erroreUniqueViolation);

    const foto = new File([new Uint8Array([0xff, 0xd8])], "test.jpg", {
      type: "image/jpeg",
    });

    const richiesta = creaRichiestaConFormData({ foto, datiAnalisi: DATI_ANALISI_VALIDI });
    const risposta = await POST(richiesta);
    const corpo = await risposta.json();

    expect(risposta.status).toBe(409);
    expect(corpo.errore).toBe("Questa foto è già presente nella tua collezione.");
    expect(delMock).toHaveBeenCalledOnce();
  });

  it("payload incompleto senza foto (400)", async () => {
    ottieniSessioneMock.mockResolvedValue({
      utenteId: "utente-123",
      email: "mario@example.com",
    } as any);

    const richiesta = creaRichiestaConFormData({ datiAnalisi: DATI_ANALISI_VALIDI });
    const risposta = await POST(richiesta);
    const corpo = await risposta.json();

    expect(risposta.status).toBe(400);
    expect(corpo.errore).toBe("Nessuna foto ricevuta. Carica l'immagine della pianta analizzata.");
  });

  it("rifiuto dati analisi senza campi obbligatori (400)", async () => {
    ottieniSessioneMock.mockResolvedValue({
      utenteId: "utente-123",
      email: "mario@example.com",
    } as any);

    const foto = new File([new Uint8Array([0xff, 0xd8])], "test.jpg", {
      type: "image/jpeg",
    });
    const datiIncompleti = JSON.stringify({ descrizione: "manca nomeComune" });

    const richiesta = creaRichiestaConFormData({ foto, datiAnalisi: datiIncompleti });
    const risposta = await POST(richiesta);
    const corpo = await risposta.json();

    expect(risposta.status).toBe(400);
    expect(corpo.errore).toContain("Campi mancanti");
  });
});
