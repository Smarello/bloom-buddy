import type { PlantAnalysis, HealthStatus } from "@/types/analysis";

export class ErroreAnalisi extends Error {
  constructor(
    message: string,
    public readonly tipo: "pianta-non-riconosciuta" | "confidenza-bassa" | "risposta-malformata" | "errore-api",
  ) {
    super(message);
    this.name = "ErroreAnalisi";
  }
}

const STATI_SALUTE_VALIDI: HealthStatus[] = ["excellent", "good", "fair", "poor"];
const PRIORITA_VALIDE = ["alta", "media", "bassa"] as const;
const SOGLIA_CONFIDENZA_MINIMA = 0.4;

function eStatoSaluteValido(valore: unknown): valore is HealthStatus {
  return typeof valore === "string" && STATI_SALUTE_VALIDI.includes(valore as HealthStatus);
}

function ePrioritaValida(valore: unknown): valore is "alta" | "media" | "bassa" {
  return typeof valore === "string" && PRIORITA_VALIDE.includes(valore as "alta" | "media" | "bassa");
}

export function parseRispostaGemini(testoRisposta: string): PlantAnalysis {
  // Pulizia del testo: rimuove eventuali backtick o markdown che Gemini potrebbe aggiungere
  const testoPulito = testoRisposta
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let datiGrezzi: unknown;

  try {
    datiGrezzi = JSON.parse(testoPulito);
  } catch {
    throw new ErroreAnalisi(
      "Non è stato possibile elaborare la risposta dell'analisi. Riprova con un'altra foto.",
      "risposta-malformata",
    );
  }

  if (typeof datiGrezzi !== "object" || datiGrezzi === null) {
    throw new ErroreAnalisi(
      "La risposta dell'analisi non è nel formato atteso. Riprova.",
      "risposta-malformata",
    );
  }

  const dati = datiGrezzi as Record<string, unknown>;

  // Validazione nomeComune
  if (typeof dati.nomeComune !== "string" || dati.nomeComune.trim() === "") {
    throw new ErroreAnalisi(
      "Non è stato possibile identificare la pianta. Riprova.",
      "risposta-malformata",
    );
  }

  // Controllo pianta non riconosciuta
  if (
    dati.nomeComune === "Nessuna pianta riconosciuta" ||
    (typeof dati.livelloConfidenza === "number" && dati.livelloConfidenza === 0)
  ) {
    throw new ErroreAnalisi(
      "L'immagine non sembra contenere una pianta. Prova a caricare una foto di una pianta.",
      "pianta-non-riconosciuta",
    );
  }

  // Validazione livelloConfidenza
  const confidenza =
    typeof dati.livelloConfidenza === "number" ? dati.livelloConfidenza : 0;

  if (confidenza < SOGLIA_CONFIDENZA_MINIMA) {
    throw new ErroreAnalisi(
      "Non sono riuscito a identificare la pianta con sufficiente certezza. Prova con una foto più nitida, con buona luce e sfondo semplice.",
      "confidenza-bassa",
    );
  }

  // Validazione nomeScientifico
  const nomeScientifico =
    typeof dati.nomeScientifico === "string" ? dati.nomeScientifico : "";

  // Validazione statoSalute
  const statoSalute: HealthStatus = eStatoSaluteValido(dati.statoSalute)
    ? dati.statoSalute
    : "fair";

  // Validazione descrizioneSalute
  const descrizioneSalute =
    typeof dati.descrizioneSalute === "string" && dati.descrizioneSalute.trim() !== ""
      ? dati.descrizioneSalute
      : "Stato di salute valutato.";

  // Validazione consigliCura
  const consigliGrezzi = Array.isArray(dati.consigliCura) ? dati.consigliCura : [];
  const consigliCura = consigliGrezzi
    .filter(
      (c): c is Record<string, unknown> =>
        typeof c === "object" && c !== null,
    )
    .map((c) => ({
      titolo: typeof c.titolo === "string" ? c.titolo : "Consiglio",
      descrizione: typeof c.descrizione === "string" ? c.descrizione : "",
      priorita: ePrioritaValida(c.priorita) ? c.priorita : ("media" as const),
    }));

  // Validazione informazioniGenerali
  const infoGrezze =
    typeof dati.informazioniGenerali === "object" && dati.informazioniGenerali !== null
      ? (dati.informazioniGenerali as Record<string, unknown>)
      : {};

  const informazioniGenerali = {
    annaffiatura:
      typeof infoGrezze.annaffiatura === "string"
        ? infoGrezze.annaffiatura
        : "Informazione non disponibile.",
    luce:
      typeof infoGrezze.luce === "string"
        ? infoGrezze.luce
        : "Informazione non disponibile.",
    temperatura:
      typeof infoGrezze.temperatura === "string"
        ? infoGrezze.temperatura
        : "Informazione non disponibile.",
    umidita:
      typeof infoGrezze.umidita === "string"
        ? infoGrezze.umidita
        : "Informazione non disponibile.",
  };

  return {
    nomeComune: dati.nomeComune.trim(),
    nomeScientifico,
    livelloConfidenza: confidenza,
    statoSalute,
    descrizioneSalute,
    consigliCura,
    informazioniGenerali,
  };
}
