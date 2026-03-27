import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

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
  IndicatoreAnalisi: () => <div data-testid="indicatore-analisi-mock">Sto osservando la tua pianta...</div>,
}));

vi.mock("@/components/pannello-errore-analisi", () => ({
  PannelloErroreAnalisi: ({ errore, onRiprova }: { errore: { messaggio: string; tipo?: string }; onRiprova: () => void }) => (
    <div data-testid="pannello-errore-analisi-mock">
      <span data-testid="messaggio-errore-mock">{errore.messaggio}</span>
      <span data-testid="tipo-errore-mock">{errore.tipo}</span>
      <button type="button" onClick={onRiprova} data-testid="bottone-riprova-mock">Riprova</button>
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));

import { UploadZone } from "@/components/upload-zone";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAnalysis } from "@/hooks/useAnalysis";

const mockGestisciSelezioneFile = vi.fn();
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
    gestisciSelezioneFile: mockGestisciSelezioneFile,
    rimuoviFile: mockRimuoviFile,
    ...overrides,
  });
}

beforeEach(() => {
  mockGestisciSelezioneFile.mockReset();
  mockRimuoviFile.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("UploadZone", () => {
  it("renderizza lo stato idle iniziale con i pulsanti galleria e fotocamera", () => {
    impostaStatoHook();
    render(<UploadZone />);

    expect(
      screen.getByRole("button", { name: /scegli dalla galleria/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /scatta una foto/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/trascina qui la foto/i)).toBeInTheDocument();
  });

  it("cliccando 'Scegli dalla galleria' attiva l'input galleria nascosto", () => {
    impostaStatoHook();
    render(<UploadZone />);

    const inputGalleria = screen.getByTestId("input-galleria");
    const clickSpy = vi.spyOn(inputGalleria, "click");

    fireEvent.click(
      screen.getByRole("button", { name: /scegli dalla galleria/i }),
    );

    expect(clickSpy).toHaveBeenCalled();
  });

  it("cliccando 'Scatta una foto' attiva l'input fotocamera nascosto", () => {
    impostaStatoHook();
    render(<UploadZone />);

    const inputFotocamera = screen.getByTestId("input-fotocamera");
    const clickSpy = vi.spyOn(inputFotocamera, "click");

    fireEvent.click(
      screen.getByRole("button", { name: /scatta una foto/i }),
    );

    expect(clickSpy).toHaveBeenCalled();
  });

  it("selezionando un file valido mostra l'anteprima con immagine e info file", () => {
    const fileOriginale = new File(["contenuto"], "pianta.jpg", {
      type: "image/jpeg",
    });
    const fileCompresso = new File(["compresso"], "pianta-compressa.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(fileCompresso, "size", { value: 500 * 1024 });

    impostaStatoHook({
      fileOriginale,
      fileCompresso,
      urlAnteprima: "blob:http://localhost:3000/fake-uuid",
      statoProcessamento: "pronto",
    });

    render(<UploadZone />);

    expect(
      screen.getByAltText("Anteprima foto pianta"),
    ).toBeInTheDocument();
    expect(screen.getByText("pianta.jpg")).toBeInTheDocument();
    expect(screen.getByText("500.0 KB")).toBeInTheDocument();
  });

  it("selezionando un file con formato non valido mostra il messaggio di errore formato", () => {
    impostaStatoHook({
      statoProcessamento: "errore",
      errore:
        "Formato non supportato. Sono accettati solo: JPEG, PNG e WebP.",
      tipoErrore: "formato",
      nomeFileRifiutato: "documento.pdf",
    });

    render(<UploadZone />);

    expect(
      screen.getByText("Formato non supportato"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Formato non supportato. Sono accettati solo: JPEG, PNG e WebP.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/formati accettati/i)).toBeInTheDocument();
    expect(screen.getByText("documento.pdf")).toBeInTheDocument();
  });

  it("selezionando un file troppo grande mostra il messaggio di errore dimensione", () => {
    impostaStatoHook({
      statoProcessamento: "errore",
      errore:
        "Il file è troppo grande (15.0 MB). La dimensione massima consentita è 10 MB.",
      tipoErrore: "dimensione",
      nomeFileRifiutato: "foto-enorme.jpg",
    });

    render(<UploadZone />);

    expect(screen.getByText("File troppo grande")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Il file è troppo grande (15.0 MB). La dimensione massima consentita è 10 MB.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/suggerimento/i)).toBeInTheDocument();
    expect(screen.getByText("foto-enorme.jpg")).toBeInTheDocument();
  });

  it("cliccando 'Riprova' nello stato errore chiama rimuoviFile per tornare allo stato idle", () => {
    impostaStatoHook({
      statoProcessamento: "errore",
      errore:
        "Formato non supportato. Sono accettati solo: JPEG, PNG e WebP.",
      tipoErrore: "formato",
      nomeFileRifiutato: "documento.pdf",
    });

    render(<UploadZone />);

    fireEvent.click(screen.getByRole("button", { name: /riprova/i }));

    expect(mockRimuoviFile).toHaveBeenCalledOnce();
  });

  it("cliccando il pulsante rimuovi nell'anteprima chiama rimuoviFile per tornare allo stato idle", () => {
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

    fireEvent.click(
      screen.getByRole("button", { name: /rimuovi foto selezionata/i }),
    );

    expect(mockRimuoviFile).toHaveBeenCalledOnce();
  });

  it("gli attributi ARIA sono presenti sulla zona e sui pulsanti", () => {
    impostaStatoHook();
    render(<UploadZone />);

    expect(
      screen.getByLabelText("Area di caricamento foto"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Seleziona foto dalla galleria"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Scatta una foto"),
    ).toBeInTheDocument();
  });

  it("l'input fotocamera ha l'attributo capture='environment'", () => {
    impostaStatoHook();
    render(<UploadZone />);

    const inputFotocamera = screen.getByTestId("input-fotocamera");
    expect(inputFotocamera).toHaveAttribute("capture", "environment");
  });

  it("con statoAnalisi='caricamento' mostra IndicatoreAnalisi al posto dell'anteprima", () => {
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

    vi.mocked(useAnalysis).mockReturnValue({
      stato: "caricamento",
      errore: null,
      avviaAnalisi: vi.fn(),
      resetta: vi.fn(),
    });

    render(<UploadZone />);

    expect(screen.getByTestId("indicatore-analisi-mock")).toBeInTheDocument();
    expect(screen.queryByAltText("Anteprima foto pianta")).not.toBeInTheDocument();
  });

  describe("errori dell'analisi — PannelloErroreAnalisi", () => {
    function impostaConAnteprima() {
      const fileOriginale = new File(["contenuto"], "pianta.jpg", { type: "image/jpeg" });
      const fileCompresso = new File(["compresso"], "pianta-compressa.jpg", { type: "image/jpeg" });
      impostaStatoHook({
        fileOriginale,
        fileCompresso,
        urlAnteprima: "blob:http://localhost:3000/fake-uuid",
        statoProcessamento: "pronto",
      });
    }

    it("mostra PannelloErroreAnalisi quando useAnalysis restituisce un errore", () => {
      impostaConAnteprima();
      vi.mocked(useAnalysis).mockReturnValue({
        stato: "errore",
        errore: { messaggio: "Foto non abbastanza chiara", tipo: "confidenza-bassa" },
        avviaAnalisi: vi.fn(),
        resetta: vi.fn(),
      });

      render(<UploadZone />);

      expect(screen.getByTestId("pannello-errore-analisi-mock")).toBeInTheDocument();
      expect(screen.getByTestId("messaggio-errore-mock")).toHaveTextContent("Foto non abbastanza chiara");
      expect(screen.getByTestId("tipo-errore-mock")).toHaveTextContent("confidenza-bassa");
    });

    it("non mostra PannelloErroreAnalisi quando non ci sono errori di analisi", () => {
      impostaConAnteprima();
      vi.mocked(useAnalysis).mockReturnValue({
        stato: "idle",
        errore: null,
        avviaAnalisi: vi.fn(),
        resetta: vi.fn(),
      });

      render(<UploadZone />);

      expect(screen.queryByTestId("pannello-errore-analisi-mock")).not.toBeInTheDocument();
    });

    it("il pulsante 'Riprova' nel pannello chiama resetta di useAnalysis", () => {
      impostaConAnteprima();
      const resetta = vi.fn();
      vi.mocked(useAnalysis).mockReturnValue({
        stato: "errore",
        errore: { messaggio: "Connessione non disponibile", tipo: "rete" },
        avviaAnalisi: vi.fn(),
        resetta,
      });

      render(<UploadZone />);

      fireEvent.click(screen.getByTestId("bottone-riprova-mock"));

      expect(resetta).toHaveBeenCalledOnce();
    });

    it("mostra il pannello errore per tipo 'pianta-non-riconosciuta'", () => {
      impostaConAnteprima();
      vi.mocked(useAnalysis).mockReturnValue({
        stato: "errore",
        errore: { messaggio: "Nessuna pianta rilevata", tipo: "pianta-non-riconosciuta" },
        avviaAnalisi: vi.fn(),
        resetta: vi.fn(),
      });

      render(<UploadZone />);

      expect(screen.getByTestId("tipo-errore-mock")).toHaveTextContent("pianta-non-riconosciuta");
    });

    it("mostra il pannello errore per tipo 'errore-api'", () => {
      impostaConAnteprima();
      vi.mocked(useAnalysis).mockReturnValue({
        stato: "errore",
        errore: { messaggio: "Servizio non disponibile", tipo: "errore-api" },
        avviaAnalisi: vi.fn(),
        resetta: vi.fn(),
      });

      render(<UploadZone />);

      expect(screen.getByTestId("tipo-errore-mock")).toHaveTextContent("errore-api");
    });
  });

  it("con statoAnalisi='caricamento' l'indicatore mostra un messaggio di caricamento", () => {
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

    vi.mocked(useAnalysis).mockReturnValue({
      stato: "caricamento",
      errore: null,
      avviaAnalisi: vi.fn(),
      resetta: vi.fn(),
    });

    render(<UploadZone />);

    expect(
      screen.getByText("Sto osservando la tua pianta..."),
    ).toBeInTheDocument();
  });

  describe("drag and drop — feedback visivo e gestione file", () => {
    function ottieniZona() {
      return screen.getByLabelText("Area di caricamento foto");
    }

    function creaDataTransferConFile(file: File): DataTransfer {
      const dataTransfer = {
        files: { 0: file, length: 1, item: () => file },
        items: [],
        types: ["Files"],
      } as unknown as DataTransfer;
      return dataTransfer;
    }

    it("dragEnter sulla zona nello stato idle applica la classe di evidenziazione", () => {
      impostaStatoHook();
      render(<UploadZone />);

      const zona = ottieniZona();
      fireEvent.dragEnter(zona);

      expect(zona.className).toContain("border-primary-500");
    });

    it("dragLeave dalla zona rimuove la classe di evidenziazione", () => {
      impostaStatoHook();
      render(<UploadZone />);

      const zona = ottieniZona();
      fireEvent.dragEnter(zona);
      fireEvent.dragLeave(zona);

      expect(zona.className).not.toContain("border-primary-500");
    });

    it("sequenza dragEnter figlio + dragLeave figlio non resetta prematuramente isDragOver", () => {
      impostaStatoHook();
      render(<UploadZone />);

      const zona = ottieniZona();
      // Simula: cursore entra nella zona, poi entra nel figlio (doppio enter) e lascia il figlio (un leave)
      fireEvent.dragEnter(zona); // counter = 1, isDragOver = true
      fireEvent.dragEnter(zona); // counter = 2, isDragOver = true
      fireEvent.dragLeave(zona); // counter = 1, isDragOver rimane true

      expect(zona.className).toContain("border-primary-500");
    });

    it("dopo due dragEnter e due dragLeave isDragOver è false", () => {
      impostaStatoHook();
      render(<UploadZone />);

      const zona = ottieniZona();
      fireEvent.dragEnter(zona); // counter = 1
      fireEvent.dragEnter(zona); // counter = 2
      fireEvent.dragLeave(zona); // counter = 1
      fireEvent.dragLeave(zona); // counter = 0, isDragOver = false

      expect(zona.className).not.toContain("border-primary-500");
    });

    it("drop con file valido chiama gestisciSelezioneFile con il file corretto", () => {
      impostaStatoHook();
      render(<UploadZone />);

      const zona = ottieniZona();
      const filePianta = new File(["contenuto"], "pianta.jpg", { type: "image/jpeg" });
      const dataTransfer = creaDataTransferConFile(filePianta);

      fireEvent.dragEnter(zona);
      fireEvent.drop(zona, { dataTransfer });

      expect(mockGestisciSelezioneFile).toHaveBeenCalledWith(filePianta);
    });

    it("dopo il drop isDragOver è false (classe evidenziazione rimossa)", () => {
      impostaStatoHook();
      render(<UploadZone />);

      const zona = ottieniZona();
      const filePianta = new File(["contenuto"], "pianta.jpg", { type: "image/jpeg" });
      const dataTransfer = creaDataTransferConFile(filePianta);

      fireEvent.dragEnter(zona);
      expect(zona.className).toContain("border-primary-500");

      fireEvent.drop(zona, { dataTransfer });
      expect(zona.className).not.toContain("border-primary-500");
    });

    it("drop con file non immagine chiama gestisciSelezioneFile (la validazione errore è gestita dall'hook)", () => {
      impostaStatoHook();
      render(<UploadZone />);

      const zona = ottieniZona();
      const filePdf = new File(["contenuto"], "documento.pdf", { type: "application/pdf" });
      const dataTransfer = creaDataTransferConFile(filePdf);

      fireEvent.drop(zona, { dataTransfer });

      expect(mockGestisciSelezioneFile).toHaveBeenCalledWith(filePdf);
    });

    it("il feedback visivo drag NON appare quando lo stato è 'pronto' (file già caricato)", () => {
      const fileOriginale = new File(["contenuto"], "pianta.jpg", { type: "image/jpeg" });
      const fileCompresso = new File(["compresso"], "pianta-compressa.jpg", { type: "image/jpeg" });
      impostaStatoHook({
        fileOriginale,
        fileCompresso,
        urlAnteprima: "blob:http://localhost:3000/fake-uuid",
        statoProcessamento: "pronto",
      });
      render(<UploadZone />);

      const zona = ottieniZona();
      fireEvent.dragEnter(zona);

      // In stato "pronto" il bordo non diventa border-primary-500 (isDragOver non cambia le classi)
      expect(zona.className).not.toContain("border-primary-500");
    });
  });
});
