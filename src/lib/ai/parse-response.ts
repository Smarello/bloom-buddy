import type { PlantAnalysis, HealthStatus, CareInfo, RisultatoDiagnosi, DiagnosiDettagliata, Ottimizzazione } from "@/types/analysis";

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
const CATEGORIE_DIAGNOSI_VALIDE = ["critico", "attenzione"] as const;
const CATEGORIE_OTTIMIZZAZIONE_VALIDE = ["ottimizzazione"] as const;

const FALLBACK_DIAGNOSI_DETTAGLIATA = {
  cosaVedo: "Osservazione visiva non disponibile",
  cosaSignifica: "Significato non disponibile",
  cosaFare: "Consulta un esperto per maggiori dettagli",
  cosaAspettarsi: "Monitorare l'evoluzione nel tempo",
} as const;

function stringaConFallback(valore: unknown, fallback: string): string {
  return typeof valore === "string" && valore.trim() !== "" ? valore.trim() : fallback;
}

function normalizzaDiagnosiDettagliata(obj: Record<string, unknown>): DiagnosiDettagliata | null {
  const titolo = stringaConFallback(obj.titolo, "");
  if (!titolo) return null;

  const categoriaGrezza = typeof obj.categoria === "string" ? obj.categoria : "";
  const categoria = CATEGORIE_DIAGNOSI_VALIDE.includes(categoriaGrezza as "critico" | "attenzione")
    ? (categoriaGrezza as "critico" | "attenzione")
    : "attenzione";

  return {
    categoria,
    titolo,
    cosaVedo: stringaConFallback(obj.cosaVedo, FALLBACK_DIAGNOSI_DETTAGLIATA.cosaVedo),
    cosaSignifica: stringaConFallback(obj.cosaSignifica, FALLBACK_DIAGNOSI_DETTAGLIATA.cosaSignifica),
    cosaFare: stringaConFallback(obj.cosaFare, FALLBACK_DIAGNOSI_DETTAGLIATA.cosaFare),
    cosaAspettarsi: stringaConFallback(obj.cosaAspettarsi, FALLBACK_DIAGNOSI_DETTAGLIATA.cosaAspettarsi),
  };
}

function normalizzaOttimizzazione(obj: Record<string, unknown>): Ottimizzazione | null {
  const titolo = typeof obj.titolo === "string" && obj.titolo.trim() !== "" ? obj.titolo.trim() : null;
  const descrizione = typeof obj.descrizione === "string" && obj.descrizione.trim() !== "" ? obj.descrizione.trim() : null;
  if (!titolo || !descrizione) return null;

  const categoriaGrezza = typeof obj.categoria === "string" ? obj.categoria : "";
  const categoria = CATEGORIE_OTTIMIZZAZIONE_VALIDE.includes(categoriaGrezza as "ottimizzazione")
    ? (categoriaGrezza as "ottimizzazione")
    : "ottimizzazione";

  return { categoria, titolo, descrizione };
}

function parseDiagnosi(datiGrezzi: unknown[]): RisultatoDiagnosi[] {
  const risultati: RisultatoDiagnosi[] = [];

  for (const item of datiGrezzi) {
    if (typeof item !== "object" || item === null) continue;
    const obj = item as Record<string, unknown>;

    const haStrutturaOttimizzazione = typeof obj.descrizione === "string" && !("cosaVedo" in obj);
    const haStrutturaDiagnosi = "cosaVedo" in obj || "cosaSignifica" in obj || "cosaFare" in obj || "cosaAspettarsi" in obj;

    if (obj.categoria === "ottimizzazione" || (haStrutturaOttimizzazione && !haStrutturaDiagnosi)) {
      const ottimizzazione = normalizzaOttimizzazione(obj);
      if (ottimizzazione) risultati.push(ottimizzazione);
    } else {
      const diagnosi = normalizzaDiagnosiDettagliata(obj);
      if (diagnosi) risultati.push(diagnosi);
    }
  }

  return risultati;
}

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

  // Validazione descrizione
  const descrizione =
    typeof dati.descrizione === "string" && dati.descrizione.trim() !== ""
      ? dati.descrizione
      : "";

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

  function estraiCareInfo(raw: unknown, fallback: string): CareInfo {
    const obj =
      typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
    return {
      annaffiatura: typeof obj.annaffiatura === "string" ? obj.annaffiatura : fallback,
      luce: typeof obj.luce === "string" ? obj.luce : fallback,
      temperatura: typeof obj.temperatura === "string" ? obj.temperatura : fallback,
      umidita: typeof obj.umidita === "string" ? obj.umidita : fallback,
    };
  }

  const informazioniGenerali = estraiCareInfo(dati.informazioniGenerali, "Informazione non disponibile.");
  const informazioniRapide = estraiCareInfo(dati.informazioniRapide, "—");

  // Validazione diagnosi
  const diagnosiParsata = Array.isArray(dati.diagnosi)
    ? parseDiagnosi(dati.diagnosi)
    : undefined;
  const diagnosi = diagnosiParsata && diagnosiParsata.length > 0 ? diagnosiParsata : undefined;

  return {
    nomeComune: dati.nomeComune.trim(),
    nomeScientifico,
    descrizione,
    livelloConfidenza: confidenza,
    statoSalute,
    descrizioneSalute,
    consigliCura,
    informazioniGenerali,
    informazioniRapide,
    ...(diagnosi && { diagnosi }),
  };
}
