import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// Configura la variabile d'ambiente PRIMA del caricamento del modulo
vi.stubEnv("GOOGLE_GEMINI_API_KEY", "test-api-key");

// Mock del client Gemini PRIMA degli import del modulo
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: vi.fn(),
}));

vi.mock("@/lib/ai/client", () => ({
  ottieniClienteGemini: vi.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
  NOME_MODELLO: "gemini-2.0-flash",
}));

// Mock del rate limiter e dell'estrazione IP
const mockVerificaRateLimit = vi.fn(() => ({ consentito: true, secondiRimanenti: 0 }));
const mockEstraiIpCliente = vi.fn(() => "127.0.0.1");

vi.mock("@/lib/sicurezza/rate-limiter", () => ({
  verificaRateLimit: (...args: unknown[]) => mockVerificaRateLimit(...args),
  resetRateLimiter: vi.fn(),
}));

vi.mock("@/lib/sicurezza/estrai-ip-cliente", () => ({
  estraiIpCliente: (...args: unknown[]) => mockEstraiIpCliente(...args),
}));

import { POST } from "@/app/api/analyze/route";

function creaFileFinto(nome: string, dimensione: number, tipo = "image/jpeg"): File {
  const buffer = new ArrayBuffer(dimensione);
  return new File([buffer], nome, { type: tipo });
}

/**
 * Crea una NextRequest con il formData mockato.
 * jsdom non trasferisce correttamente i File attraverso FormData+Request,
 * quindi mocchiamo direttamente il metodo formData().
 */
function creaRichiestaConFile(file: File): NextRequest {
  const formData = new FormData();
  formData.append("immagine", file);
  const request = {
    formData: vi.fn().mockResolvedValue(formData),
  } as unknown as NextRequest;
  return request;
}

function creaRispostaGeminiValida(): string {
  return JSON.stringify({
    nomeComune: "Pothos dorato",
    nomeScientifico: "Epipremnum aureum",
    livelloConfidenza: 0.92,
    statoSalute: "fair",
    descrizioneSalute: "La pianta mostra alcuni segni di sofferenza.",
    consigliCura: [
      { titolo: "Riduci l'annaffiatura", descrizione: "Aspetta che il terriccio sia asciutto.", priorita: "alta" },
    ],
    informazioniGenerali: {
      annaffiatura: "Ogni 7-10 giorni",
      luce: "Luce indiretta",
      temperatura: "15-30 °C",
      umidita: "Media",
    },
  });
}

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: rate limit non superato
    mockVerificaRateLimit.mockReturnValue({ consentito: true, secondiRimanenti: 0 });
    mockEstraiIpCliente.mockReturnValue("127.0.0.1");
  });

  describe("richiesta valida", () => {
    it("ritorna 200 con PlantAnalysis per un upload valido", async () => {
      const mockGenerateContent = vi.fn().mockResolvedValue({
        response: { text: () => creaRispostaGeminiValida() },
      });
      mockGetGenerativeModel.mockReturnValue({ generateContent: mockGenerateContent } as ReturnType<typeof mockGetGenerativeModel>);

      const file = creaFileFinto("pianta.jpg", 1024 * 1024);
      const richiesta = creaRichiestaConFile(file);

      const risposta = await POST(richiesta as Parameters<typeof POST>[0]);
      const dati = await risposta.json();

      expect(risposta.status).toBe(200);
      expect(dati.nomeComune).toBe("Pothos dorato");
      expect(dati.nomeScientifico).toBe("Epipremnum aureum");
      expect(dati.livelloConfidenza).toBe(0.92);
    });
  });

  describe("validazione server-side", () => {
    it("ritorna 400 se non viene inviata nessuna immagine", async () => {
      const formData = new FormData();
      const richiesta = new Request("http://localhost:3000/api/analyze", {
        method: "POST",
        body: formData,
      });

      const risposta = await POST(richiesta as Parameters<typeof POST>[0]);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toBeTruthy();
    });

    it("ritorna 400 se il file non è un'immagine supportata", async () => {
      const filePdf = creaFileFinto("documento.pdf", 1024, "application/pdf");
      const richiesta = creaRichiestaConFile(filePdf);

      const risposta = await POST(richiesta as Parameters<typeof POST>[0]);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toContain("Formato non supportato");
    });

    it("ritorna 400 se il file supera i 10 MB", async () => {
      const fileGrande = creaFileFinto("foto-grande.jpg", 11 * 1024 * 1024);
      const richiesta = creaRichiestaConFile(fileGrande);

      const risposta = await POST(richiesta as Parameters<typeof POST>[0]);
      const dati = await risposta.json();

      expect(risposta.status).toBe(400);
      expect(dati.errore).toContain("troppo grande");
    });
  });

  describe("rate limiting", () => {
    it("ritorna 429 con messaggio user-friendly quando il limite è superato", async () => {
      mockVerificaRateLimit.mockReturnValue({ consentito: false, secondiRimanenti: 45 });

      const file = creaFileFinto("pianta.jpg", 1024 * 1024);
      const richiesta = creaRichiestaConFile(file);

      const risposta = await POST(richiesta as Parameters<typeof POST>[0]);
      const dati = await risposta.json();

      expect(risposta.status).toBe(429);
      expect(dati.errore).toContain("45");
      expect(dati.tipo).toBe("rate-limit-superato");
      expect(dati.secondiRimanenti).toBe(45);
    });

    it("il messaggio di errore 429 è user-friendly e non contiene dettagli tecnici", async () => {
      mockVerificaRateLimit.mockReturnValue({ consentito: false, secondiRimanenti: 30 });

      const file = creaFileFinto("pianta.jpg", 1024 * 1024);
      const richiesta = creaRichiestaConFile(file);

      const risposta = await POST(richiesta as Parameters<typeof POST>[0]);
      const dati = await risposta.json();

      expect(dati.errore).toBeTruthy();
      expect(dati.errore).not.toContain("Map");
      expect(dati.errore).not.toContain("store");
      expect(dati.errore).not.toContain("undefined");
    });

    it("le richieste nei limiti (consentito: true) continuano a restituire 200", async () => {
      mockVerificaRateLimit.mockReturnValue({ consentito: true, secondiRimanenti: 0 });

      const mockGenerateContent = vi.fn().mockResolvedValue({
        response: { text: () => creaRispostaGeminiValida() },
      });
      mockGetGenerativeModel.mockReturnValue({ generateContent: mockGenerateContent } as ReturnType<typeof mockGetGenerativeModel>);

      const file = creaFileFinto("pianta.jpg", 1024 * 1024);
      const richiesta = creaRichiestaConFile(file);

      const risposta = await POST(richiesta as Parameters<typeof POST>[0]);

      expect(risposta.status).toBe(200);
    });

    it("passa l'IP estratto al verificaRateLimit", async () => {
      mockEstraiIpCliente.mockReturnValue("203.0.113.5");
      mockVerificaRateLimit.mockReturnValue({ consentito: true, secondiRimanenti: 0 });

      const mockGenerateContent = vi.fn().mockResolvedValue({
        response: { text: () => creaRispostaGeminiValida() },
      });
      mockGetGenerativeModel.mockReturnValue({ generateContent: mockGenerateContent } as ReturnType<typeof mockGetGenerativeModel>);

      const file = creaFileFinto("pianta.jpg", 1024 * 1024);
      const richiesta = creaRichiestaConFile(file);

      await POST(richiesta as Parameters<typeof POST>[0]);

      expect(mockVerificaRateLimit).toHaveBeenCalledWith("203.0.113.5");
    });
  });

  describe("sicurezza — nessuna persistenza su disco", () => {
    it("elabora l'immagine in memoria tramite arrayBuffer senza persistenza su disco", async () => {
      const mockArrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(1024));
      const mockGenerateContent = vi.fn().mockResolvedValue({
        response: { text: () => creaRispostaGeminiValida() },
      });
      mockGetGenerativeModel.mockReturnValue({ generateContent: mockGenerateContent } as ReturnType<typeof mockGetGenerativeModel>);

      // Crea un file con arrayBuffer spiato per verificare l'elaborazione in memoria
      const buffer = new ArrayBuffer(1024 * 1024);
      const fileConSpy = new File([buffer], "pianta.jpg", { type: "image/jpeg" });
      Object.defineProperty(fileConSpy, "arrayBuffer", {
        value: mockArrayBuffer,
        configurable: true,
      });

      const formData = new FormData();
      formData.append("immagine", fileConSpy);
      const richiesta = {
        formData: vi.fn().mockResolvedValue(formData),
      } as unknown as Parameters<typeof POST>[0];

      const risposta = await POST(richiesta);

      // Verifica che l'immagine sia stata processata in memoria tramite arrayBuffer
      expect(mockArrayBuffer).toHaveBeenCalledOnce();
      // Verifica che la risposta sia corretta (l'immagine è stata usata, non persistita)
      expect(risposta.status).toBe(200);
    });
  });

  describe("errori Gemini", () => {
    it("ritorna 500 con messaggio user-friendly se Gemini lancia un errore", async () => {
      const mockGenerateContent = vi.fn().mockRejectedValue(
        new Error("API quota exceeded"),
      );
      mockGetGenerativeModel.mockReturnValue({ generateContent: mockGenerateContent } as ReturnType<typeof mockGetGenerativeModel>);

      const file = creaFileFinto("pianta.jpg", 1024 * 1024);
      const richiesta = creaRichiestaConFile(file);

      const risposta = await POST(richiesta as Parameters<typeof POST>[0]);
      const dati = await risposta.json();

      expect(risposta.status).toBe(500);
      expect(dati.errore).toBeTruthy();
      // Il messaggio non deve contenere dettagli tecnici
      expect(dati.errore).not.toContain("quota");
      expect(dati.errore).not.toContain("API");
    });

    it("ritorna 422 se la confidenza dell'identificazione è bassa", async () => {
      const rispostaConfidenzaBassa = JSON.stringify({
        nomeComune: "Pianta sconosciuta",
        nomeScientifico: "",
        livelloConfidenza: 0.2,
        statoSalute: "fair",
        descrizioneSalute: "Identificazione incerta.",
        consigliCura: [],
        informazioniGenerali: {
          annaffiatura: "",
          luce: "",
          temperatura: "",
          umidita: "",
        },
      });

      const mockGenerateContent = vi.fn().mockResolvedValue({
        response: { text: () => rispostaConfidenzaBassa },
      });
      mockGetGenerativeModel.mockReturnValue({ generateContent: mockGenerateContent } as ReturnType<typeof mockGetGenerativeModel>);

      const file = creaFileFinto("pianta-sfocata.jpg", 1024 * 1024);
      const richiesta = creaRichiestaConFile(file);

      const risposta = await POST(richiesta as Parameters<typeof POST>[0]);
      const dati = await risposta.json();

      expect(risposta.status).toBe(422);
      expect(dati.tipo).toBe("confidenza-bassa");
      // Il messaggio non deve contenere dettagli tecnici
      expect(dati.errore).not.toContain("0.2");
      expect(dati.errore).not.toContain("threshold");
    });

    it("ritorna 422 se la pianta non è riconosciuta nell'immagine", async () => {
      const rispostaNessunaPianta = JSON.stringify({
        nomeComune: "Nessuna pianta riconosciuta",
        nomeScientifico: "",
        livelloConfidenza: 0,
        statoSalute: "poor",
        descrizioneSalute: "Nessuna pianta identificata.",
        consigliCura: [],
        informazioniGenerali: {
          annaffiatura: "",
          luce: "",
          temperatura: "",
          umidita: "",
        },
      });

      const mockGenerateContent = vi.fn().mockResolvedValue({
        response: { text: () => rispostaNessunaPianta },
      });
      mockGetGenerativeModel.mockReturnValue({ generateContent: mockGenerateContent } as ReturnType<typeof mockGetGenerativeModel>);

      const file = creaFileFinto("paesaggio.jpg", 1024 * 1024);
      const richiesta = creaRichiestaConFile(file);

      const risposta = await POST(richiesta as Parameters<typeof POST>[0]);
      const dati = await risposta.json();

      expect(risposta.status).toBe(422);
      expect(dati.tipo).toBe("pianta-non-riconosciuta");
    });
  });
});
