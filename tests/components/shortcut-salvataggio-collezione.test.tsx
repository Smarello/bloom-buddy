import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
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

const URL_DATA_FINTO = "data:image/jpeg;base64,dGVzdA==";

const COLLEZIONE_CON_MATCH = {
  id: "col-shortcut-1",
  nome: "I miei Pothos",
  nomeScientifico: "Epipremnum aureum",
  numeroAnalisi: 3,
  anteprimaUrl: null,
};

const COLLEZIONE_SENZA_MATCH = {
  id: "col-altro",
  nome: "Succulente",
  nomeScientifico: "Echeveria elegans",
  numeroAnalisi: 1,
  anteprimaUrl: null,
};

function creaFetchMockPerShortcut(collezioni: unknown[]) {
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
        json: () => Promise.resolve({ collezioneId: "col-shortcut-1" }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

describe("Shortcut salvataggio collezione - flusso integrazione completo", () => {
  let fetchSpia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("completa il flusso: chip appare, click salva con collezioneId corretto, redirect, e SelettoreCollezione non si apre", async () => {
    fetchSpia = creaFetchMockPerShortcut([COLLEZIONE_CON_MATCH, COLLEZIONE_SENZA_MATCH]);
    global.fetch = fetchSpia;
    const user = userEvent.setup();

    render(
      <AnalysisResult
        analisi={creaAnalisiTest()}
        urlAnteprima={URL_DATA_FINTO}
        onNuovaAnalisi={vi.fn()}
        utenteAutenticato={true}
        giaSalvata={false}
      />
    );

    // 1. Attende che il pulsante shortcut della collezione suggerita appaia
    const pulsanteShortcut = await screen.findByRole("button", { name: /salva nella collezione i miei pothos/i });
    expect(pulsanteShortcut).toBeInTheDocument();

    // 2. Verifica che la collezione non corrispondente NON sia visibile come shortcut
    expect(screen.queryByRole("button", { name: /salva nella collezione succulente/i })).not.toBeInTheDocument();

    // 3. Click sul pulsante shortcut
    await user.click(pulsanteShortcut);

    // 4. Verifica che POST /api/collezione sia stato chiamato con il collezioneId corretto
    await waitFor(() => {
      const chiamataPost = fetchSpia.mock.calls.find(
        (call: unknown[]) => call[0] === "/api/collezione" && (call[1] as RequestInit)?.method === "POST"
      );
      expect(chiamataPost).toBeDefined();
      const formDataInviato: FormData = (chiamataPost![1] as RequestInit).body as FormData;
      expect(formDataInviato.get("collezioneId")).toBe("col-shortcut-1");
    });

    // 5. Verifica il redirect alla pagina della collezione
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/collezione/col-shortcut-1");
    });

    // 6. Verifica che il SelettoreCollezione (dialog) NON sia stato aperto
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });
});
