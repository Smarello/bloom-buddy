import type { PlantAnalysis } from "@/types/analysis";

/**
 * Crea un oggetto PlantAnalysis di test con valori predefiniti per un Pothos dorato.
 * Accetta un override parziale per personalizzare singoli campi,
 * oppure un valore diretto di `statoSalute` per retro-compatibilità.
 */
export function creaAnalisiTest(
  statoSaluteOOverride: PlantAnalysis["statoSalute"] | Partial<PlantAnalysis> = "fair",
): PlantAnalysis {
  const override: Partial<PlantAnalysis> =
    typeof statoSaluteOOverride === "string"
      ? { statoSalute: statoSaluteOOverride }
      : statoSaluteOOverride;

  return {
    nomeComune: "Pothos dorato",
    nomeScientifico: "Epipremnum aureum",
    descrizione: "Pianta tropicale rampicante molto resistente e adattabile.",
    livelloConfidenza: 0.92,
    statoSalute: "fair",
    descrizioneSalute: "La pianta mostra alcuni segni di sofferenza.",
    consigliCura: [
      {
        titolo: "Riduci l'annaffiatura",
        descrizione: "Aspetta che il terriccio sia asciutto.",
        priorita: "alta",
      },
      {
        titolo: "Sposta verso più luce",
        descrizione: "Posizione vicino a una finestra.",
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

/** URL finto per le anteprime immagine nei test */
export const URL_ANTEPRIMA_FINTO = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
