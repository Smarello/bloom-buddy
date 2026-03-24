import { describe, it, expect } from "vitest";
import { parseRispostaGemini, ErroreAnalisi } from "@/lib/ai/parse-response";
import type { PlantAnalysis } from "@/types/analysis";

function creaRispostaValida(): string {
  const analisi: PlantAnalysis = {
    nomeComune: "Pothos dorato",
    nomeScientifico: "Epipremnum aureum",
    livelloConfidenza: 0.92,
    statoSalute: "fair",
    descrizioneSalute:
      "La pianta mostra alcuni segni di sofferenza — alcune foglie ingiallite suggeriscono eccesso d'acqua. Con le giuste cure si riprenderà presto!",
    consigliCura: [
      {
        titolo: "Riduci l'annaffiatura",
        descrizione: "Aspetta che il primo strato di terriccio sia asciutto prima di annaffiare.",
        priorita: "alta",
      },
      {
        titolo: "Controlla il drenaggio",
        descrizione: "Assicurati che il vaso abbia fori di drenaggio sufficienti.",
        priorita: "alta",
      },
      {
        titolo: "Sposta verso più luce",
        descrizione: "Una posizione a 1-2 metri da una finestra è ideale.",
        priorita: "media",
      },
    ],
    informazioniGenerali: {
      annaffiatura: "Ogni 7-10 giorni in estate",
      luce: "Luce indiretta brillante",
      temperatura: "15-30 °C",
      umidita: "Media (40-60%)",
    },
  };
  return JSON.stringify(analisi);
}

describe("parseRispostaGemini", () => {
  describe("risposta JSON valida", () => {
    it("parsa correttamente una risposta Gemini valida", () => {
      const risultato = parseRispostaGemini(creaRispostaValida());

      expect(risultato.nomeComune).toBe("Pothos dorato");
      expect(risultato.nomeScientifico).toBe("Epipremnum aureum");
      expect(risultato.livelloConfidenza).toBe(0.92);
      expect(risultato.statoSalute).toBe("fair");
      expect(risultato.consigliCura).toHaveLength(3);
      expect(risultato.consigliCura[0].priorita).toBe("alta");
      expect(risultato.informazioniGenerali.annaffiatura).toBe(
        "Ogni 7-10 giorni in estate",
      );
    });

    it("rimuove i backtick markdown dalla risposta prima del parsing", () => {
      const rispostaConMarkdown = `\`\`\`json\n${creaRispostaValida()}\n\`\`\``;
      const risultato = parseRispostaGemini(rispostaConMarkdown);

      expect(risultato.nomeComune).toBe("Pothos dorato");
    });

    it("usa 'fair' come stato salute di fallback se il valore non è valido", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.statoSalute = "valore-non-valido";

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.statoSalute).toBe("fair");
    });

    it("filtra i consigli di cura malformati", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.consigliCura = [
        { titolo: "Consiglio valido", descrizione: "Desc.", priorita: "alta" },
        null,
        "stringa non valida",
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.consigliCura).toHaveLength(1);
      expect(risultato.consigliCura[0].titolo).toBe("Consiglio valido");
    });
  });

  describe("risposta malformata", () => {
    it("lancia ErroreAnalisi con tipo risposta-malformata se il JSON è invalido", () => {
      expect(() => parseRispostaGemini("questo non è JSON")).toThrow(ErroreAnalisi);

      try {
        parseRispostaGemini("questo non è JSON");
      } catch (errore) {
        expect(errore).toBeInstanceOf(ErroreAnalisi);
        expect((errore as ErroreAnalisi).tipo).toBe("risposta-malformata");
      }
    });

    it("lancia ErroreAnalisi con tipo risposta-malformata se il JSON non è un oggetto", () => {
      expect(() => parseRispostaGemini('"stringa json valida ma non oggetto"')).toThrow(
        ErroreAnalisi,
      );
    });

    it("lancia ErroreAnalisi se nomeComune è assente o vuoto", () => {
      const dati = JSON.parse(creaRispostaValida());
      delete dati.nomeComune;

      try {
        parseRispostaGemini(JSON.stringify(dati));
        expect.fail("Doveva lanciare un errore");
      } catch (errore) {
        expect(errore).toBeInstanceOf(ErroreAnalisi);
        expect((errore as ErroreAnalisi).tipo).toBe("risposta-malformata");
      }
    });
  });

  describe("pianta non riconosciuta", () => {
    it("lancia ErroreAnalisi con tipo pianta-non-riconosciuta se nomeComune è 'Nessuna pianta riconosciuta'", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.nomeComune = "Nessuna pianta riconosciuta";
      dati.livelloConfidenza = 0;

      try {
        parseRispostaGemini(JSON.stringify(dati));
        expect.fail("Doveva lanciare un errore");
      } catch (errore) {
        expect(errore).toBeInstanceOf(ErroreAnalisi);
        expect((errore as ErroreAnalisi).tipo).toBe("pianta-non-riconosciuta");
      }
    });

    it("lancia ErroreAnalisi con tipo pianta-non-riconosciuta se livelloConfidenza è 0", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.livelloConfidenza = 0;

      try {
        parseRispostaGemini(JSON.stringify(dati));
        expect.fail("Doveva lanciare un errore");
      } catch (errore) {
        expect(errore).toBeInstanceOf(ErroreAnalisi);
        expect((errore as ErroreAnalisi).tipo).toBe("pianta-non-riconosciuta");
      }
    });
  });

  describe("confidenza bassa", () => {
    it("lancia ErroreAnalisi con tipo confidenza-bassa se livelloConfidenza è < 0.4", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.livelloConfidenza = 0.3;

      try {
        parseRispostaGemini(JSON.stringify(dati));
        expect.fail("Doveva lanciare un errore");
      } catch (errore) {
        expect(errore).toBeInstanceOf(ErroreAnalisi);
        expect((errore as ErroreAnalisi).tipo).toBe("confidenza-bassa");
        expect((errore as ErroreAnalisi).message).toContain("foto più nitida");
      }
    });

    it("non lancia errore se livelloConfidenza è esattamente 0.4", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.livelloConfidenza = 0.4;

      expect(() => parseRispostaGemini(JSON.stringify(dati))).not.toThrow();
    });
  });
});
