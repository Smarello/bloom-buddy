import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
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

// ─── Import componenti (dopo i mock) ────────────────────────────────────────

import { PulsanteEliminaAnalisi } from "@/components/pulsante-elimina-analisi";
import DialogoEliminaCollezione from "@/components/dialogo-elimina-collezione";

// ─── Helpers ────────────────────────────────────────────────────────────────

function creaRispostaFetch(status: number, body: Record<string, unknown> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

// ─── Setup / Teardown ───────────────────────────────────────────────────────

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// PulsanteEliminaAnalisi
// ═══════════════════════════════════════════════════════════════════════════════

describe("PulsanteEliminaAnalisi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderizza il pulsante con icona cestino e aria-label corretto", () => {
    render(
      <PulsanteEliminaAnalisi idAnalisi="analisi-1" onEliminata={vi.fn()} />
    );

    const pulsante = screen.getByRole("button", { name: /elimina analisi/i });
    expect(pulsante).toBeInTheDocument();
    // L'icona SVG deve essere presente dentro il pulsante
    expect(pulsante.querySelector("svg")).toBeInTheDocument();
  });

  it("apre il dialogo di conferma al click", async () => {
    const utente = userEvent.setup();

    render(
      <PulsanteEliminaAnalisi idAnalisi="analisi-1" onEliminata={vi.fn()} />
    );

    const pulsante = screen.getByRole("button", { name: /elimina analisi/i });
    await utente.click(pulsante);

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(screen.getByText("Eliminare questa analisi?")).toBeInTheDocument();
  });

  it("chiude il dialogo quando si clicca Annulla", async () => {
    const utente = userEvent.setup();

    render(
      <PulsanteEliminaAnalisi idAnalisi="analisi-1" onEliminata={vi.fn()} />
    );

    // Apri dialogo
    await utente.click(screen.getByRole("button", { name: /elimina analisi/i }));

    // Clicca Annulla
    const pulsanteAnnulla = screen.getByRole("button", { name: "Annulla" });
    await utente.click(pulsanteAnnulla);

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it("esegue la chiamata DELETE alla conferma", async () => {
    const utente = userEvent.setup();
    const fetchMock = vi.fn(() => Promise.resolve(creaRispostaFetch(200)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PulsanteEliminaAnalisi idAnalisi="analisi-42" onEliminata={vi.fn()} />
    );

    // Apri dialogo
    await utente.click(screen.getByRole("button", { name: /elimina analisi/i }));

    // Conferma eliminazione
    await utente.click(screen.getByRole("button", { name: "Elimina" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/collezione/analisi-42", {
        method: "DELETE",
      });
    });
  });

  it("mostra stato di caricamento durante l'eliminazione", async () => {
    const utente = userEvent.setup();
    // Fetch che non risolve subito
    const fetchMock = vi.fn(
      () => new Promise((resolve) => setTimeout(() => resolve(creaRispostaFetch(200)), 5000))
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PulsanteEliminaAnalisi idAnalisi="analisi-1" onEliminata={vi.fn()} />
    );

    await utente.click(screen.getByRole("button", { name: /elimina analisi/i }));
    await utente.click(screen.getByRole("button", { name: "Elimina" }));

    expect(screen.getByText("Eliminazione...")).toBeInTheDocument();
  });

  it("invoca la callback onEliminata dopo l'eliminazione riuscita", async () => {
    const utente = userEvent.setup();
    const callbackEliminata = vi.fn();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(creaRispostaFetch(200))));

    render(
      <PulsanteEliminaAnalisi idAnalisi="analisi-1" onEliminata={callbackEliminata} />
    );

    await utente.click(screen.getByRole("button", { name: /elimina analisi/i }));
    await utente.click(screen.getByRole("button", { name: "Elimina" }));

    await waitFor(() => {
      expect(callbackEliminata).toHaveBeenCalledTimes(1);
    });
  });

  it("mostra il messaggio di errore quando la DELETE fallisce", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(creaRispostaFetch(500, { errore: "Errore interno del server" }))
      )
    );

    render(
      <PulsanteEliminaAnalisi idAnalisi="analisi-1" onEliminata={vi.fn()} />
    );

    await utente.click(screen.getByRole("button", { name: /elimina analisi/i }));
    await utente.click(screen.getByRole("button", { name: "Elimina" }));

    await waitFor(() => {
      const avviso = screen.getByRole("alert");
      expect(avviso).toBeInTheDocument();
      expect(avviso).toHaveTextContent("Errore interno del server");
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DialogoEliminaCollezione
// ═══════════════════════════════════════════════════════════════════════════════

describe("DialogoEliminaCollezione", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("apre il dialogo quando la prop aperto e true", () => {
    render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Rose del giardino"
        numeroAnalisi={3}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(screen.getByText("Elimina collezione")).toBeInTheDocument();
  });

  it("chiude il dialogo quando la prop aperto diventa false", () => {
    const { rerender } = render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Rose del giardino"
        numeroAnalisi={3}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    rerender(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Rose del giardino"
        numeroAnalisi={3}
        aperto={false}
        onChiudi={vi.fn()}
      />
    );

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it("con analisi presenti: mostra input conferma nome e pulsante Elimina disabilitato", () => {
    render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Rose del giardino"
        numeroAnalisi={5}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    // Input per conferma nome
    const inputConferma = screen.getByLabelText(/digita/i);
    expect(inputConferma).toBeInTheDocument();

    // Pulsante Elimina disabilitato finche il nome non corrisponde
    const pulsanteElimina = screen.getByRole("button", { name: "Elimina" });
    expect(pulsanteElimina).toBeDisabled();
  });

  it("con analisi presenti: abilita Elimina solo quando il nome digitato corrisponde", async () => {
    const utente = userEvent.setup();

    render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Rose del giardino"
        numeroAnalisi={5}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    const inputConferma = screen.getByLabelText(/digita/i);
    const pulsanteElimina = screen.getByRole("button", { name: "Elimina" });

    // Nome parziale: ancora disabilitato
    await utente.type(inputConferma, "Rose del");
    expect(pulsanteElimina).toBeDisabled();

    // Nome completo: abilitato
    await utente.clear(inputConferma);
    await utente.type(inputConferma, "Rose del giardino");
    expect(pulsanteElimina).toBeEnabled();
  });

  it("con analisi presenti: mostra il conteggio analisi che verranno eliminate", () => {
    render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Rose del giardino"
        numeroAnalisi={5}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    expect(screen.getByText(/5 analisi e le relative foto verranno eliminate definitivamente/)).toBeInTheDocument();
  });

  it("con analisi presenti: mostra testo singolare per 1 analisi", () => {
    render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Orchidea"
        numeroAnalisi={1}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    expect(screen.getByText(/1 analisi e le relative foto verranno eliminate definitivamente/)).toBeInTheDocument();
  });

  it("senza analisi: mostra conferma semplice senza input nome", () => {
    render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Collezione vuota"
        numeroAnalisi={0}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    // Nessun input per conferma nome
    expect(screen.queryByLabelText(/digita/i)).not.toBeInTheDocument();

    // Pulsante Elimina abilitato direttamente
    const pulsanteElimina = screen.getByRole("button", { name: "Elimina" });
    expect(pulsanteElimina).toBeEnabled();

    // Messaggio specifico per collezione vuota
    expect(screen.getByText(/la collezione è vuota/i)).toBeInTheDocument();
  });

  it("esegue la chiamata DELETE alla conferma", async () => {
    const utente = userEvent.setup();
    const fetchMock = vi.fn(() => Promise.resolve(creaRispostaFetch(200)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <DialogoEliminaCollezione
        idCollezione="col-42"
        nomeCollezione="Collezione vuota"
        numeroAnalisi={0}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    await utente.click(screen.getByRole("button", { name: "Elimina" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/collezioni/col-42", {
        method: "DELETE",
      });
    });
  });

  it("reindirizza a /collezione dopo eliminazione riuscita", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(creaRispostaFetch(200))));

    render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Collezione vuota"
        numeroAnalisi={0}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    await utente.click(screen.getByRole("button", { name: "Elimina" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/collezione");
    });
  });

  it("mostra errore quando la DELETE fallisce", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          creaRispostaFetch(500, { messaggio: "Impossibile eliminare la collezione" })
        )
      )
    );

    render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Collezione vuota"
        numeroAnalisi={0}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    await utente.click(screen.getByRole("button", { name: "Elimina" }));

    await waitFor(() => {
      const avviso = screen.getByRole("alert");
      expect(avviso).toHaveTextContent("Impossibile eliminare la collezione");
    });
  });

  it("invoca onChiudi quando si clicca Annulla", async () => {
    const utente = userEvent.setup();
    const callbackChiudi = vi.fn();

    render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Rose del giardino"
        numeroAnalisi={3}
        aperto={true}
        onChiudi={callbackChiudi}
      />
    );

    await utente.click(screen.getByRole("button", { name: "Annulla" }));

    expect(callbackChiudi).toHaveBeenCalledTimes(1);
  });

  it("mostra errore di connessione quando fetch lancia eccezione", async () => {
    const utente = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network error"))));

    render(
      <DialogoEliminaCollezione
        idCollezione="col-1"
        nomeCollezione="Collezione vuota"
        numeroAnalisi={0}
        aperto={true}
        onChiudi={vi.fn()}
      />
    );

    await utente.click(screen.getByRole("button", { name: "Elimina" }));

    await waitFor(() => {
      const avviso = screen.getByRole("alert");
      expect(avviso).toHaveTextContent(/errore di connessione/i);
    });
  });
});
