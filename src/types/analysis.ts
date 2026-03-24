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
}
