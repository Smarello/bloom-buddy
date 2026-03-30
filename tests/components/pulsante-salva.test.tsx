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
import { creaAnalisiTest, URL_ANTEPRIMA_FINTO } from "../helpers/analisi-fixture";

function creaRispostaApi(status: number, body: Record<string, unknown> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

const RISPOSTA_LISTA_VUOTA = creaRispostaApi(200, { collezioni: [] });

function creaFetchMockConLista(rispostaSalvataggio?: ReturnType<typeof creaRispostaApi>) {
  return vi.fn((url: string) => {
    if (typeof url === "string" && url.includes("/api/collezione/lista")) {
      return Promise.resolve(RISPOSTA_LISTA_VUOTA);
    }
    if (rispostaSalvataggio) {
      return Promise.resolve(rispostaSalvataggio);
    }
    return Promise.resolve(creaRispostaApi(404));
  });
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
    vi.stubGlobal("fetch", creaFetchMockConLista());

    render(
      <AnalysisResult
        analisi={creaAnalisiTest()}
        urlAnteprima={URL_ANTEPRIMA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
      />
    );

    expect(screen.getByRole("button", { name: /salva nella collezione/i })).toBeInTheDocument();
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

    const fetchMock = vi.fn((url: string) => {
      if (typeof url === "string" && url.includes("/api/collezione/lista")) {
        return Promise.resolve(RISPOSTA_LISTA_VUOTA);
      }
      return new Promise((resolve) => setTimeout(() => resolve(creaRispostaApi(201, { successo: true })), 5000));
    });

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

    vi.stubGlobal("fetch", creaFetchMockConLista(creaRispostaApi(201, { successo: true })));

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

    vi.stubGlobal("fetch", creaFetchMockConLista(creaRispostaApi(409, { errore: "duplicato" })));

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
