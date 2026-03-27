import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import type { PlantAnalysis } from "@/types/analysis";

// ─── Mock next/navigation ────────────────────────────────────────────────────

const mockRouterReplace = vi.fn();
const mockRouterPush = vi.fn();

let mockSearchParamsMap = new Map<string, string>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
  }),
  useSearchParams: () => ({
    get: (chiave: string) => mockSearchParamsMap.get(chiave) ?? null,
  }),
}));

// ─── Mock AnalysisResult ─────────────────────────────────────────────────────

let ultimoGiaSalvataRicevuto: boolean | undefined;

vi.mock("@/components/analysis-result", () => ({
  AnalysisResult: (props: {
    analisi: PlantAnalysis;
    urlAnteprima: string;
    onNuovaAnalisi: () => void;
    utenteAutenticato: boolean;
    giaSalvata: boolean;
  }) => {
    ultimoGiaSalvataRicevuto = props.giaSalvata;
    return (
      <div data-testid="analysis-result-mock">
        <p>{props.analisi.nomeComune}</p>
        <p data-testid="gia-salvata">{String(props.giaSalvata)}</p>
      </div>
    );
  },
}));

// ─── Mock sessionStorage ─────────────────────────────────────────────────────

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

// ─── Import del componente (dopo i mock) ─────────────────────────────────────

import PaginaAnalisi from "@/app/analysis/page";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function creaPayloadCollezione() {
  return {
    datiAnalisi: {
      nomeComune: "Pothos dorato",
      nomeScientifico: "Epipremnum aureum",
      livelloConfidenza: 0.92,
      statoSalute: "fair",
      descrizioneSalute: "La pianta mostra alcuni segni di sofferenza.",
      consigliCura: [],
      informazioniGenerali: {
        annaffiatura: "Ogni 7-10 giorni",
        luce: "Luce indiretta",
        temperatura: "18-28°C",
        umidita: "Moderata",
      },
    } satisfies PlantAnalysis,
    urlFoto: "https://example.com/foto-pianta.jpg",
  };
}

function creaFetchSuccesso() {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(creaPayloadCollezione()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function creaFetchConStatoErrore(status: number) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ errore: "errore" }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  mockRouterReplace.mockReset();
  mockRouterPush.mockReset();
  mockSearchParamsMap = new Map();
  sessionStorageMock.clear();
  sessionStorageMock.getItem.mockReset();
  ultimoGiaSalvataRicevuto = undefined;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ─── Suite: caricamento analisi dalla collezione ─────────────────────────────

describe("PaginaAnalisi — caricamento da collezione (query param id)", () => {
  it("quando il parametro id è presente, effettua fetch verso /api/collezione/{id}", async () => {
    const idAnalisi = "abc-123";
    mockSearchParamsMap.set("id", idAnalisi);

    const fetchMock = creaFetchSuccesso();
    vi.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

    render(<PaginaAnalisi />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(`/api/collezione/${idAnalisi}`);
    });
  });

  it("quando i dati vengono caricati dalla collezione, passa giaSalvata=true ad AnalysisResult", async () => {
    mockSearchParamsMap.set("id", "abc-123");

    vi.spyOn(globalThis, "fetch").mockImplementation(creaFetchSuccesso());

    render(<PaginaAnalisi />);

    await waitFor(() => {
      expect(screen.getByTestId("analysis-result-mock")).toBeInTheDocument();
    });

    expect(screen.getByTestId("gia-salvata")).toHaveTextContent("true");
    expect(ultimoGiaSalvataRicevuto).toBe(true);
  });

  it("quando l'API risponde con 401, redirige alla pagina di accesso", async () => {
    mockSearchParamsMap.set("id", "abc-123");

    vi.spyOn(globalThis, "fetch").mockImplementation(
      creaFetchConStatoErrore(401),
    );

    render(<PaginaAnalisi />);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/accesso");
    });
  });

  it("quando l'API risponde con 404, redirige alla homepage", async () => {
    mockSearchParamsMap.set("id", "abc-123");

    vi.spyOn(globalThis, "fetch").mockImplementation(
      creaFetchConStatoErrore(404),
    );

    render(<PaginaAnalisi />);

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/");
    });
  });
});
