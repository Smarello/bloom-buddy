import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessione: vi.fn(),
}));

const transactionCallback = vi.fn();

const collezioneFindUniqueMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    $transaction: (callback: (tx: unknown) => Promise<unknown>) => transactionCallback(callback),
    collezione: { findUnique: (...args: unknown[]) => collezioneFindUniqueMock(...args) },
  },
}));

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  del: vi.fn(),
}));


import { ottieniSessione } from "@/lib/auth/sessione";
import { put, del } from "@vercel/blob";
import { POST } from "@/app/api/collezione/route";

const ottieniSessioneMock = vi.mocked(ottieniSessione);
const putMock = vi.mocked(put);
const delMock = vi.mocked(del);

// Mock transaction executor: simula il tx passato alla callback di $transaction
const collezioneCreateMock = vi.fn();
const analisiCreateMock = vi.fn();
const fakeTx = {
  collezione: { create: collezioneCreateMock },
  analisi: { create: analisiCreateMock },
};

function setupTransaction() {
  transactionCallback.mockImplementation(async (callback: (tx: typeof fakeTx) => Promise<unknown>) => {
    return callback(fakeTx);
  });
}

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
    collezioneCreateMock.mockResolvedValue({ id: "collezione-1" });
    analisiCreateMock.mockResolvedValue(analisiAttesa as any);
    setupTransaction();

    const foto = new File([new Uint8Array([0xff, 0xd8, 0xff])], "test.jpg", {
      type: "image/jpeg",
    });

    const richiesta = creaRichiestaConFormData({ foto, datiAnalisi: DATI_ANALISI_VALIDI });
    const risposta = await POST(richiesta);
    const corpo = await risposta.json();

    expect(risposta.status).toBe(201);
    expect(corpo.messaggio).toBe("Analisi salvata nella tua collezione!");
    expect(corpo.analisi).toEqual(analisiAttesa);
    expect(corpo.collezioneId).toBe("collezione-1");
    expect(putMock).toHaveBeenCalledOnce();
    expect(collezioneCreateMock).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        nome: "Rosa",
        nomeScientifico: "Rosa gallica",
        utenteId: "utente-123",
      }),
    }));
    expect(analisiCreateMock).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        collezioneId: "collezione-1",
        utenteId: "utente-123",
      }),
    }));
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
    transactionCallback.mockRejectedValue(erroreUniqueViolation);

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

  describe("con collezioneId esistente", () => {
    const sessioneAutenticata = {
      utenteId: "utente-123",
      email: "mario@example.com",
    };

    const foto = () =>
      new File([new Uint8Array([0xff, 0xd8, 0xff])], "test.jpg", {
        type: "image/jpeg",
      });

    beforeEach(() => {
      ottieniSessioneMock.mockResolvedValue(sessioneAutenticata as any);
      putMock.mockResolvedValue({
        url: "https://blob.vercel-storage.com/collezione/utente-123/abc.jpg",
      } as any);
    });

    it("collezioneId valido appartenente all'utente (201)", async () => {
      collezioneFindUniqueMock.mockResolvedValue({
        id: "collezione-esistente",
        utenteId: "utente-123",
      });

      const analisiAttesa = {
        id: "analisi-2",
        urlFoto: "https://blob.vercel-storage.com/collezione/utente-123/abc.jpg",
        createdAt: new Date().toISOString(),
      };
      analisiCreateMock.mockResolvedValue(analisiAttesa as any);
      setupTransaction();

      const richiesta = creaRichiestaConFormData({
        foto: foto(),
        datiAnalisi: DATI_ANALISI_VALIDI,
        collezioneId: "collezione-esistente",
      });
      const risposta = await POST(richiesta);
      const corpo = await risposta.json();

      expect(risposta.status).toBe(201);
      expect(corpo.messaggio).toBe("Analisi salvata nella tua collezione!");
      expect(corpo.collezioneId).toBe("collezione-esistente");
      expect(collezioneCreateMock).not.toHaveBeenCalled();
      expect(analisiCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            collezioneId: "collezione-esistente",
            utenteId: "utente-123",
          }),
        }),
      );
    });

    it("collezioneId appartenente a un altro utente (403)", async () => {
      collezioneFindUniqueMock.mockResolvedValue({
        id: "collezione-altrui",
        utenteId: "utente-altro",
      });

      const richiesta = creaRichiestaConFormData({
        foto: foto(),
        datiAnalisi: DATI_ANALISI_VALIDI,
        collezioneId: "collezione-altrui",
      });
      const risposta = await POST(richiesta);
      const corpo = await risposta.json();

      expect(risposta.status).toBe(403);
      expect(corpo.errore).toBe("Non autorizzato");
      expect(delMock).toHaveBeenCalledOnce();
    });

    it("collezioneId inesistente (404)", async () => {
      collezioneFindUniqueMock.mockResolvedValue(null);

      const richiesta = creaRichiestaConFormData({
        foto: foto(),
        datiAnalisi: DATI_ANALISI_VALIDI,
        collezioneId: "collezione-fantasma",
      });
      const risposta = await POST(richiesta);
      const corpo = await risposta.json();

      expect(risposta.status).toBe(404);
      expect(corpo.errore).toBe("Collezione non trovata");
      expect(delMock).toHaveBeenCalledOnce();
    });
  });
});
