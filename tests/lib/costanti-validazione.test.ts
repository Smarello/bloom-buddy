import { describe, it, expect } from "vitest";
import {
  validaFormatoImmagine,
  validaDimensioneImmagine,
  FORMATI_IMMAGINE_ACCETTATI,
  DIMENSIONE_MASSIMA_FILE_BYTE,
} from "@/lib/image/costanti-validazione";

describe("validaFormatoImmagine", () => {
  it.each(FORMATI_IMMAGINE_ACCETTATI)("accetta il formato %s", (formato) => {
    const risultato = validaFormatoImmagine(formato);
    expect(risultato.valido).toBe(true);
    expect(risultato.errore).toBeUndefined();
  });

  it.each(["image/gif", "image/bmp", "application/pdf", "text/plain", ""])(
    "rifiuta il formato %s",
    (formato) => {
      const risultato = validaFormatoImmagine(formato);
      expect(risultato.valido).toBe(false);
      expect(risultato.errore).toBeDefined();
      expect(risultato.errore).toContain("Formato non supportato");
    },
  );
});

describe("validaDimensioneImmagine", () => {
  it("accetta un file sotto il limite", () => {
    const risultato = validaDimensioneImmagine(5 * 1024 * 1024);
    expect(risultato.valido).toBe(true);
    expect(risultato.errore).toBeUndefined();
  });

  it("accetta un file esattamente al limite", () => {
    const risultato = validaDimensioneImmagine(DIMENSIONE_MASSIMA_FILE_BYTE);
    expect(risultato.valido).toBe(true);
  });

  it("rifiuta un file sopra il limite", () => {
    const risultato = validaDimensioneImmagine(DIMENSIONE_MASSIMA_FILE_BYTE + 1);
    expect(risultato.valido).toBe(false);
    expect(risultato.errore).toContain("troppo grande");
    expect(risultato.errore).toContain("10 MB");
  });

  it("accetta un file di 0 byte", () => {
    const risultato = validaDimensioneImmagine(0);
    expect(risultato.valido).toBe(true);
  });
});
