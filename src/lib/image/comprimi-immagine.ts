import imageCompression from "browser-image-compression";

export interface OpzioniCompressione {
  dimensioneMassimaMB?: number;
  larghezzaMassimaPixel?: number;
}

const OPZIONI_DEFAULT: Required<OpzioniCompressione> = {
  dimensioneMassimaMB: 1,
  larghezzaMassimaPixel: 1920,
};

export async function comprimiImmagine(
  file: File,
  opzioni?: OpzioniCompressione,
): Promise<File> {
  const { dimensioneMassimaMB, larghezzaMassimaPixel } = {
    ...OPZIONI_DEFAULT,
    ...opzioni,
  };

  const fileCompresso = await imageCompression(file, {
    maxSizeMB: dimensioneMassimaMB,
    maxWidthOrHeight: larghezzaMassimaPixel,
    useWebWorker: true,
    fileType: file.type as string,
  });

  return fileCompresso;
}
