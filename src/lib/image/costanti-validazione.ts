export const FORMATI_IMMAGINE_ACCETTATI = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type FormatoImmagineAccettato = (typeof FORMATI_IMMAGINE_ACCETTATI)[number];

export const ESTENSIONI_FORMATI_ACCETTATI: Record<FormatoImmagineAccettato, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const DIMENSIONE_MASSIMA_FILE_BYTE = 10 * 1024 * 1024; // 10 MB

export const STRINGA_ACCEPT_INPUT = FORMATI_IMMAGINE_ACCETTATI.join(",");

export interface RisultatoValidazione {
  valido: boolean;
  errore?: string;
}

export function validaFormatoImmagine(tipoFile: string): RisultatoValidazione {
  if (FORMATI_IMMAGINE_ACCETTATI.includes(tipoFile as FormatoImmagineAccettato)) {
    return { valido: true };
  }
  return {
    valido: false,
    errore: `Formato non supportato. Sono accettati solo: JPEG, PNG e WebP.`,
  };
}

export function validaDimensioneImmagine(dimensioneByte: number): RisultatoValidazione {
  if (dimensioneByte <= DIMENSIONE_MASSIMA_FILE_BYTE) {
    return { valido: true };
  }
  const dimensioneMB = (dimensioneByte / (1024 * 1024)).toFixed(1);
  return {
    valido: false,
    errore: `Il file è troppo grande (${dimensioneMB} MB). La dimensione massima consentita è 10 MB.`,
  };
}
