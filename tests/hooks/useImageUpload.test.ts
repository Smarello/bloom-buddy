import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("browser-image-compression", () => ({
  default: vi.fn(),
}));

import { useImageUpload } from "@/hooks/useImageUpload";
import imageCompression from "browser-image-compression";

const mockImageCompression = vi.mocked(imageCompression);

const URL_ANTEPRIMA_FINTA = "blob:http://localhost:3000/fake-uuid";

function creaFileFinto(nome: string, dimensione: number, tipo = "image/jpeg"): File {
  const buffer = new ArrayBuffer(dimensione);
  return new File([buffer], nome, { type: tipo });
}

beforeEach(() => {
  mockImageCompression.mockReset();

  vi.stubGlobal("URL", {
    ...globalThis.URL,
    createObjectURL: vi.fn(() => URL_ANTEPRIMA_FINTA),
    revokeObjectURL: vi.fn(),
  });
});

describe("useImageUpload", () => {
  it("lo stato iniziale è idle con tutti i valori null", () => {
    const { result } = renderHook(() => useImageUpload());

    expect(result.current.fileOriginale).toBeNull();
    expect(result.current.fileCompresso).toBeNull();
    expect(result.current.urlAnteprima).toBeNull();
    expect(result.current.statoProcessamento).toBe("idle");
    expect(result.current.errore).toBeNull();
    expect(result.current.tipoErrore).toBeNull();
    expect(result.current.nomeFileRifiutato).toBeNull();
  });

  it("un file valido avvia la compressione e passa allo stato pronto con URL anteprima", async () => {
    const fileOriginale = creaFileFinto("foto.jpg", 2 * 1024 * 1024);
    const fileCompresso = creaFileFinto("foto-compressa.jpg", 500 * 1024);
    mockImageCompression.mockResolvedValue(fileCompresso);

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      result.current.gestisciSelezioneFile(fileOriginale);
    });

    expect(result.current.statoProcessamento).toBe("pronto");
    expect(result.current.fileOriginale).toBe(fileOriginale);
    expect(result.current.fileCompresso).toBe(fileCompresso);
    expect(result.current.urlAnteprima).toBe(URL_ANTEPRIMA_FINTA);
    expect(result.current.errore).toBeNull();
    expect(URL.createObjectURL).toHaveBeenCalledWith(fileCompresso);
  });

  it("un file con formato non valido imposta lo stato errore con messaggio sul formato", () => {
    const filePdf = creaFileFinto("documento.pdf", 1024, "application/pdf");

    const { result } = renderHook(() => useImageUpload());

    act(() => {
      result.current.gestisciSelezioneFile(filePdf);
    });

    expect(result.current.statoProcessamento).toBe("errore");
    expect(result.current.errore).toBe(
      "Formato non supportato. Sono accettati solo: JPEG, PNG e WebP.",
    );
    expect(result.current.tipoErrore).toBe("formato");
    expect(result.current.nomeFileRifiutato).toBe("documento.pdf");
    expect(result.current.fileOriginale).toBeNull();
    expect(result.current.fileCompresso).toBeNull();
    expect(mockImageCompression).not.toHaveBeenCalled();
  });

  it("un file troppo grande imposta lo stato errore con messaggio sulla dimensione", () => {
    const dimensioneByte = 15 * 1024 * 1024;
    const fileGrande = creaFileFinto("foto-enorme.jpg", dimensioneByte);

    const { result } = renderHook(() => useImageUpload());

    act(() => {
      result.current.gestisciSelezioneFile(fileGrande);
    });

    expect(result.current.statoProcessamento).toBe("errore");
    expect(result.current.errore).toBe(
      "Il file è troppo grande (15.0 MB). La dimensione massima consentita è 10 MB.",
    );
    expect(result.current.tipoErrore).toBe("dimensione");
    expect(result.current.nomeFileRifiutato).toBe("foto-enorme.jpg");
    expect(result.current.fileOriginale).toBeNull();
    expect(mockImageCompression).not.toHaveBeenCalled();
  });

  it("rimuoviFile() resetta lo stato iniziale e chiama URL.revokeObjectURL", async () => {
    const fileOriginale = creaFileFinto("foto.jpg", 2 * 1024 * 1024);
    const fileCompresso = creaFileFinto("foto-compressa.jpg", 500 * 1024);
    mockImageCompression.mockResolvedValue(fileCompresso);

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      result.current.gestisciSelezioneFile(fileOriginale);
    });

    expect(result.current.statoProcessamento).toBe("pronto");

    act(() => {
      result.current.rimuoviFile();
    });

    expect(result.current.fileOriginale).toBeNull();
    expect(result.current.fileCompresso).toBeNull();
    expect(result.current.urlAnteprima).toBeNull();
    expect(result.current.statoProcessamento).toBe("idle");
    expect(result.current.errore).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(URL_ANTEPRIMA_FINTA);
  });

  it("URL.revokeObjectURL viene chiamato all'unmount se esiste un URL anteprima", async () => {
    const fileOriginale = creaFileFinto("foto.jpg", 2 * 1024 * 1024);
    const fileCompresso = creaFileFinto("foto-compressa.jpg", 500 * 1024);
    mockImageCompression.mockResolvedValue(fileCompresso);

    const { result, unmount } = renderHook(() => useImageUpload());

    await act(async () => {
      result.current.gestisciSelezioneFile(fileOriginale);
    });

    expect(result.current.statoProcessamento).toBe("pronto");

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(URL_ANTEPRIMA_FINTA);
  });

  it("un errore di compressione imposta lo stato errore", async () => {
    const fileOriginale = creaFileFinto("foto.jpg", 2 * 1024 * 1024);
    mockImageCompression.mockRejectedValue(new Error("Compression failed"));

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      result.current.gestisciSelezioneFile(fileOriginale);
    });

    expect(result.current.statoProcessamento).toBe("errore");
    expect(result.current.errore).toBe(
      "Si è verificato un errore durante la compressione dell'immagine. Riprova.",
    );
    expect(result.current.tipoErrore).toBe("compressione");
    expect(result.current.nomeFileRifiutato).toBe("foto.jpg");
    expect(result.current.fileOriginale).toBeNull();
    expect(result.current.fileCompresso).toBeNull();
    expect(result.current.urlAnteprima).toBeNull();
  });
});
