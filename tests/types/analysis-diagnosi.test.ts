import { describe, it, expect } from "vitest";
import type {
  DiagnosiDettagliata,
  Ottimizzazione,
  RisultatoDiagnosi,
  PlantAnalysis,
  CareTip,
  HealthStatus,
  CareInfo,
} from "@/types/analysis";

describe("RisultatoDiagnosi - union type", () => {
  it("accetta DiagnosiDettagliata con categoria 'critico'", () => {
    const diagnosi: RisultatoDiagnosi = {
      categoria: "critico",
      titolo: "Marciume radicale",
      cosaVedo: "Radici scure e molli",
      cosaSignifica: "Eccesso di acqua prolungato",
      cosaFare: "Ridurre irrigazione e rinvasare",
      cosaAspettarsi: "Miglioramento in 2-3 settimane",
    };

    expect(diagnosi.categoria).toBe("critico");
  });

  it("accetta DiagnosiDettagliata con categoria 'attenzione'", () => {
    const diagnosi: RisultatoDiagnosi = {
      categoria: "attenzione",
      titolo: "Foglie gialle",
      cosaVedo: "Ingiallimento fogliare",
      cosaSignifica: "Possibile carenza di ferro",
      cosaFare: "Aggiungere fertilizzante specifico",
      cosaAspettarsi: "Nuove foglie verdi in 1-2 settimane",
    };

    expect(diagnosi.categoria).toBe("attenzione");
  });

  it("accetta Ottimizzazione con categoria 'ottimizzazione'", () => {
    const ottimizzazione: RisultatoDiagnosi = {
      categoria: "ottimizzazione",
      titolo: "Posizione ideale",
      descrizione: "Spostare vicino a finestra esposta a sud",
    };

    expect(ottimizzazione.categoria).toBe("ottimizzazione");
  });
});

describe("Narrowing tramite discriminante 'categoria'", () => {
  function elaboraRisultato(risultato: RisultatoDiagnosi): string {
    switch (risultato.categoria) {
      case "critico":
      case "attenzione":
        return risultato.cosaFare;
      case "ottimizzazione":
        return risultato.descrizione;
      default: {
        const _esaustivo: never = risultato;
        return _esaustivo;
      }
    }
  }

  it("restituisce 'cosaFare' per diagnosi critica", () => {
    const diagnosi: DiagnosiDettagliata = {
      categoria: "critico",
      titolo: "Test",
      cosaVedo: "v",
      cosaSignifica: "s",
      cosaFare: "azione critica",
      cosaAspettarsi: "a",
    };

    expect(elaboraRisultato(diagnosi)).toBe("azione critica");
  });

  it("restituisce 'cosaFare' per diagnosi attenzione", () => {
    const diagnosi: DiagnosiDettagliata = {
      categoria: "attenzione",
      titolo: "Test",
      cosaVedo: "v",
      cosaSignifica: "s",
      cosaFare: "azione attenzione",
      cosaAspettarsi: "a",
    };

    expect(elaboraRisultato(diagnosi)).toBe("azione attenzione");
  });

  it("restituisce 'descrizione' per ottimizzazione", () => {
    const ottimizzazione: Ottimizzazione = {
      categoria: "ottimizzazione",
      titolo: "Test",
      descrizione: "suggerimento miglioramento",
    };

    expect(elaboraRisultato(ottimizzazione)).toBe("suggerimento miglioramento");
  });
});

describe("Tipi esistenti non alterati (compile-time check con satisfies)", () => {
  it("PlantAnalysis mantiene la struttura attesa", () => {
    const analisi = {
      nomeComune: "Pothos",
      nomeScientifico: "Epipremnum aureum",
      descrizione: "Pianta tropicale rampicante",
      livelloConfidenza: 0.95,
      statoSalute: "good" as const,
      descrizioneSalute: "La pianta appare in buona salute",
      consigliCura: [],
      informazioniGenerali: {
        annaffiatura: "Moderata",
        luce: "Indiretta",
        temperatura: "18-25°C",
        umidita: "Media",
      },
      informazioniRapide: {
        annaffiatura: "Ogni 7 giorni",
        luce: "Luce filtrata",
        temperatura: "20°C",
        umidita: "50%",
      },
    } satisfies PlantAnalysis;

    expect(analisi.nomeComune).toBe("Pothos");
  });

  it("CareTip mantiene la struttura attesa", () => {
    const consiglio = {
      titolo: "Irrigazione",
      descrizione: "Annaffiare quando il terreno è asciutto",
      priorita: "alta" as const,
    } satisfies CareTip;

    expect(consiglio.priorita).toBe("alta");
  });

  it("HealthStatus accetta solo i valori previsti", () => {
    const stati: HealthStatus[] = ["excellent", "good", "fair", "poor"];
    expect(stati).toHaveLength(4);
  });

  it("CareInfo mantiene la struttura attesa", () => {
    const info = {
      annaffiatura: "Regolare",
      luce: "Pieno sole",
      temperatura: "20-30°C",
      umidita: "Alta",
    } satisfies CareInfo;

    expect(info.annaffiatura).toBe("Regolare");
  });
});
