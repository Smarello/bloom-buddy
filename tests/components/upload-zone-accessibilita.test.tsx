import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/hooks/useImageUpload", () => ({
  useImageUpload: vi.fn(),
}));

vi.mock("@/hooks/useAnalysis", () => ({
  useAnalysis: vi.fn(() => ({
    stato: "idle",
    errore: null,
    avviaAnalisi: vi.fn(),
    resetta: vi.fn(),
  })),
  CHIAVE_SESSION_STORAGE: "bloombuddy-analisi-corrente",
}));

vi.mock("@/components/indicatore-analisi", () => ({
  IndicatoreAnalisi: () => (
    <div data-testid="indicatore-analisi-mock">Analisi in corso...</div>
  ),
}));

vi.mock("@/components/pannello-errore-analisi", () => ({
  PannelloErroreAnalisi: ({
    errore,
    onRiprova,
  }: {
    errore: { messaggio: string; tipo?: string };
    onRiprova: () => void;
  }) => (
    <div data-testid="pannello-errore-analisi-mock">
      <span>{errore.messaggio}</span>
      <button type="button" onClick={onRiprova}>
        Riprova
      </button>
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

import { UploadZone } from "@/components/upload-zone";
import { useImageUpload } from "@/hooks/useImageUpload";

const mockRimuoviFile = vi.fn();

function impostaStatoHook(
  overrides: Partial<ReturnType<typeof useImageUpload>> = {},
) {
  vi.mocked(useImageUpload).mockReturnValue({
    fileOriginale: null,
    fileCompresso: null,
    urlAnteprima: null,
    statoProcessamento: "idle",
    errore: null,
    tipoErrore: null,
    nomeFileRifiutato: null,
    gestisciSelezioneFile: vi.fn(),
    rimuoviFile: mockRimuoviFile,
    ...overrides,
  });
}

beforeEach(() => {
  mockRimuoviFile.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("UploadZone — accessibilità ARIA", () => {
  describe("stato errore", () => {
    it("il contenitore dell'errore ha role='alert' per notificare immediatamente gli screen reader", () => {
      impostaStatoHook({
        statoProcessamento: "errore",
        errore: "Formato non supportato. Sono accettati solo: JPEG, PNG e WebP.",
        tipoErrore: "formato",
        nomeFileRifiutato: "documento.pdf",
      });

      render(<UploadZone />);

      const alertElement = screen.getByRole("alert");
      expect(alertElement).toBeInTheDocument();
    });

    it("il bottone 'Riprova' è raggiungibile via screen reader con nome descrittivo", () => {
      impostaStatoHook({
        statoProcessamento: "errore",
        errore: "Formato non supportato.",
        tipoErrore: "formato",
        nomeFileRifiutato: "documento.pdf",
      });

      render(<UploadZone />);

      const bottoneRiprova = screen.getByRole("button", {
        name: /riprova a caricare una foto/i,
      });
      expect(bottoneRiprova).toBeInTheDocument();
    });

    it("il messaggio di errore è contenuto dentro il region alert", () => {
      impostaStatoHook({
        statoProcessamento: "errore",
        errore: "Formato non supportato. Sono accettati solo: JPEG, PNG e WebP.",
        tipoErrore: "formato",
        nomeFileRifiutato: "documento.pdf",
      });

      render(<UploadZone />);

      const alertRegion = screen.getByRole("alert");
      expect(alertRegion).toHaveTextContent(/formato non supportato/i);
    });
  });

  describe("stato compressione", () => {
    it("il contenitore della compressione ha aria-live='polite' per aggiornamenti non urgenti", () => {
      impostaStatoHook({ statoProcessamento: "compressione" });

      render(<UploadZone />);

      const elementoConAriaLive = document.querySelector("[aria-live='polite']");
      expect(elementoConAriaLive).not.toBeNull();
    });

    it("il contenitore della compressione ha aria-label descrittivo", () => {
      impostaStatoHook({ statoProcessamento: "compressione" });

      render(<UploadZone />);

      const elementoCompressione = document.querySelector(
        "[aria-label='Compressione immagine in corso']",
      );
      expect(elementoCompressione).not.toBeNull();
    });
  });

  describe("stato pronto — bottone cambia", () => {
    it("il bottone 'Cambia' ha aria-label descrittivo", () => {
      const fileOriginale = new File(["contenuto"], "pianta.jpg", {
        type: "image/jpeg",
      });
      const fileCompresso = new File(["compresso"], "pianta-compressa.jpg", {
        type: "image/jpeg",
      });

      impostaStatoHook({
        fileOriginale,
        fileCompresso,
        urlAnteprima: "blob:http://localhost:3000/fake-uuid",
        statoProcessamento: "pronto",
      });

      render(<UploadZone />);

      const bottoneCambia = screen.getByRole("button", {
        name: /cambia foto selezionata/i,
      });
      expect(bottoneCambia).toBeInTheDocument();
    });
  });
});
