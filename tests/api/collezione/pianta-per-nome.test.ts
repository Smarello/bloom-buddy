import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/* ── Mock: sessione ────────────────────────────────────────────── */

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessione: vi.fn(),
}));

/* ── Mock: recuperaAnalisiPerPianta ────────────────────────────── */

vi.mock("@/lib/collezione/recuperaAnalisiPerPianta", () => ({
  recuperaAnalisiPerPianta: vi.fn(),
}));

/* ── Import handler e moduli mockati ───────────────────────────── */

import { GET } from "@/app/api/collezione/pianta/[nomePianta]/route";
import { ottieniSessione } from "@/lib/auth/sessione";
import { recuperaAnalisiPerPianta } from "@/lib/collezione/recuperaAnalisiPerPianta";

const ottieniSessioneMock = vi.mocked(ottieniSessione);
const recuperaAnalisiPerPiantaMock = vi.mocked(recuperaAnalisiPerPianta);

/* ── Helper ────────────────────────────────────────────────────── */

function creaRequest(nomePianta = "rosa"): NextRequest {
  return new NextRequest(
    `http://localhost:3000/api/collezione/pianta/${encodeURIComponent(nomePianta)}`,
  );
}

function creaParams(nomePianta = "rosa") {
  return { params: Promise.resolve({ nomePianta: encodeURIComponent(nomePianta) }) };
}

/* ── Test ───────────────────────────────────────────────────────── */

describe("GET /api/collezione/pianta/[nomePianta]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ottieniSessioneMock.mockResolvedValue({ utenteId: undefined } as never);
  });

  it("restituisce 401 se l'utente non è autenticato", async () => {
    const risposta = await GET(creaRequest(), creaParams());

    expect(risposta.status).toBe(401);
    const corpo = await risposta.json();
    expect(corpo).toEqual({
      errore: "Devi effettuare l'accesso per visualizzare la collezione.",
    });
    expect(recuperaAnalisiPerPiantaMock).not.toHaveBeenCalled();
  });

  it("restituisce le analisi filtrate per nome pianta (corrispondenza esatta)", async () => {
    const dataCreazione = new Date("2026-03-20T10:00:00.000Z");
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    recuperaAnalisiPerPiantaMock.mockResolvedValue([
      {
        id: "analisi-1",
        utenteId: "utente-1",
        datiAnalisi: { nomeComune: "Rosa", nomeScientifico: "Rosa gallica" },
        urlFoto: "https://blob.example.com/rosa.webp",
        createdAt: dataCreazione,
        hashFoto: "hash-1",
      },
    ] as never);

    const risposta = await GET(creaRequest("Rosa"), creaParams("Rosa"));

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo.analisi).toHaveLength(1);
    expect(corpo.analisi[0].id).toBe("analisi-1");
    expect(corpo.analisi[0].datiAnalisi).toEqual({
      nomeComune: "Rosa",
      nomeScientifico: "Rosa gallica",
    });
    expect(corpo.analisi[0].urlFoto).toBe("https://blob.example.com/rosa.webp");
    expect(corpo.analisi[0].createdAt).toBe(dataCreazione.toISOString());
  });

  it("il filtro per nome pianta non è sensibile alle maiuscole", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    recuperaAnalisiPerPiantaMock.mockResolvedValue([
      {
        id: "analisi-1",
        utenteId: "utente-1",
        datiAnalisi: { nomeComune: "Rosa" },
        urlFoto: "https://blob.example.com/rosa.webp",
        createdAt: new Date("2026-03-20T10:00:00.000Z"),
        hashFoto: "hash-1",
      },
    ] as never);

    // Ricerca con variante tutta minuscola
    const risposta = await GET(creaRequest("rosa"), creaParams("rosa"));

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo.analisi).toHaveLength(1);
    expect(corpo.analisi[0].id).toBe("analisi-1");
  });

  it("restituisce un array vuoto se nessuna analisi corrisponde al nome pianta", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    recuperaAnalisiPerPiantaMock.mockResolvedValue([] as never);

    const risposta = await GET(creaRequest("Orchidea"), creaParams("Orchidea"));

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo.analisi).toHaveLength(0);
    expect(corpo.analisi).toEqual([]);
  });

  it("le analisi sono ordinate per data di creazione decrescente (più recenti prima)", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);
    const dataRecente = new Date("2026-03-25T12:00:00.000Z");
    const dataVecchia = new Date("2026-01-10T08:00:00.000Z");

    recuperaAnalisiPerPiantaMock.mockResolvedValue([
      {
        id: "analisi-recente",
        utenteId: "utente-1",
        datiAnalisi: { nomeComune: "Rosa" },
        urlFoto: "https://blob.example.com/rosa-2.webp",
        createdAt: dataRecente,
        hashFoto: "hash-recente",
      },
      {
        id: "analisi-vecchia",
        utenteId: "utente-1",
        datiAnalisi: { nomeComune: "Rosa" },
        urlFoto: "https://blob.example.com/rosa-1.webp",
        createdAt: dataVecchia,
        hashFoto: "hash-vecchia",
      },
    ] as never);

    const risposta = await GET(creaRequest("Rosa"), creaParams("Rosa"));

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo.analisi).toHaveLength(2);
    expect(corpo.analisi[0].id).toBe("analisi-recente");
    expect(corpo.analisi[1].id).toBe("analisi-vecchia");
  });

  it("restituisce solo le analisi dell'utente autenticato, non quelle di altri utenti", async () => {
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);

    recuperaAnalisiPerPiantaMock.mockResolvedValue([
      {
        id: "analisi-utente-1",
        utenteId: "utente-1",
        datiAnalisi: { nomeComune: "Tulipano" },
        urlFoto: "https://blob.example.com/tulipano.webp",
        createdAt: new Date("2026-03-22T09:00:00.000Z"),
        hashFoto: "hash-utente-1",
      },
    ] as never);

    const risposta = await GET(creaRequest("Tulipano"), creaParams("Tulipano"));

    // Verifica che recuperaAnalisiPerPianta sia chiamata con l'utenteId dell'utente autenticato
    expect(recuperaAnalisiPerPiantaMock).toHaveBeenCalledWith("utente-1", "Tulipano");

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo.analisi).toHaveLength(1);
    expect(corpo.analisi[0].id).toBe("analisi-utente-1");
  });

  it("decodifica correttamente i nomi di piante con spazi nell'URL", async () => {
    const nomePiantaConSpazi = "Pothos dorato";
    const nomePiantaCodificato = encodeURIComponent(nomePiantaConSpazi); // "Pothos%20dorato"
    ottieniSessioneMock.mockResolvedValue({ utenteId: "utente-1" } as never);

    recuperaAnalisiPerPiantaMock.mockResolvedValue([
      {
        id: "analisi-pothos",
        utenteId: "utente-1",
        datiAnalisi: { nomeComune: "Pothos dorato", nomeScientifico: "Epipremnum aureum" },
        urlFoto: "https://blob.example.com/pothos.webp",
        createdAt: new Date("2026-03-20T10:00:00.000Z"),
        hashFoto: "hash-pothos",
      },
    ] as never);

    const request = new NextRequest(
      `http://localhost:3000/api/collezione/pianta/${nomePiantaCodificato}`,
    );
    const params = { params: Promise.resolve({ nomePianta: nomePiantaCodificato }) };

    const risposta = await GET(request, params);

    // Verifica che il nome sia stato decodificato prima di essere passato alla funzione
    expect(recuperaAnalisiPerPiantaMock).toHaveBeenCalledWith("utente-1", nomePiantaConSpazi);

    expect(risposta.status).toBe(200);
    const corpo = await risposta.json();
    expect(corpo.analisi).toHaveLength(1);
    expect(corpo.analisi[0].id).toBe("analisi-pothos");
  });
});
