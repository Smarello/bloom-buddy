import type { PlantAnalysis, HealthStatus, CareInfo, RisultatoDiagnosi, DiagnosiDettagliata, Ottimizzazione, GuidaAnnaffiaturaAccessibile, GuidaLuceAccessibile, GuidaUmiditaAccessibile, GuidaTemperaturaAccessibile } from "@/types/analysis";

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

function normalizzaGuidaAnnaffiaturaAccessibile(raw: unknown): GuidaAnnaffiaturaAccessibile | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const obj = raw as Record<string, unknown>;

  const frequenzaGiorni = stringaConFallback(obj.frequenzaGiorni, "3-5");
  const metodoVerifica = stringaConFallback(obj.metodoVerifica, "Osserva il terreno e il comportamento delle foglie prima di annaffiare");
  const segnaliTroppaAcqua = stringaConFallback(obj.segnaliTroppaAcqua, "foglie gialle e molli, terreno sempre bagnato");
  const segnaliPocaAcqua = stringaConFallback(obj.segnaliPocaAcqua, "foglie che avvizziscono o si accartocciano, terreno molto secco");

  return { frequenzaGiorni, metodoVerifica, segnaliTroppaAcqua, segnaliPocaAcqua };
}

function normalizzaGuidaLuceAccessibile(raw: unknown): GuidaLuceAccessibile | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const obj = raw as Record<string, unknown>;

  const oreEsposizioneGiornaliere = stringaConFallback(obj.oreEsposizioneGiornaliere, "2-4 ore di luce indiretta");
  const orientamentoFinestra = stringaConFallback(obj.orientamentoFinestra, "finestra a est o nord");
  const segniLuceTroppa = stringaConFallback(obj.segniLuceTroppa, "foglie che ingialliscono o bruciano");
  const segniLucePoca = stringaConFallback(obj.segniLucePoca, "foglie che impallidiscono o steli che si allungano");

  return { oreEsposizioneGiornaliere, orientamentoFinestra, segniLuceTroppa, segniLucePoca };
}

function normalizzaGuidaUmiditaAccessibile(raw: unknown): GuidaUmiditaAccessibile | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const obj = raw as Record<string, unknown>;

  const metodoPratico = stringaConFallback(obj.metodoPratico, "Spruzza le foglie con acqua a temperatura ambiente ogni 2-3 giorni");
  const livelloPratico = stringaConFallback(obj.livelloPratico, "Simile all'umidità di un bagno dopo la doccia");
  const segnaliAriaSecca = stringaConFallback(obj.segnaliAriaSecca, "Punte delle foglie che diventano marroni e secche");

  return { metodoPratico, livelloPratico, segnaliAriaSecca };
}

const SITUAZIONI_DA_EVITARE_FALLBACK = [
  "non vicino a porte esterne in inverno",
  "non sopra o vicino a un termosifone",
];

function normalizzaGuidaTemperaturaAccessibile(raw: unknown): GuidaTemperaturaAccessibile | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const obj = raw as Record<string, unknown>;

  const rangeConRiferimentoDomestico = stringaConFallback(
    obj.rangeConRiferimentoDomestico,
    "tra 15°C e 25°C — una temperatura confortevole per la maggior parte delle piante da appartamento",
  );

  let situazioniDaEvitare: string[];
  if (Array.isArray(obj.situazioniDaEvitare)) {
    const voci = obj.situazioniDaEvitare.filter((v): v is string => typeof v === "string" && v.trim() !== "");
    situazioniDaEvitare = voci.length >= 2 ? voci : [...voci, ...SITUAZIONI_DA_EVITARE_FALLBACK].slice(0, 2);
  } else if (typeof obj.situazioniDaEvitare === "string" && obj.situazioniDaEvitare.trim() !== "") {
    situazioniDaEvitare = [obj.situazioniDaEvitare, SITUAZIONI_DA_EVITARE_FALLBACK[1]];
  } else {
    situazioniDaEvitare = SITUAZIONI_DA_EVITARE_FALLBACK;
  }

  const segniStressDaTemperatura = stringaConFallback(
    obj.segniStressDaTemperatura,
    "foglie che cadono o ingialliscono improvvisamente, specialmente in inverno o in estate",
  );

  return { rangeConRiferimentoDomestico, situazioniDaEvitare, segniStressDaTemperatura };
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

  // Validazione guidaAnnaffiaturaAccessibile
  const guidaAnnaffiaturaAccessibile = normalizzaGuidaAnnaffiaturaAccessibile(dati.guidaAnnaffiaturaAccessibile);

  // Validazione guidaLuceAccessibile
  const guidaLuceAccessibile = normalizzaGuidaLuceAccessibile(dati.guidaLuceAccessibile);

  // Validazione guidaUmiditaAccessibile
  const guidaUmiditaAccessibile = normalizzaGuidaUmiditaAccessibile(dati.guidaUmiditaAccessibile);

  // Validazione guidaTemperaturaAccessibile
  const guidaTemperaturaAccessibile = normalizzaGuidaTemperaturaAccessibile(dati.guidaTemperaturaAccessibile);

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
    ...(guidaAnnaffiaturaAccessibile && { guidaAnnaffiaturaAccessibile }),
    ...(guidaLuceAccessibile && { guidaLuceAccessibile }),
    ...(guidaUmiditaAccessibile && { guidaUmiditaAccessibile }),
    ...(guidaTemperaturaAccessibile && { guidaTemperaturaAccessibile }),
  };
}
