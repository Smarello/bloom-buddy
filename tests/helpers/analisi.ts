import type { PlantAnalysis } from "@/types/analysis";

export function creaAnalisiTest(override: Partial<PlantAnalysis> = {}): PlantAnalysis {
  return {
    nomeComune: "Pothos dorato",
    nomeScientifico: "Epipremnum aureum",
    descrizione: "Una pianta tropicale molto resistente.",
    livelloConfidenza: 0.92,
    statoSalute: "good",
    descrizioneSalute: "La pianta è in buone condizioni.",
    consigliCura: [
      {
        titolo: "Annaffia regolarmente",
        descrizione: "Ogni 7-10 giorni.",
        priorita: "media",
      },
    ],
    informazioniGenerali: {
      annaffiatura: "Ogni 7-10 giorni",
      luce: "Luce indiretta brillante",
      temperatura: "15-30 °C",
      umidita: "Media (40-60%)",
    },
    informazioniRapide: {
      annaffiatura: "Moderata",
      luce: "Indiretta",
      temperatura: "18-25 °C",
      umidita: "Media",
    },
    ...override,
  };
}
