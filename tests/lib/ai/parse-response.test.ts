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
    informazioniRapide: {
      annaffiatura: "Moderata",
      luce: "Indiretta",
      temperatura: "18-25°C",
      umidita: "40-60%",
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

      const errore = (() => {
        try { parseRispostaGemini("questo non è JSON"); } catch (e) { return e; }
      })() as ErroreAnalisi;
      expect(errore.tipo).toBe("risposta-malformata");
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

  describe("diagnosi critiche e attenzione", () => {
    it("parsa correttamente una diagnosi critica con tutte le sezioni", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "critico",
          titolo: "Marciume radicale",
          cosaVedo: "Radici scure e molli",
          cosaSignifica: "Eccesso d'acqua prolungato",
          cosaFare: "Rinvasare rimuovendo le radici marce",
          cosaAspettarsi: "Recupero in 2-3 settimane",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(1);
      const diagnosi = risultato.diagnosi![0] as import("@/types/analysis").DiagnosiDettagliata;
      expect(diagnosi.categoria).toBe("critico");
      expect(diagnosi.titolo).toBe("Marciume radicale");
      expect(diagnosi.cosaVedo).toBe("Radici scure e molli");
      expect(diagnosi.cosaSignifica).toBe("Eccesso d'acqua prolungato");
      expect(diagnosi.cosaFare).toBe("Rinvasare rimuovendo le radici marce");
      expect(diagnosi.cosaAspettarsi).toBe("Recupero in 2-3 settimane");
    });

    it("parsa correttamente una diagnosi attenzione", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "attenzione",
          titolo: "Foglie ingiallite",
          cosaVedo: "Foglie basali gialle",
          cosaSignifica: "Possibile carenza di azoto",
          cosaFare: "Concimare con fertilizzante bilanciato",
          cosaAspettarsi: "Miglioramento in 1-2 settimane",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(1);
      expect(risultato.diagnosi![0].categoria).toBe("attenzione");
    });

    it("parsa un mix di diagnosi critica e attenzione", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "critico",
          titolo: "Marciume radicale",
          cosaVedo: "Radici scure",
          cosaSignifica: "Eccesso d'acqua",
          cosaFare: "Rinvasare",
          cosaAspettarsi: "Recupero lento",
        },
        {
          categoria: "attenzione",
          titolo: "Foglie pallide",
          cosaVedo: "Foglie scolorite",
          cosaSignifica: "Poca luce",
          cosaFare: "Spostare vicino alla finestra",
          cosaAspettarsi: "Colore più intenso in una settimana",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(2);
      expect(risultato.diagnosi![0].categoria).toBe("critico");
      expect(risultato.diagnosi![1].categoria).toBe("attenzione");
    });
  });

  describe("ottimizzazioni e caso pianta sana", () => {
    it("parsa correttamente un'ottimizzazione", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "ottimizzazione",
          titolo: "Concimazione stagionale",
          descrizione: "Aggiungi fertilizzante liquido ogni 2 settimane in primavera",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(1);
      const ottimizzazione = risultato.diagnosi![0] as import("@/types/analysis").Ottimizzazione;
      expect(ottimizzazione.categoria).toBe("ottimizzazione");
      expect(ottimizzazione.titolo).toBe("Concimazione stagionale");
      expect(ottimizzazione.descrizione).toBe("Aggiungi fertilizzante liquido ogni 2 settimane in primavera");
    });

    it("per pianta sana restituisce solo ottimizzazioni", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.statoSalute = "excellent";
      dati.diagnosi = [
        {
          categoria: "ottimizzazione",
          titolo: "Rotazione vaso",
          descrizione: "Ruota il vaso di 90° ogni settimana per crescita uniforme",
        },
        {
          categoria: "ottimizzazione",
          titolo: "Pulizia foglie",
          descrizione: "Pulisci le foglie con un panno umido una volta al mese",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(2);
      expect(risultato.diagnosi!.every((d) => d.categoria === "ottimizzazione")).toBe(true);
    });

    it("parsa mix diagnosi + ottimizzazioni", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "critico",
          titolo: "Cocciniglia",
          cosaVedo: "Macchie bianche cotonose",
          cosaSignifica: "Infestazione parassitaria",
          cosaFare: "Trattare con olio di neem",
          cosaAspettarsi: "Eliminazione in 2-3 trattamenti",
        },
        {
          categoria: "ottimizzazione",
          titolo: "Supporto crescita",
          descrizione: "Aggiungi un tutore per favorire la crescita verticale",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(2);
      expect(risultato.diagnosi![0].categoria).toBe("critico");
      expect(risultato.diagnosi![1].categoria).toBe("ottimizzazione");
    });
  });

  describe("diagnosi malformate e retrocompatibilità", () => {
    it("normalizza diagnosi con campi mancanti applicando fallback", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "critico",
          titolo: "Marciume",
          cosaVedo: "Radici scure",
          cosaSignifica: "Eccesso d'acqua",
          // cosaFare mancante
          cosaAspettarsi: "Recupero lento",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(1);
      const diagnosi = risultato.diagnosi![0] as { cosaFare: string };
      expect(diagnosi.cosaFare).toBe("Consulta un esperto per maggiori dettagli");
    });

    it("reclassifica diagnosi con categoria non valida ad attenzione", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "sconosciuta",
          titolo: "Qualcosa",
          cosaVedo: "Qualcosa",
          cosaSignifica: "Qualcosa",
          cosaFare: "Qualcosa",
          cosaAspettarsi: "Qualcosa",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(1);
      expect(risultato.diagnosi![0].categoria).toBe("attenzione");
    });

    it("restituisce undefined per array diagnosi vuoto", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toBeUndefined();
    });

    it("restituisce undefined se diagnosi non è un array", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = "non è un array";

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toBeUndefined();
    });

    it("applica fallback per 3 campi mancanti nella diagnosi dettagliata", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "critico",
          titolo: "Problema grave",
          cosaFare: "Intervieni subito",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(1);
      const diagnosi = risultato.diagnosi![0] as import("@/types/analysis").DiagnosiDettagliata;
      expect(diagnosi.cosaVedo).toBe("Osservazione visiva non disponibile");
      expect(diagnosi.cosaSignifica).toBe("Significato non disponibile");
      expect(diagnosi.cosaFare).toBe("Intervieni subito");
      expect(diagnosi.cosaAspettarsi).toBe("Monitorare l'evoluzione nel tempo");
    });

    it("reclassifica categoria 'warning' ad 'attenzione'", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "warning",
          titolo: "Foglie secche",
          cosaVedo: "Punte secche",
          cosaSignifica: "Aria troppo secca",
          cosaFare: "Aumentare umidità",
          cosaAspettarsi: "Miglioramento graduale",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(1);
      expect(risultato.diagnosi![0].categoria).toBe("attenzione");
    });

    it("reclassifica ottimizzazione con categoria invalida a 'ottimizzazione'", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "suggerimento",
          titolo: "Concimazione",
          descrizione: "Aggiungi fertilizzante in primavera",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(1);
      expect(risultato.diagnosi![0].categoria).toBe("ottimizzazione");
    });

    it("scarta elementi non-oggetto nell'array diagnosi", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        42,
        "stringa",
        null,
        {
          categoria: "critico",
          titolo: "Unica diagnosi valida",
          cosaVedo: "Test",
          cosaSignifica: "Test",
          cosaFare: "Test",
          cosaAspettarsi: "Test",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(1);
      expect(risultato.diagnosi![0].titolo).toBe("Unica diagnosi valida");
    });

    it("i campi legacy restano popolati anche con diagnosi presente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.diagnosi = [
        {
          categoria: "critico",
          titolo: "Problema",
          cosaVedo: "Sintomo",
          cosaSignifica: "Causa",
          cosaFare: "Azione",
          cosaAspettarsi: "Risultato",
        },
      ];

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.diagnosi).toHaveLength(1);
      expect(risultato.consigliCura).toHaveLength(3);
      expect(risultato.statoSalute).toBe("fair");
      expect(risultato.descrizioneSalute).toContain("segni di sofferenza");
    });
  });

  describe("guida annaffiatura accessibile", () => {
    it("restituisce i dati invariati quando guidaAnnaffiaturaAccessibile è completo e valido", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaAnnaffiaturaAccessibile = {
        frequenzaGiorni: "7-10",
        metodoVerifica: "Infila il dito nel terriccio fino alla seconda nocca",
        segnaliTroppaAcqua: "foglie gialle e molli, radici scure",
        segnaliPocaAcqua: "foglie che si accartocciano, terreno compatto",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaAnnaffiaturaAccessibile).toBeDefined();
      expect(risultato.guidaAnnaffiaturaAccessibile!.frequenzaGiorni).toBe("7-10");
      expect(risultato.guidaAnnaffiaturaAccessibile!.metodoVerifica).toBe(
        "Infila il dito nel terriccio fino alla seconda nocca",
      );
      expect(risultato.guidaAnnaffiaturaAccessibile!.segnaliTroppaAcqua).toBe("foglie gialle e molli, radici scure");
      expect(risultato.guidaAnnaffiaturaAccessibile!.segnaliPocaAcqua).toBe("foglie che si accartocciano, terreno compatto");
    });

    it("usa il fallback per segnaliTroppaAcqua quando è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaAnnaffiaturaAccessibile = {
        frequenzaGiorni: "7",
        metodoVerifica: "Controlla il terreno",
        segnaliPocaAcqua: "foglie appassite",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaAnnaffiaturaAccessibile!.segnaliTroppaAcqua).toBe(
        "foglie gialle e molli, terreno sempre bagnato",
      );
    });

    it("usa il fallback per segnaliPocaAcqua quando è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaAnnaffiaturaAccessibile = {
        frequenzaGiorni: "7",
        metodoVerifica: "Controlla il terreno",
        segnaliTroppaAcqua: "foglie gialle",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaAnnaffiaturaAccessibile!.segnaliPocaAcqua).toBe(
        "foglie che avvizziscono o si accartocciano, terreno molto secco",
      );
    });

    it("usa '3-5' come fallback quando frequenzaGiorni è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaAnnaffiaturaAccessibile = {
        metodoVerifica: "Controlla il peso del vaso",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaAnnaffiaturaAccessibile).toBeDefined();
      expect(risultato.guidaAnnaffiaturaAccessibile!.frequenzaGiorni).toBe("3-5");
    });

    it("usa '3-5' come fallback quando frequenzaGiorni è una stringa vuota", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaAnnaffiaturaAccessibile = {
        frequenzaGiorni: "   ",
        metodoVerifica: "Controlla il peso del vaso",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaAnnaffiaturaAccessibile).toBeDefined();
      expect(risultato.guidaAnnaffiaturaAccessibile!.frequenzaGiorni).toBe("3-5");
    });

    it("usa la stringa generica come fallback quando metodoVerifica è vuoto", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaAnnaffiaturaAccessibile = {
        frequenzaGiorni: "5-7",
        metodoVerifica: "",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaAnnaffiaturaAccessibile).toBeDefined();
      expect(risultato.guidaAnnaffiaturaAccessibile!.metodoVerifica).toBe(
        "Osserva il terreno e il comportamento delle foglie prima di annaffiare",
      );
    });

    it("usa la stringa generica come fallback quando metodoVerifica è solo spazi bianchi", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaAnnaffiaturaAccessibile = {
        frequenzaGiorni: "5-7",
        metodoVerifica: "   ",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaAnnaffiaturaAccessibile).toBeDefined();
      expect(risultato.guidaAnnaffiaturaAccessibile!.metodoVerifica).toBe(
        "Osserva il terreno e il comportamento delle foglie prima di annaffiare",
      );
    });

    it("restituisce undefined e non interrompe il parsing quando guidaAnnaffiaturaAccessibile è assente", () => {
      const risposta = creaRispostaValida();

      const risultato = parseRispostaGemini(risposta);

      expect(risultato.guidaAnnaffiaturaAccessibile).toBeUndefined();
      expect(risultato.nomeComune).toBe("Pothos dorato");
    });
  });

  describe("guida luce accessibile", () => {
    it("restituisce i dati invariati quando guidaLuceAccessibile è completo e valido", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaLuceAccessibile = {
        oreEsposizioneGiornaliere: "6-8 ore",
        orientamentoFinestra: "finestra a sud",
        segniLuceTroppa: "foglie con macchie brune o scolorite",
        segniLucePoca: "steli lunghi e sottili, foglie piccole",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaLuceAccessibile).toBeDefined();
      expect(risultato.guidaLuceAccessibile!.oreEsposizioneGiornaliere).toBe("6-8 ore");
      expect(risultato.guidaLuceAccessibile!.orientamentoFinestra).toBe("finestra a sud");
      expect(risultato.guidaLuceAccessibile!.segniLuceTroppa).toBe("foglie con macchie brune o scolorite");
      expect(risultato.guidaLuceAccessibile!.segniLucePoca).toBe("steli lunghi e sottili, foglie piccole");
    });

    it("usa '2-4 ore di luce indiretta' come fallback quando oreEsposizioneGiornaliere è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaLuceAccessibile = {
        orientamentoFinestra: "finestra a est",
        segniLuceTroppa: "foglie bruciate",
        segniLucePoca: "foglie pallide",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaLuceAccessibile).toBeDefined();
      expect(risultato.guidaLuceAccessibile!.oreEsposizioneGiornaliere).toBe("2-4 ore di luce indiretta");
    });

    it("usa '2-4 ore di luce indiretta' come fallback quando oreEsposizioneGiornaliere è una stringa vuota", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaLuceAccessibile = {
        oreEsposizioneGiornaliere: "   ",
        orientamentoFinestra: "finestra a nord",
        segniLuceTroppa: "foglie bruciate",
        segniLucePoca: "foglie pallide",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaLuceAccessibile).toBeDefined();
      expect(risultato.guidaLuceAccessibile!.oreEsposizioneGiornaliere).toBe("2-4 ore di luce indiretta");
    });

    it("usa il fallback generico quando orientamentoFinestra è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaLuceAccessibile = {
        oreEsposizioneGiornaliere: "5 ore",
        segniLuceTroppa: "foglie bruciate",
        segniLucePoca: "foglie pallide",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaLuceAccessibile).toBeDefined();
      expect(risultato.guidaLuceAccessibile!.orientamentoFinestra).toBe("finestra a est o nord");
    });

    it("usa il fallback generico quando segniLuceTroppa è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaLuceAccessibile = {
        oreEsposizioneGiornaliere: "5 ore",
        orientamentoFinestra: "finestra a est",
        segniLucePoca: "foglie pallide",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaLuceAccessibile).toBeDefined();
      expect(risultato.guidaLuceAccessibile!.segniLuceTroppa).toBe("foglie che ingialliscono o bruciano");
    });

    it("usa il fallback generico quando segniLucePoca è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaLuceAccessibile = {
        oreEsposizioneGiornaliere: "5 ore",
        orientamentoFinestra: "finestra a est",
        segniLuceTroppa: "foglie bruciate",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaLuceAccessibile).toBeDefined();
      expect(risultato.guidaLuceAccessibile!.segniLucePoca).toBe("foglie che impallidiscono o steli che si allungano");
    });

    it("restituisce undefined e non interrompe il parsing quando guidaLuceAccessibile è assente", () => {
      const risposta = creaRispostaValida();

      const risultato = parseRispostaGemini(risposta);

      expect(risultato.guidaLuceAccessibile).toBeUndefined();
      expect(risultato.nomeComune).toBe("Pothos dorato");
    });

    it("restituisce undefined quando guidaLuceAccessibile è null", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaLuceAccessibile = null;

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaLuceAccessibile).toBeUndefined();
    });

    it("restituisce undefined quando guidaLuceAccessibile è una stringa anziché un oggetto", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaLuceAccessibile = "non è un oggetto";

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaLuceAccessibile).toBeUndefined();
    });

    it("usa tutti i fallback quando guidaLuceAccessibile è un oggetto vuoto", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaLuceAccessibile = {};

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaLuceAccessibile).toBeDefined();
      expect(risultato.guidaLuceAccessibile!.oreEsposizioneGiornaliere).toBe("2-4 ore di luce indiretta");
      expect(risultato.guidaLuceAccessibile!.orientamentoFinestra).toBe("finestra a est o nord");
      expect(risultato.guidaLuceAccessibile!.segniLuceTroppa).toBe("foglie che ingialliscono o bruciano");
      expect(risultato.guidaLuceAccessibile!.segniLucePoca).toBe("foglie che impallidiscono o steli che si allungano");
    });
  });

  describe("guida umidità accessibile", () => {
    it("restituisce i dati invariati quando guidaUmiditaAccessibile è completo e valido", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaUmiditaAccessibile = {
        metodoPratico: "Spruzza le foglie ogni mattina con uno spruzzino",
        livelloPratico: "Come il vapore in un bagno dopo la doccia",
        segnaliAriaSecca: "Punte delle foglie che imbruniscono e si arricciano",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaUmiditaAccessibile).toBeDefined();
      expect(risultato.guidaUmiditaAccessibile!.metodoPratico).toBe("Spruzza le foglie ogni mattina con uno spruzzino");
      expect(risultato.guidaUmiditaAccessibile!.livelloPratico).toBe("Come il vapore in un bagno dopo la doccia");
      expect(risultato.guidaUmiditaAccessibile!.segnaliAriaSecca).toBe("Punte delle foglie che imbruniscono e si arricciano");
    });

    it("usa il fallback quando metodoPratico è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaUmiditaAccessibile = {
        livelloPratico: "Umidità di un bagno",
        segnaliAriaSecca: "Punte secche",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaUmiditaAccessibile).toBeDefined();
      expect(risultato.guidaUmiditaAccessibile!.metodoPratico).toBe("Spruzza le foglie con acqua a temperatura ambiente ogni 2-3 giorni");
    });

    it("usa il fallback quando livelloPratico è una stringa vuota", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaUmiditaAccessibile = {
        metodoPratico: "Spruzza le foglie",
        livelloPratico: "   ",
        segnaliAriaSecca: "Punte secche",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaUmiditaAccessibile).toBeDefined();
      expect(risultato.guidaUmiditaAccessibile!.livelloPratico).toBe("Simile all'umidità di un bagno dopo la doccia");
    });

    it("usa il fallback quando segnaliAriaSecca è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaUmiditaAccessibile = {
        metodoPratico: "Spruzza le foglie",
        livelloPratico: "Umidità di un bagno",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaUmiditaAccessibile).toBeDefined();
      expect(risultato.guidaUmiditaAccessibile!.segnaliAriaSecca).toBe("Punte delle foglie che diventano marroni e secche");
    });

    it("usa tutti i fallback quando guidaUmiditaAccessibile è un oggetto vuoto", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaUmiditaAccessibile = {};

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaUmiditaAccessibile).toBeDefined();
      expect(risultato.guidaUmiditaAccessibile!.metodoPratico).toBe("Spruzza le foglie con acqua a temperatura ambiente ogni 2-3 giorni");
      expect(risultato.guidaUmiditaAccessibile!.livelloPratico).toBe("Simile all'umidità di un bagno dopo la doccia");
      expect(risultato.guidaUmiditaAccessibile!.segnaliAriaSecca).toBe("Punte delle foglie che diventano marroni e secche");
    });

    it("restituisce undefined e non interrompe il parsing quando guidaUmiditaAccessibile è assente", () => {
      const risposta = creaRispostaValida();

      const risultato = parseRispostaGemini(risposta);

      expect(risultato.guidaUmiditaAccessibile).toBeUndefined();
      expect(risultato.nomeComune).toBe("Pothos dorato");
    });

    it("restituisce undefined quando guidaUmiditaAccessibile è null", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaUmiditaAccessibile = null;

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaUmiditaAccessibile).toBeUndefined();
    });

    it("restituisce undefined quando guidaUmiditaAccessibile è una stringa anziché un oggetto", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaUmiditaAccessibile = "non è un oggetto";

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaUmiditaAccessibile).toBeUndefined();
    });
  });

  describe("guida temperatura accessibile", () => {
    it("restituisce i dati invariati quando guidaTemperaturaAccessibile è completo e valido", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaTemperaturaAccessibile = {
        rangeConRiferimentoDomestico: "tra 18°C e 24°C — la temperatura tipica di un soggiorno",
        situazioniDaEvitare: ["non vicino a finestre aperte in inverno", "non a contatto con termosifoni accesi"],
        segniStressDaTemperatura: "foglie che cadono improvvisamente o margini che imbruniscono",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaTemperaturaAccessibile).toBeDefined();
      expect(risultato.guidaTemperaturaAccessibile!.rangeConRiferimentoDomestico).toBe(
        "tra 18°C e 24°C — la temperatura tipica di un soggiorno",
      );
      expect(risultato.guidaTemperaturaAccessibile!.situazioniDaEvitare).toEqual([
        "non vicino a finestre aperte in inverno",
        "non a contatto con termosifoni accesi",
      ]);
      expect(risultato.guidaTemperaturaAccessibile!.segniStressDaTemperatura).toBe(
        "foglie che cadono improvvisamente o margini che imbruniscono",
      );
    });

    it("usa il fallback quando rangeConRiferimentoDomestico è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaTemperaturaAccessibile = {
        situazioniDaEvitare: ["non vicino a porte esterne", "non sopra un termosifone"],
        segniStressDaTemperatura: "foglie gialle improvvise",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaTemperaturaAccessibile).toBeDefined();
      expect(risultato.guidaTemperaturaAccessibile!.rangeConRiferimentoDomestico).toBe(
        "tra 15°C e 25°C — una temperatura confortevole per la maggior parte delle piante da appartamento",
      );
    });

    it("usa il fallback quando segniStressDaTemperatura è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaTemperaturaAccessibile = {
        rangeConRiferimentoDomestico: "tra 16°C e 22°C",
        situazioniDaEvitare: ["non vicino a porte esterne", "non sopra un termosifone"],
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaTemperaturaAccessibile).toBeDefined();
      expect(risultato.guidaTemperaturaAccessibile!.segniStressDaTemperatura).toBe(
        "foglie che cadono o ingialliscono improvvisamente, specialmente in inverno o in estate",
      );
    });

    it("completa situazioniDaEvitare con i fallback generici quando l'array ha meno di 2 voci valide", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaTemperaturaAccessibile = {
        rangeConRiferimentoDomestico: "tra 16°C e 22°C",
        situazioniDaEvitare: ["non vicino alla porta del balcone"],
        segniStressDaTemperatura: "foglie gialle",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaTemperaturaAccessibile).toBeDefined();
      expect(risultato.guidaTemperaturaAccessibile!.situazioniDaEvitare).toHaveLength(2);
      expect(risultato.guidaTemperaturaAccessibile!.situazioniDaEvitare[0]).toBe("non vicino alla porta del balcone");
      expect(risultato.guidaTemperaturaAccessibile!.situazioniDaEvitare[1]).toBe("non vicino a porte esterne in inverno");
    });

    it("converte situazioniDaEvitare da stringa singola ad array aggiungendo un fallback come secondo elemento", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaTemperaturaAccessibile = {
        rangeConRiferimentoDomestico: "tra 16°C e 22°C",
        situazioniDaEvitare: "non vicino alla finestra in inverno",
        segniStressDaTemperatura: "foglie gialle",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaTemperaturaAccessibile).toBeDefined();
      expect(risultato.guidaTemperaturaAccessibile!.situazioniDaEvitare).toHaveLength(2);
      expect(risultato.guidaTemperaturaAccessibile!.situazioniDaEvitare[0]).toBe("non vicino alla finestra in inverno");
      expect(risultato.guidaTemperaturaAccessibile!.situazioniDaEvitare[1]).toBe("non sopra o vicino a un termosifone");
    });

    it("usa entrambi i fallback generici quando situazioniDaEvitare è assente", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaTemperaturaAccessibile = {
        rangeConRiferimentoDomestico: "tra 16°C e 22°C",
        segniStressDaTemperatura: "foglie gialle",
      };

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaTemperaturaAccessibile).toBeDefined();
      expect(risultato.guidaTemperaturaAccessibile!.situazioniDaEvitare).toEqual([
        "non vicino a porte esterne in inverno",
        "non sopra o vicino a un termosifone",
      ]);
    });

    it("usa tutti i fallback quando guidaTemperaturaAccessibile è un oggetto vuoto", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaTemperaturaAccessibile = {};

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaTemperaturaAccessibile).toBeDefined();
      expect(risultato.guidaTemperaturaAccessibile!.rangeConRiferimentoDomestico).toBe(
        "tra 15°C e 25°C — una temperatura confortevole per la maggior parte delle piante da appartamento",
      );
      expect(risultato.guidaTemperaturaAccessibile!.situazioniDaEvitare).toEqual([
        "non vicino a porte esterne in inverno",
        "non sopra o vicino a un termosifone",
      ]);
      expect(risultato.guidaTemperaturaAccessibile!.segniStressDaTemperatura).toBe(
        "foglie che cadono o ingialliscono improvvisamente, specialmente in inverno o in estate",
      );
    });

    it("restituisce undefined e non interrompe il parsing quando guidaTemperaturaAccessibile è assente", () => {
      const risposta = creaRispostaValida();

      const risultato = parseRispostaGemini(risposta);

      expect(risultato.guidaTemperaturaAccessibile).toBeUndefined();
      expect(risultato.nomeComune).toBe("Pothos dorato");
    });

    it("restituisce undefined quando guidaTemperaturaAccessibile è null", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaTemperaturaAccessibile = null;

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaTemperaturaAccessibile).toBeUndefined();
    });

    it("restituisce undefined quando guidaTemperaturaAccessibile è una stringa anziché un oggetto", () => {
      const dati = JSON.parse(creaRispostaValida());
      dati.guidaTemperaturaAccessibile = "non è un oggetto";

      const risultato = parseRispostaGemini(JSON.stringify(dati));

      expect(risultato.guidaTemperaturaAccessibile).toBeUndefined();
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
