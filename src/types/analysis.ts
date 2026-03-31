export type HealthStatus = "excellent" | "good" | "fair" | "poor";

export interface CareTip {
  titolo: string;
  descrizione: string;
  priorita: "alta" | "media" | "bassa";
}

export interface CareInfo {
  annaffiatura: string;
  luce: string;
  temperatura: string;
  umidita: string;
}

export interface PlantAnalysis {
  nomeComune: string;
  nomeScientifico: string;
  descrizione: string;
  livelloConfidenza: number;
  statoSalute: HealthStatus;
  descrizioneSalute: string;
  consigliCura: CareTip[];
  informazioniGenerali: CareInfo;
  informazioniRapide: CareInfo;
  diagnosi?: RisultatoDiagnosi[];
  guidaAnnaffiaturaAccessibile?: GuidaAnnaffiaturaAccessibile;
  guidaLuceAccessibile?: GuidaLuceAccessibile;
  guidaUmiditaAccessibile?: GuidaUmiditaAccessibile;
  guidaTemperaturaAccessibile?: GuidaTemperaturaAccessibile;
}

export interface DiagnosiDettagliata {
  categoria: "critico" | "attenzione";
  titolo: string;
  cosaVedo: string;
  cosaSignifica: string;
  cosaFare: string;
  cosaAspettarsi: string;
}

export interface Ottimizzazione {
  categoria: "ottimizzazione";
  titolo: string;
  descrizione: string;
}

export type RisultatoDiagnosi = DiagnosiDettagliata | Ottimizzazione;

export interface GuidaAnnaffiaturaAccessibile {
  metodoVerifica: string;
  frequenzaGiorni: string;
  segnaliTroppaAcqua: string;
  segnaliPocaAcqua: string;
}

export interface GuidaLuceAccessibile {
  oreEsposizioneGiornaliere: string;
  orientamentoFinestra: string;
  segniLuceTroppa: string;
  segniLucePoca: string;
}

export interface GuidaUmiditaAccessibile {
  metodoPratico: string;
  livelloPratico: string;
  segnaliAriaSecca: string;
}

export interface GuidaTemperaturaAccessibile {
  rangeConRiferimentoDomestico: string;
  situazioniDaEvitare: string[];
  segniStressDaTemperatura: string;
}
