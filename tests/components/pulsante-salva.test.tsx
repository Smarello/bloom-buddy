import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

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
import type { PlantAnalysis } from "@/types/analysis";

function creaAnalisiTest(): PlantAnalysis {
  return {
    nomeComune: "Pothos dorato",
    nomeScientifico: "Epipremnum aureum",
    descrizione: "Una pianta tropicale molto resistente.",
    livelloConfidenza: 0.92,
    statoSalute: "good",
    descrizioneSalute: "La pianta è in buone condizioni.",
    consigliCura: [
      {
        titolo: "Annaffia regolarmente",
        descrizione: "Ogni 7-10 giorni.",
        priorita: "media",
      },
    ],
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

const URL_ANTEPRIMA_FINTO = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

function creaRispostaApi(status: number, body: Record<string, unknown> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

describe("Pulsante salva nella collezione", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("il pulsante salva è visibile quando utenteAutenticato è true", () => {
    render(
      <AnalysisResult
        analisi={creaAnalisiTest()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    expect(screen.getByText("Salva nella collezione")).toBeInTheDocument();
  });

  it("il pulsante salva è nascosto quando utenteAutenticato è false", () => {
    render(
      <AnalysisResult
        analisi={creaAnalisiTest()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={false}
      />
    );

    expect(screen.queryByText("Salva nella collezione")).not.toBeInTheDocument();
    expect(screen.getByText("Vuoi salvare questa analisi?")).toBeInTheDocument();
  });

  it("mostra stato di caricamento durante il salvataggio", async () => {
    const utente = userEvent.setup();

    const fetchMock = vi.fn()
      .mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(creaRispostaApi(201, { successo: true })), 5000))
      );

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AnalysisResult
        analisi={creaAnalisiTest()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
        collezioneId="col-test"
      />
    );

    const pulsanteSalva = screen.getByRole("button", { name: /salva nella collezione/i });
    await utente.click(pulsanteSalva);

    expect(screen.getByText("Salvataggio in corso...")).toBeInTheDocument();
  });

  it("mostra messaggio di conferma dopo il salvataggio", async () => {
    const utente = userEvent.setup();

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(creaRispostaApi(201, { successo: true }));

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AnalysisResult
        analisi={creaAnalisiTest()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
        collezioneId="col-test"
      />
    );

    const pulsanteSalva = screen.getByRole("button", { name: /salva nella collezione/i });
    await utente.click(pulsanteSalva);

    await waitFor(() => {
      expect(screen.getByText("Fantastico, pianta salvata!")).toBeInTheDocument();
    });
  });

  it("gestisce errore duplicato", async () => {
    const utente = userEvent.setup();

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(creaRispostaApi(409, { errore: "duplicato" }));

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AnalysisResult
        analisi={creaAnalisiTest()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
        collezioneId="col-test"
      />
    );

    const pulsanteSalva = screen.getByRole("button", { name: /salva nella collezione/i });
    await utente.click(pulsanteSalva);

    await waitFor(() => {
      expect(screen.getByText("Già nella tua collezione")).toBeInTheDocument();
    });
  });
});
