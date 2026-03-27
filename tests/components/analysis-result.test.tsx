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

  describe("salvataggio con collezioneId", () => {
    const URL_DATA_FINTO = "data:image/jpeg;base64,dGVzdA==";
    let fetchSpia: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchSpia = vi.fn().mockResolvedValue({ ok: true, status: 200 });
      global.fetch = fetchSpia;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("include collezioneId nel FormData quando è presente come prop", async () => {
      const user = userEvent.setup();

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_DATA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={true}
          collezioneId="col-123"
        />
      );

      const pulsante = screen.getByRole("button", { name: /salva nella collezione/i });
      await user.click(pulsante);

      expect(fetchSpia).toHaveBeenCalledOnce();
      const formDataInviato: FormData = fetchSpia.mock.calls[0][1].body;
      expect(formDataInviato.get("collezioneId")).toBe("col-123");
    });

    it("reindirizza alla pagina della collezione dopo il salvataggio quando collezioneId è presente", async () => {
      const user = userEvent.setup();

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_DATA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={true}
          collezioneId="col-456"
        />
      );

      const pulsante = screen.getByRole("button", { name: /salva nella collezione/i });
      await user.click(pulsante);

      expect(mockRouterPush).toHaveBeenCalledWith("/collezione/col-456");
    });

    it("non reindirizza alla collezione dopo il salvataggio quando collezioneId non è presente", async () => {
      const user = userEvent.setup();

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_DATA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={true}
        />
      );

      const pulsante = screen.getByRole("button", { name: /salva nella collezione/i });
      await user.click(pulsante);

      expect(fetchSpia).toHaveBeenCalledOnce();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe("sezione diagnosi", () => {
    it("mostra le card diagnosi quando presenti con categoria critico o attenzione", () => {
      const analisiConDiagnosi = creaAnalisiTest();
      analisiConDiagnosi.diagnosi = [
        {
          categoria: "critico",
          titolo: "Marciume radicale avanzato",
          cosaVedo: "Radici scure e molli, odore sgradevole dal terreno.",
          cosaSignifica: "Le radici non riescono più ad assorbire acqua e nutrienti.",
          cosaFare: "Rimuovi le radici marce con forbici sterilizzate\nRinvasa in terriccio asciutto",
          cosaAspettarsi: "Ripresa visibile in 3-4 settimane",
        },
        {
          categoria: "attenzione",
          titolo: "Foglie ingiallite alla base",
          cosaVedo: "Le foglie inferiori diventano gialle e cadono.",
          cosaSignifica: "Possibile eccesso di annaffiatura.",
          cosaFare: "Riduci la frequenza di annaffiatura",
          cosaAspettarsi: "Miglioramento entro 2 settimane",
        },
      ];

      render(
        <AnalysisResult
          analisi={analisiConDiagnosi}
          urlAnteprima={URL_ANTEPRIMA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={false}
        />
      );

      expect(screen.getByTestId("sezione-diagnosi")).toBeInTheDocument();
      const cardDiagnosi = screen.getAllByTestId("card-diagnosi-dettagliata");
      expect(cardDiagnosi).toHaveLength(2);
    });

    it("non mostra la sezione quando diagnosi è assente", () => {
      const analisiSenzaDiagnosi = creaAnalisiTest();

      render(
        <AnalysisResult
          analisi={analisiSenzaDiagnosi}
          urlAnteprima={URL_ANTEPRIMA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={false}
        />
      );

      expect(screen.queryByTestId("sezione-diagnosi")).not.toBeInTheDocument();
    });

    it("non mostra la sezione quando ci sono solo ottimizzazioni", () => {
      const analisiSoloOttimizzazioni = creaAnalisiTest();
      analisiSoloOttimizzazioni.diagnosi = [
        {
          categoria: "ottimizzazione",
          titolo: "Concimazione periodica",
          descrizione: "Aggiungi fertilizzante liquido ogni 2 settimane durante la crescita.",
        },
        {
          categoria: "ottimizzazione",
          titolo: "Rotazione vaso",
          descrizione: "Ruota il vaso di un quarto di giro ogni settimana per crescita uniforme.",
        },
      ];

      render(
        <AnalysisResult
          analisi={analisiSoloOttimizzazioni}
          urlAnteprima={URL_ANTEPRIMA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={false}
        />
      );

      expect(screen.queryByTestId("sezione-diagnosi")).not.toBeInTheDocument();
    });
  });
});
