import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
  }),
}));

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

import { AnalysisResult } from "@/components/analysis-result";
import type { PlantAnalysis } from "@/types/analysis";

function creaAnalisiTest(statoSalute: PlantAnalysis["statoSalute"] = "fair"): PlantAnalysis {
  return {
    nomeComune: "Pothos dorato",
    nomeScientifico: "Epipremnum aureum",
    livelloConfidenza: 0.92,
    statoSalute,
    descrizioneSalute: "La pianta mostra alcuni segni di sofferenza.",
    consigliCura: [
      {
        titolo: "Riduci l'annaffiatura",
        descrizione: "Aspetta che il terriccio sia asciutto.",
        priorita: "alta",
      },
      {
        titolo: "Sposta verso più luce",
        descrizione: "Posizione vicino a una finestra.",
        priorita: "media",
      },
    ],
    descrizione: "Pianta tropicale rampicante molto resistente e adattabile.",
    informazioniGenerali: {
      annaffiatura: "Ogni 7-10 giorni",
      luce: "Luce indiretta brillante",
      temperatura: "15-30 °C",
      umidita: "Media (40-60%)",
    },
    informazioniRapide: {
      annaffiatura: "Moderata",
      luce: "Indiretta",
      temperatura: "18-25 °C",
      umidita: "Media",
    },
  };
}

const URL_ANTEPRIMA_FINTO = "blob:http://localhost/fake-image";

describe("AnalysisResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("render delle informazioni pianta", () => {
    it("mostra il nome comune e scientifico della pianta", () => {
      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_ANTEPRIMA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={false}
        />
      );

      expect(screen.getByText("Pothos dorato")).toBeInTheDocument();
      expect(screen.getByText("Epipremnum aureum")).toBeInTheDocument();
    });

    it("mostra il badge di confidenza con la percentuale corretta", () => {
      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_ANTEPRIMA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={false}
        />
      );

      expect(screen.getByText(/Confidenza:.*92%/)).toBeInTheDocument();
    });

    it("mostra la foto della pianta con l'alt text corretto", () => {
      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_ANTEPRIMA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={false}
        />
      );

      const immagine = screen.getByAltText(/Pothos dorato/i);
      expect(immagine).toHaveAttribute("src", URL_ANTEPRIMA_FINTO);
    });

    it("mostra i consigli di cura personalizzati", () => {
      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_ANTEPRIMA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={false}
        />
      );

      expect(screen.getByText("Riduci l'annaffiatura")).toBeInTheDocument();
      expect(screen.getByText("Sposta verso più luce")).toBeInTheDocument();
    });

    it("mostra le informazioni generali della specie", () => {
      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_ANTEPRIMA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={false}
        />
      );

      expect(screen.getByText("Ogni 7-10 giorni")).toBeInTheDocument();
      expect(screen.getByText("Luce indiretta brillante")).toBeInTheDocument();
      expect(screen.getByText("15-30 °C")).toBeInTheDocument();
      expect(screen.getByText("Media (40-60%)")).toBeInTheDocument();
    });
  });

  describe("stati di salute", () => {
    it.each([
      ["excellent", "La tua pianta è in splendida forma!"],
      ["good", "La tua pianta sta abbastanza bene!"],
      ["fair", "La tua pianta ha bisogno di attenzione."],
      ["poor", "La tua pianta ha bisogno di cure urgenti."],
    ] as const)(
      "mostra l'etichetta corretta per lo stato '%s'",
      (stato, etichettaAttesa) => {
        render(
          <AnalysisResult
            analisi={creaAnalisiTest(stato)}
            urlAnteprima={URL_ANTEPRIMA_FINTO}
            onNuovaAnalisi={vi.fn()}
            utenteAutenticato={false}
          />
        );

        expect(screen.getByTestId("health-label")).toHaveTextContent(etichettaAttesa);
      }
    );
  });

  describe("pulsante Nuova analisi", () => {
    it("chiama onNuovaAnalisi quando si clicca sul pulsante", async () => {
      const mockOnNuovaAnalisi = vi.fn();
      const user = userEvent.setup();

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_ANTEPRIMA_FINTO}
          onNuovaAnalisi={mockOnNuovaAnalisi}
          utenteAutenticato={false}
        />
      );

      const pulsante = screen.getByRole("button", { name: /analizza un.*altra pianta/i });
      await user.click(pulsante);

      expect(mockOnNuovaAnalisi).toHaveBeenCalledOnce();
    });
  });
});
