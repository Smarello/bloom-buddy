import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mock HTMLDialogElement (non disponibile in jsdom) ──────────────────────

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

// ─── Mock next/navigation ───────────────────────────────────────────────────

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
  }),
}));

// ─── Mock IntersectionObserver ──────────────────────────────────────────────

vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
);

// ─── Import componente (dopo i mock) ────────────────────────────────────────

import { AnalysisResult } from "@/components/analysis-result";
import type { PlantAnalysis } from "@/types/analysis";

// ─── Dati di test ───────────────────────────────────────────────────────────

const COLLEZIONI_DI_TEST = {
  collezioni: [
    {
      id: "col-pothos",
      nome: "Pothos dorato",
      nomeScientifico: "Epipremnum aureum",
      numeroAnalisi: 4,
      anteprimaUrl: null,
    },
    {
      id: "col-basilico",
      nome: "Basilico balcone",
      nomeScientifico: "Ocimum basilicum",
      numeroAnalisi: 2,
      anteprimaUrl: null,
    },
    {
      id: "col-orchidee",
      nome: "Orchidee rare",
      nomeScientifico: "Phalaenopsis amabilis",
      numeroAnalisi: 1,
      anteprimaUrl: null,
    },
    {
      id: "col-rose",
      nome: "Rose del giardino",
      nomeScientifico: "Rosa gallica",
      numeroAnalisi: 3,
      anteprimaUrl: null,
    },
  ],
};

function creaAnalisiPothos(): PlantAnalysis {
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

function creaAnalisiOrchidea(): PlantAnalysis {
  return {
    ...creaAnalisiPothos(),
    nomeComune: "Orchidea",
    nomeScientifico: "Phalaenopsis amabilis",
    descrizione: "Orchidea elegante con fiori bianchi.",
  };
}

const URL_ANTEPRIMA_FINTO = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";

function creaRispostaListaCollezioni() {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(COLLEZIONI_DI_TEST),
  };
}

function creaRispostaSalvataggioRiuscito(collezioneId: string) {
  return {
    ok: true,
    status: 201,
    json: () => Promise.resolve({ successo: true, collezioneId }),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function apriSelettoreCollezione(utente: ReturnType<typeof userEvent.setup>) {
  const pulsanteSalva = screen.getByRole("button", {
    name: /salva nella collezione/i,
  });
  await utente.click(pulsanteSalva);

  await waitFor(() => {
    expect(screen.getByText("Collezioni esistenti")).toBeInTheDocument();
  });
}

function ottieniCampoRicerca(): HTMLInputElement {
  return screen.getByPlaceholderText("Cerca collezione...") as HTMLInputElement;
}

// ─── Setup / Teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ─── Suite principale ───────────────────────────────────────────────────────

describe("Flusso completo: selettore collezione con ricerca e salvataggio", () => {
  it("mostra il campo di ricerca quando ci sono almeno 3 collezioni", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(creaRispostaListaCollezioni()));

    render(
      <AnalysisResult
        analisi={creaAnalisiPothos()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    expect(ottieniCampoRicerca()).toBeInTheDocument();
  });

  it("filtra la lista digitando parte del nome della collezione", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(creaRispostaListaCollezioni()));

    render(
      <AnalysisResult
        analisi={creaAnalisiPothos()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    const campoRicerca = ottieniCampoRicerca();
    await utente.type(campoRicerca, "basil");

    // Solo "Basilico balcone" deve essere visibile
    expect(screen.getByText("Basilico balcone")).toBeInTheDocument();
    expect(screen.queryByText("Orchidee rare")).not.toBeInTheDocument();
    expect(screen.queryByText("Rose del giardino")).not.toBeInTheDocument();
  });

  it("filtra per nome scientifico", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(creaRispostaListaCollezioni()));

    render(
      <AnalysisResult
        analisi={creaAnalisiPothos()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    const campoRicerca = ottieniCampoRicerca();
    await utente.type(campoRicerca, "rosa gallica");

    // Solo "Rose del giardino" (con nome scientifico "Rosa gallica") deve comparire
    expect(screen.getByText("Rose del giardino")).toBeInTheDocument();
    expect(screen.getByText("Rosa gallica")).toBeInTheDocument();
    expect(screen.queryByText("Basilico balcone")).not.toBeInTheDocument();
    expect(screen.queryByText("Orchidee rare")).not.toBeInTheDocument();
  });

  it("mostra messaggio 'Nessuna collezione trovata' quando il filtro non trova risultati", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(creaRispostaListaCollezioni()));

    render(
      <AnalysisResult
        analisi={creaAnalisiPothos()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    const campoRicerca = ottieniCampoRicerca();
    await utente.type(campoRicerca, "tulipano inesistente");

    expect(screen.getByText("Nessuna collezione trovata")).toBeInTheDocument();
  });

  it("la collezione suggerita appare per prima e con badge 'Suggerita'", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(creaRispostaListaCollezioni()));

    render(
      <AnalysisResult
        analisi={creaAnalisiPothos()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    // "Pothos dorato" è la pianta analizzata e corrisponde a col-pothos
    expect(screen.getByText("Suggerita")).toBeInTheDocument();

    // La collezione suggerita deve essere la prima nella lista
    const bottoniCollezione = screen.getAllByRole("button").filter((btn) => {
      const testo = btn.textContent ?? "";
      return (
        testo.includes("analisi") &&
        !testo.includes("Crea nuova") &&
        !testo.includes("Chiudi")
      );
    });

    expect(bottoniCollezione.length).toBeGreaterThanOrEqual(1);
    expect(bottoniCollezione[0].textContent).toContain("Pothos dorato");
    expect(bottoniCollezione[0].textContent).toContain("Suggerita");
  });

  it("la collezione suggerita mantiene il badge 'Suggerita' anche dopo il filtraggio", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(creaRispostaListaCollezioni()));

    render(
      <AnalysisResult
        analisi={creaAnalisiPothos()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    const campoRicerca = ottieniCampoRicerca();
    // Cerco "pothos" — la suggerita deve ancora apparire con il badge
    await utente.type(campoRicerca, "pothos");

    expect(screen.getByText("Suggerita")).toBeInTheDocument();
    // "Pothos dorato" appare sia nel titolo dell'analisi sia nella lista filtrata
    expect(screen.getAllByText("Pothos dorato").length).toBeGreaterThanOrEqual(2);
  });

  it("la collezione suggerita appare per prima anche dopo aver filtrato e cancellato il filtro", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(creaRispostaListaCollezioni()));

    render(
      <AnalysisResult
        analisi={creaAnalisiPothos()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    const campoRicerca = ottieniCampoRicerca();
    await utente.type(campoRicerca, "orchidee");
    await utente.clear(campoRicerca);

    // Dopo aver cancellato il filtro, la suggerita deve tornare in cima
    const bottoniCollezione = screen.getAllByRole("button").filter((btn) => {
      const testo = btn.textContent ?? "";
      return (
        testo.includes("analisi") &&
        !testo.includes("Crea nuova") &&
        !testo.includes("Chiudi")
      );
    });

    expect(bottoniCollezione[0].textContent).toContain("Pothos dorato");
    expect(bottoniCollezione[0].textContent).toContain("Suggerita");
  });

  it("selezionare una collezione dalla lista filtrata salva nella collezione corretta e redirige", async () => {
    const utente = userEvent.setup();

    const fetchMock = vi
      .fn()
      // Prima chiamata: lista collezioni
      .mockResolvedValueOnce(creaRispostaListaCollezioni())
      // Seconda chiamata: salvataggio
      .mockResolvedValueOnce(creaRispostaSalvataggioRiuscito("col-rose"));

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AnalysisResult
        analisi={creaAnalisiPothos()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    // Filtro per "rose"
    const campoRicerca = ottieniCampoRicerca();
    await utente.type(campoRicerca, "rose");

    // Verifico che solo "Rose del giardino" sia visibile
    expect(screen.getByText("Rose del giardino")).toBeInTheDocument();
    expect(screen.queryByText("Basilico balcone")).not.toBeInTheDocument();

    // Clicco sulla collezione filtrata
    const bottoneRose = screen.getAllByRole("button").find((btn) =>
      btn.textContent?.includes("Rose del giardino")
    );
    expect(bottoneRose).toBeDefined();
    await utente.click(bottoneRose!);

    // Verifico che il salvataggio sia stato chiamato con la collezione corretta
    await waitFor(() => {
      const chiamateSalvataggio = fetchMock.mock.calls.filter(
        (call) => call[1]?.method === "POST"
      );
      expect(chiamateSalvataggio).toHaveLength(1);

      const bodyInviato = chiamateSalvataggio[0][1].body as FormData;
      expect(bodyInviato.get("collezioneId")).toBe("col-rose");
    });

    // Verifico il redirect alla pagina della collezione
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/collezione/col-rose");
    });
  });

  it("selezionare la collezione suggerita salva correttamente", async () => {
    const utente = userEvent.setup();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(creaRispostaListaCollezioni())
      .mockResolvedValueOnce(creaRispostaSalvataggioRiuscito("col-pothos"));

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AnalysisResult
        analisi={creaAnalisiPothos()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    // Clicco direttamente sulla collezione suggerita (la prima nella lista)
    const bottoneSuggerita = screen.getAllByRole("button").find((btn) =>
      btn.textContent?.includes("Suggerita")
    );
    expect(bottoneSuggerita).toBeDefined();
    await utente.click(bottoneSuggerita!);

    await waitFor(() => {
      const chiamateSalvataggio = fetchMock.mock.calls.filter(
        (call) => call[1]?.method === "POST"
      );
      expect(chiamateSalvataggio).toHaveLength(1);

      const bodyInviato = chiamateSalvataggio[0][1].body as FormData;
      expect(bodyInviato.get("collezioneId")).toBe("col-pothos");
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/collezione/col-pothos");
    });
  });

  it("la collezione suggerita viene identificata anche tramite nome scientifico", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(creaRispostaListaCollezioni()));

    // L'analisi è per "Orchidea" con nome scientifico "Phalaenopsis amabilis"
    // che corrisponde a col-orchidee
    render(
      <AnalysisResult
        analisi={creaAnalisiOrchidea()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    // "Orchidee rare" deve avere il badge Suggerita perché il nome scientifico corrisponde
    expect(screen.getByText("Suggerita")).toBeInTheDocument();

    const bottoniCollezione = screen.getAllByRole("button").filter((btn) => {
      const testo = btn.textContent ?? "";
      return (
        testo.includes("analisi") &&
        !testo.includes("Crea nuova") &&
        !testo.includes("Chiudi")
      );
    });

    // Orchidee rare deve essere la prima (suggerita in cima)
    expect(bottoniCollezione[0].textContent).toContain("Orchidee rare");
    expect(bottoniCollezione[0].textContent).toContain("Suggerita");
  });

  it("il badge 'Suggerita' resta visibile su Orchidee rare anche filtrando per nome scientifico", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(creaRispostaListaCollezioni()));

    render(
      <AnalysisResult
        analisi={creaAnalisiOrchidea()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    await apriSelettoreCollezione(utente);

    const campoRicerca = ottieniCampoRicerca();
    await utente.type(campoRicerca, "phalaenopsis");

    // La collezione suggerita deve ancora apparire con il badge
    expect(screen.getByText("Orchidee rare")).toBeInTheDocument();
    expect(screen.getByText("Suggerita")).toBeInTheDocument();

    // Le altre collezioni non devono essere visibili
    expect(screen.queryByText("Rose del giardino")).not.toBeInTheDocument();
    expect(screen.queryByText("Basilico balcone")).not.toBeInTheDocument();
  });
});
