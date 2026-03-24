import { describe, it, expect, vi } from "vitest";

vi.mock("browser-image-compression", () => ({
  default: vi.fn(),
}));

import { comprimiImmagine } from "@/lib/image/comprimi-immagine";
import imageCompression from "browser-image-compression";

const mockImageCompression = vi.mocked(imageCompression);

function creaFileFinto(nome: string, dimensione: number, tipo = "image/jpeg"): File {
  const buffer = new ArrayBuffer(dimensione);
  return new File([buffer], nome, { type: tipo });
}

describe("comprimiImmagine", () => {
  it("chiama browser-image-compression con le opzioni di default", async () => {
    const fileOriginale = creaFileFinto("foto.jpg", 5 * 1024 * 1024);
    const fileCompresso = creaFileFinto("foto-compressa.jpg", 800 * 1024);
    mockImageCompression.mockResolvedValue(fileCompresso);

    const risultato = await comprimiImmagine(fileOriginale);

    expect(mockImageCompression).toHaveBeenCalledWith(fileOriginale, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/jpeg",
    });
    expect(risultato).toBe(fileCompresso);
  });

  it("accetta opzioni personalizzate", async () => {
    const fileOriginale = creaFileFinto("foto.png", 3 * 1024 * 1024, "image/png");
    const fileCompresso = creaFileFinto("foto-compressa.png", 500 * 1024, "image/png");
    mockImageCompression.mockResolvedValue(fileCompresso);

    await comprimiImmagine(fileOriginale, {
      dimensioneMassimaMB: 2,
      larghezzaMassimaPixel: 1024,
    });

    expect(mockImageCompression).toHaveBeenCalledWith(fileOriginale, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: "image/png",
    });
  });

  it("propaga l'errore se la compressione fallisce", async () => {
    const fileOriginale = creaFileFinto("foto.jpg", 5 * 1024 * 1024);
    mockImageCompression.mockRejectedValue(new Error("Compression failed"));

    await expect(comprimiImmagine(fileOriginale)).rejects.toThrow("Compression failed");
  });
});
