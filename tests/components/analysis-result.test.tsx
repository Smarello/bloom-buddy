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

// Mock IntersectionObserver (non disponibile in jsdom)
vi.stubGlobal("IntersectionObserver", class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
});

// Mock HTMLDialogElement methods (non disponibili in jsdom)
HTMLDialogElement.prototype.showModal = vi.fn();
HTMLDialogElement.prototype.close = vi.fn();

import { AnalysisResult } from "@/components/analysis-result";
import { creaAnalisiTest } from "../helpers/analisi-fixture";

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

    it("mostra le informazioni rapide della specie nei chip", () => {
      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_ANTEPRIMA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={false}
        />
      );

      expect(screen.getByText("Moderata")).toBeInTheDocument();
      expect(screen.getByText("Indiretta")).toBeInTheDocument();
      expect(screen.getByText("18-25 °C")).toBeInTheDocument();
      expect(screen.getByText("Media")).toBeInTheDocument();
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
      fetchSpia = vi.fn().mockImplementation((url: string) => {
        if (typeof url === "string" && url.includes("/api/collezione/lista")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ collezioni: [] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ collezioneId: "col-risultato" }),
        });
      });
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

      const chiamataPost = fetchSpia.mock.calls.find(
        (call: unknown[]) => call[0] === "/api/collezione" && (call[1] as RequestInit)?.method === "POST"
      );
      expect(chiamataPost).toBeDefined();
      const formDataInviato: FormData = (chiamataPost![1] as RequestInit).body as FormData;
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

      await vi.waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith("/collezione/col-456");
      });
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

      // Senza collezioneId, il click apre il selettore invece di fare il POST diretto
      const chiamatePost = fetchSpia.mock.calls.filter(
        (call: unknown[]) => call[0] === "/api/collezione" && (call[1] as RequestInit)?.method === "POST"
      );
      expect(chiamatePost).toHaveLength(0);
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

  describe("chip collezioni suggerite (shortcut salvataggio rapido)", () => {
    const URL_DATA_FINTO = "data:image/jpeg;base64,dGVzdA==";
    let fetchSpia: ReturnType<typeof vi.fn>;

    const collezioniConMatchScientifico = [
      { id: "col-1", nome: "I miei Pothos", nomeScientifico: "Epipremnum aureum", numeroAnalisi: 3, anteprimaUrl: null },
      { id: "col-2", nome: "Succulente", nomeScientifico: "Echeveria elegans", numeroAnalisi: 1, anteprimaUrl: null },
    ];

    const collezioniSenzaMatch = [
      { id: "col-3", nome: "Succulente", nomeScientifico: "Echeveria elegans", numeroAnalisi: 1, anteprimaUrl: null },
      { id: "col-4", nome: "Cactus", nomeScientifico: "Opuntia ficus-indica", numeroAnalisi: 2, anteprimaUrl: null },
    ];

    const collezioniConMatchMultipli = [
      { id: "col-a", nome: "Pothos salotto", nomeScientifico: "Epipremnum aureum", numeroAnalisi: 2, anteprimaUrl: null },
      { id: "col-b", nome: "Pothos bagno", nomeScientifico: "Epipremnum Aureum", numeroAnalisi: 1, anteprimaUrl: null },
      { id: "col-c", nome: "Succulente", nomeScientifico: "Echeveria elegans", numeroAnalisi: 4, anteprimaUrl: null },
    ];

    function mockFetchConCollezioni(collezioni: unknown[]) {
      return vi.fn().mockImplementation((url: string, opzioni?: RequestInit) => {
        if (typeof url === "string" && url.includes("/api/collezione/lista")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ collezioni }),
          });
        }
        if (typeof url === "string" && url === "/api/collezione" && opzioni?.method === "POST") {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ collezioneId: "col-risultato" }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
    }

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("mostra i chip quando le collezioni hanno un nomeScientifico corrispondente", async () => {
      global.fetch = mockFetchConCollezioni(collezioniConMatchScientifico);

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_DATA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={true}
        />
      );

      expect(await screen.findByRole("button", { name: /salva nella collezione i miei pothos/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /salva nella collezione succulente/i })).not.toBeInTheDocument();
    });

    it("non mostra chip quando nessuna collezione corrisponde", async () => {
      global.fetch = mockFetchConCollezioni(collezioniSenzaMatch);

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_DATA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={true}
        />
      );

      // Aspetta che il fetch sia completato
      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/collezione/lista", expect.objectContaining({ signal: expect.any(AbortSignal) }));
      });

      expect(screen.queryByRole("button", { name: /salva nella collezione i miei pothos/i })).not.toBeInTheDocument();
    });

    it("non effettua il fetch e non mostra chip quando l'utente non è autenticato", async () => {
      fetchSpia = mockFetchConCollezioni(collezioniConMatchScientifico);
      global.fetch = fetchSpia;

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_DATA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={false}
        />
      );

      // Il fetch per la lista collezioni non deve essere chiamato
      expect(fetchSpia).not.toHaveBeenCalledWith("/api/collezione/lista", expect.objectContaining({ signal: expect.any(AbortSignal) }));
      expect(screen.queryByRole("button", { name: /salva nella collezione i miei pothos/i })).not.toBeInTheDocument();
    });

    it("non effettua il fetch e non mostra chip quando l'analisi è già salvata", async () => {
      fetchSpia = mockFetchConCollezioni(collezioniConMatchScientifico);
      global.fetch = fetchSpia;

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_DATA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={true}
          giaSalvata={true}
        />
      );

      expect(fetchSpia).not.toHaveBeenCalledWith("/api/collezione/lista", expect.objectContaining({ signal: expect.any(AbortSignal) }));
      expect(screen.queryByRole("button", { name: /salva nella collezione i miei pothos/i })).not.toBeInTheDocument();
    });

    it("non mostra chip quando il fetch delle collezioni fallisce (errore di rete)", async () => {
      const fetchErroreRete = vi.fn().mockImplementation((url: string) => {
        if (typeof url === "string" && url.includes("/api/collezione/lista")) {
          return Promise.reject(new TypeError("Failed to fetch"));
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
      global.fetch = fetchErroreRete;

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_DATA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={true}
          giaSalvata={false}
        />
      );

      // Aspetta che il fetch sia stato tentato
      await vi.waitFor(() => {
        expect(fetchErroreRete).toHaveBeenCalledWith(
          "/api/collezione/lista",
          expect.objectContaining({ signal: expect.any(AbortSignal) }),
        );
      });

      // Nessun chip suggerito deve apparire
      expect(screen.queryByRole("button", { name: /salva nella collezione i miei pothos/i })).not.toBeInTheDocument();

      // Il pulsante standard di salvataggio deve essere ancora visibile
      expect(screen.getByRole("button", { name: /salva nella collezione/i })).toBeInTheDocument();
    });

    it("mostra tutti i chip quando più collezioni corrispondono", async () => {
      global.fetch = mockFetchConCollezioni(collezioniConMatchMultipli);

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_DATA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={true}
        />
      );

      expect(await screen.findByRole("button", { name: /salva nella collezione pothos salotto/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /salva nella collezione pothos bagno/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /salva nella collezione succulente/i })).not.toBeInTheDocument();
    });

    it("chiama POST /api/collezione con il collezioneId corretto al click su un chip", async () => {
      fetchSpia = mockFetchConCollezioni(collezioniConMatchScientifico);
      global.fetch = fetchSpia;
      const user = userEvent.setup();

      render(
        <AnalysisResult
          analisi={creaAnalisiTest()}
          urlAnteprima={URL_DATA_FINTO}
          onNuovaAnalisi={vi.fn()}
          utenteAutenticato={true}
        />
      );

      const pulsanteShortcut = await screen.findByRole("button", { name: /salva nella collezione i miei pothos/i });
      await user.click(pulsanteShortcut);

      const chiamataPost = fetchSpia.mock.calls.find(
        (call: unknown[]) => call[0] === "/api/collezione" && (call[1] as RequestInit)?.method === "POST"
      );
      expect(chiamataPost).toBeDefined();
      const formDataInviato: FormData = (chiamataPost![1] as RequestInit).body as FormData;
      expect(formDataInviato.get("collezioneId")).toBe("col-1");
    });
  });
});
