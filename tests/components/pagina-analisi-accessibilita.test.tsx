import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import type { PlantAnalysis } from "@/types/analysis";

const mockRouterReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockRouterReplace,
  }),
}));

vi.mock("@/components/analysis-result", () => ({
  AnalysisResult: ({
    analisi,
  }: {
    analisi: PlantAnalysis;
    urlAnteprima: string;
    onNuovaAnalisi: () => void;
  }) => (
    <div data-testid="analysis-result-mock">
      <p>{analisi.nomeComune}</p>
    </div>
  ),
}));

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

import PaginaAnalisi from "@/app/analysis/page";

function creaPayloadAnalisi(): { analisi: PlantAnalysis; urlAnteprima: string } {
  return {
    analisi: {
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
    },
    urlAnteprima: "blob:http://localhost:3000/fake-uuid",
  };
}

beforeEach(() => {
  sessionStorageMock.clear();
  sessionStorageMock.getItem.mockReset();
  mockRouterReplace.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("PaginaAnalisi — accessibilità focus management", () => {
  it("dopo il caricamento dei dati è presente un heading h1 con il nome della pianta", async () => {
    sessionStorageMock.getItem.mockReturnValue(
      JSON.stringify(creaPayloadAnalisi()),
    );

    render(<PaginaAnalisi />);

    await waitFor(() => {
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/pothos dorato/i);
    });
  });

  it("l'heading h1 ha tabIndex={-1} per essere focalizzabile programmaticamente", async () => {
    sessionStorageMock.getItem.mockReturnValue(
      JSON.stringify(creaPayloadAnalisi()),
    );

    render(<PaginaAnalisi />);

    await waitFor(() => {
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveAttribute("tabindex", "-1");
    });
  });

  it("dopo il caricamento dei dati il focus si sposta sull'heading principale", async () => {
    sessionStorageMock.getItem.mockReturnValue(
      JSON.stringify(creaPayloadAnalisi()),
    );

    const spiaSuFocus = vi.spyOn(HTMLElement.prototype, "focus");

    render(<PaginaAnalisi />);

    await waitFor(() => {
      // Il focus deve essere stato chiamato sull'h1 (tabIndex -1)
      expect(spiaSuFocus).toHaveBeenCalled();
    });

    spiaSuFocus.mockRestore();
  });

  it("se non ci sono dati in sessionStorage redirige alla homepage senza mostrare l'heading", () => {
    sessionStorageMock.getItem.mockReturnValue(null);

    render(<PaginaAnalisi />);

    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(mockRouterReplace).toHaveBeenCalledWith("/");
  });
});
