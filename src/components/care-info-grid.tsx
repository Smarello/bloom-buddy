import type { CareInfo, GuidaAnnaffiaturaAccessibile, GuidaLuceAccessibile, GuidaUmiditaAccessibile, GuidaTemperaturaAccessibile } from "@/types/analysis";
import type React from "react";

interface PropsCareInfoGrid {
  informazioni: CareInfo;
  guidaAnnaffiaturaAccessibile?: GuidaAnnaffiaturaAccessibile;
  guidaLuceAccessibile?: GuidaLuceAccessibile;
  guidaUmiditaAccessibile?: GuidaUmiditaAccessibile;
  guidaTemperaturaAccessibile?: GuidaTemperaturaAccessibile;
}

interface VoceCura {
  chiave: keyof CareInfo;
  etichetta: string;
  gradienteBorder: string;
  gradientiIcona: string;
  icona: React.ReactNode;
}

const VOCI_CURA: VoceCura[] = [
  {
    chiave: "annaffiatura",
    etichetta: "Annaffiatura",
    gradienteBorder: "linear-gradient(90deg, #5b9bd5, #7eb8e8)",
    gradientiIcona: "linear-gradient(145deg, rgba(91, 155, 213, 0.15), rgba(91, 155, 213, 0.05))",
    icona: (
      <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
        <path d="M14 4C10 9 6 13 6 18a8 8 0 0 0 16 0c0-5-4-9-8-14z" stroke="#5b9bd5" strokeWidth="2" fill="none" />
        <path d="M14 4C10 9 6 13 6 18a8 8 0 0 0 16 0c0-5-4-9-8-14z" fill="#5b9bd5" opacity="0.1" />
        <path d="M10 19c1 2.5 3.5 3.5 6 3" stroke="#5b9bd5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    chiave: "luce",
    etichetta: "Luce",
    gradienteBorder: "linear-gradient(90deg, #f5c542, #f7d872)",
    gradientiIcona: "linear-gradient(145deg, rgba(245, 197, 66, 0.15), rgba(245, 197, 66, 0.05))",
    icona: (
      <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
        <circle cx="14" cy="14" r="5" stroke="#f5c542" strokeWidth="2" fill="none" />
        <circle cx="14" cy="14" r="5" fill="#f5c542" opacity="0.1" />
        <path
          d="M14 3v3m0 16v3M4.5 7l2.1 2.1m14.8 9.8l2.1 2.1M3 14h3m16 0h3M4.5 21l2.1-2.1m14.8-9.8l2.1-2.1"
          stroke="#f5c542"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    chiave: "temperatura",
    etichetta: "Temperatura",
    gradienteBorder: "linear-gradient(90deg, #e8875a, #f0a880)",
    gradientiIcona: "linear-gradient(145deg, rgba(232, 135, 90, 0.15), rgba(232, 135, 90, 0.05))",
    icona: (
      <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
        <path d="M16 4v12.8a4.5 4.5 0 1 1-4 0V4a2 2 0 0 1 4 0z" stroke="#e8875a" strokeWidth="2" fill="none" />
        <circle cx="14" cy="20" r="2.5" fill="#e8875a" opacity="0.3" />
        <line x1="14" y1="10" x2="14" y2="17.5" stroke="#e8875a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    chiave: "umidita",
    etichetta: "Umidità",
    gradienteBorder: "linear-gradient(90deg, #7ec8c8, #a0dada)",
    gradientiIcona: "linear-gradient(145deg, rgba(126, 200, 200, 0.15), rgba(126, 200, 200, 0.05))",
    icona: (
      <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
        <path d="M6 10c2-1.5 4 0 6-1.5s4-1.5 6 0" stroke="#7ec8c8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M6 16c2-1.5 4 0 6-1.5s4-1.5 6 0" stroke="#7ec8c8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path
          d="M6 22c2-1.5 4 0 6-1.5s4-1.5 6 0"
          stroke="#7ec8c8"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <circle cx="24" cy="13" r="1.5" fill="#7ec8c8" opacity="0.4" />
      </svg>
    ),
  },
];

interface VoceGuidaLuce {
  icona: React.ReactNode;
  etichetta: string;
  valore: (guida: GuidaLuceAccessibile) => string;
}

const VOCI_GUIDA_LUCE: VoceGuidaLuce[] = [
  {
    icona: (
      <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
        <circle cx="9" cy="9" r="5" stroke="#f5c542" strokeWidth="1.5" fill="none" />
        <path
          d="M9 2v2M9 14v2M3 9H1M17 9h-2M4.5 4.5l1.4 1.4m6.2 6.2l1.4 1.4M4.5 13.5l1.4-1.4m6.2-6.2l1.4-1.4"
          stroke="#f5c542"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    etichetta: "Esposizione: ",
    valore: (g) => g.oreEsposizioneGiornaliere,
  },
  {
    icona: (
      <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
        <rect x="2" y="2" width="14" height="14" rx="2" stroke="#f5c542" strokeWidth="1.5" fill="none" />
        <path d="M9 2v14M2 9h14" stroke="#f5c542" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    etichetta: "Finestra: ",
    valore: (g) => g.orientamentoFinestra,
  },
  {
    icona: (
      <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
        <path d="M9 3l1.5 3.5L14 7.5l-2.5 2.5.5 3.5L9 12l-3 1.5.5-3.5L4 7.5l3.5-1z" stroke="#f5c542" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    etichetta: "Troppa luce: ",
    valore: (g) => g.segniLuceTroppa,
  },
  {
    icona: (
      <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
        <circle cx="9" cy="9" r="4" stroke="#f5c542" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M9 5v2M9 11v2M5 9H3M15 9h-2" stroke="#f5c542" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    etichetta: "Poca luce: ",
    valore: (g) => g.segniLucePoca,
  },
];

interface VoceGuidaUmidita {
  icona: React.ReactNode;
  etichetta: string;
  valore: (guida: GuidaUmiditaAccessibile) => string;
}

const VOCI_GUIDA_UMIDITA: VoceGuidaUmidita[] = [
  {
    icona: (
      <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
        <path d="M9 3C9 3 4 8.5 4 12a5 5 0 0010 0C14 8.5 9 3 9 3z" stroke="#7ec8c8" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M6.5 12.5a2.5 2.5 0 002.5 2" stroke="#7ec8c8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    etichetta: "Segnali di allarme: ",
    valore: (g) => g.segnaliAriaSecca,
  },
  {
    icona: (
      <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
        <path d="M4 10c0-2 1.5-4 5-6 3.5 2 5 4 5 6a5 5 0 01-10 0z" stroke="#7ec8c8" strokeWidth="1.5" fill="none" />
        <path d="M9 7v5M7 10h4" stroke="#7ec8c8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    etichetta: "Come aumentarla: ",
    valore: (g) => g.metodoPratico,
  },
  {
    icona: (
      <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
        <circle cx="9" cy="9" r="6" stroke="#7ec8c8" strokeWidth="1.5" fill="none" />
        <path d="M9 6v3l2 2" stroke="#7ec8c8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    etichetta: "Livello ideale: ",
    valore: (g) => g.livelloPratico,
  },
];

export function CareInfoGrid({ informazioni, guidaAnnaffiaturaAccessibile, guidaLuceAccessibile, guidaUmiditaAccessibile, guidaTemperaturaAccessibile }: PropsCareInfoGrid) {
  return (
    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
      {VOCI_CURA.map(({ chiave, etichetta, gradienteBorder, gradientiIcona, icona }) => (
        <div
          key={chiave}
          className="relative bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded-xl p-6 overflow-hidden transition-all duration-[var(--transition-base)] hover:-translate-y-[3px] hover:shadow-[var(--shadow-lg)]"
        >
          {/* Top border colorato per categoria */}
          <div
            className="absolute top-0 left-6 right-6 h-[3px] rounded-b"
            style={{ background: gradienteBorder }}
            aria-hidden="true"
          />
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: gradientiIcona }}
              aria-hidden="true"
            >
              {icona}
            </div>
            <h4 className="font-[family-name:var(--font-display)] font-bold text-lg text-[var(--color-text-primary)]">
              {etichetta}
            </h4>
          </div>
          {chiave === "annaffiatura" && guidaAnnaffiaturaAccessibile && (
            <div className="flex flex-col gap-2 mb-3">
              {/* Blocco 1: Metodo fisico di verifica */}
              <div className="flex items-start gap-2 rounded-lg px-3 py-2 bg-[rgba(91,155,213,0.08)] border border-[rgba(91,155,213,0.15)]">
                <span aria-hidden="true" className="mt-[1px] shrink-0">
                  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
                    <circle cx="9" cy="9" r="7" stroke="#5b9bd5" strokeWidth="1.5" fill="none" />
                    <path d="M6 9.5l2 2 4-4" stroke="#5b9bd5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
                  <span className="font-semibold text-[var(--color-text-primary)]">Controlla così: </span>
                  {guidaAnnaffiaturaAccessibile.metodoVerifica}
                </p>
              </div>
              {/* Blocco 2: Frequenza in giorni */}
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-[rgba(91,155,213,0.08)] border border-[rgba(91,155,213,0.15)]">
                <span aria-hidden="true" className="shrink-0">
                  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
                    <rect x="2" y="3" width="14" height="13" rx="2" stroke="#5b9bd5" strokeWidth="1.5" fill="none" />
                    <path d="M6 1v3M12 1v3M2 7h14" stroke="#5b9bd5" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="text-xs leading-snug">
                  <strong className="font-bold text-[var(--color-text-primary)]">
                    Controlla ogni {guidaAnnaffiaturaAccessibile.frequenzaGiorni} giorni
                  </strong>
                </p>
              </div>
              {/* Blocco 3: Segnali di troppa acqua */}
              <div className="flex items-start gap-2 rounded-lg px-3 py-2 bg-[rgba(91,155,213,0.08)] border border-[rgba(91,155,213,0.15)]">
                <span aria-hidden="true" className="mt-[1px] shrink-0">
                  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
                    <circle cx="9" cy="9" r="7" stroke="#5b9bd5" strokeWidth="1.5" fill="none" />
                    <path d="M6 6l6 6M12 6l-6 6" stroke="#5b9bd5" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
                  <span className="font-semibold text-[var(--color-text-primary)]">Troppa acqua: </span>
                  {guidaAnnaffiaturaAccessibile.segnaliTroppaAcqua}
                </p>
              </div>
              {/* Blocco 4: Segnali di poca acqua */}
              <div className="flex items-start gap-2 rounded-lg px-3 py-2 bg-[rgba(91,155,213,0.08)] border border-[rgba(91,155,213,0.15)]">
                <span aria-hidden="true" className="mt-[1px] shrink-0">
                  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
                    <path d="M9 3C9 3 4 8.5 4 12a5 5 0 0010 0C14 8.5 9 3 9 3z" stroke="#5b9bd5" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity="0.5" />
                    <path d="M6.5 12.5a2.5 2.5 0 002.5 2" stroke="#5b9bd5" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                  </svg>
                </span>
                <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
                  <span className="font-semibold text-[var(--color-text-primary)]">Poca acqua: </span>
                  {guidaAnnaffiaturaAccessibile.segnaliPocaAcqua}
                </p>
              </div>
            </div>
          )}
          {chiave === "luce" && guidaLuceAccessibile && (
            <div className="flex flex-col gap-2 mb-3">
              {VOCI_GUIDA_LUCE.map(({ icona, etichetta, valore }) => (
                <div key={etichetta} className="flex items-start gap-2 rounded-lg px-3 py-2 bg-[rgba(245,197,66,0.08)] border border-[rgba(245,197,66,0.15)]">
                  <span aria-hidden="true" className="mt-[1px] shrink-0">
                    {icona}
                  </span>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
                    <span className="font-semibold text-[var(--color-text-primary)]">{etichetta}</span>
                    {valore(guidaLuceAccessibile)}
                  </p>
                </div>
              ))}
            </div>
          )}
          {chiave === "umidita" && guidaUmiditaAccessibile && (
            <div className="flex flex-col gap-2 mb-3">
              {VOCI_GUIDA_UMIDITA.map(({ icona, etichetta, valore }) => (
                <div key={etichetta} className="flex items-start gap-2 rounded-lg px-3 py-2 bg-[rgba(126,200,200,0.08)] border border-[rgba(126,200,200,0.15)]">
                  <span aria-hidden="true" className="mt-[1px] shrink-0">
                    {icona}
                  </span>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
                    <span className="font-semibold text-[var(--color-text-primary)]">{etichetta}</span>
                    {valore(guidaUmiditaAccessibile)}
                  </p>
                </div>
              ))}
            </div>
          )}
          {chiave === "temperatura" && guidaTemperaturaAccessibile && (
            <div className="flex flex-col gap-2 mb-3">
              {/* Range con riferimento domestico */}
              <div className="flex items-start gap-2 rounded-lg px-3 py-2 bg-[rgba(232,135,90,0.08)] border border-[rgba(232,135,90,0.15)]">
                <span aria-hidden="true" className="mt-[1px] shrink-0">
                  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
                    <path d="M9 2v8.5a3.5 3.5 0 1 1-2 0V2a2 2 0 0 1 4 0z" stroke="#e8875a" strokeWidth="1.5" fill="none" />
                    <circle cx="9" cy="13.5" r="1.5" fill="#e8875a" opacity="0.4" />
                  </svg>
                </span>
                <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
                  <span className="font-semibold text-[var(--color-text-primary)]">Tienila così: </span>
                  {guidaTemperaturaAccessibile.rangeConRiferimentoDomestico}
                </p>
              </div>
              {/* Situazioni da evitare */}
              {guidaTemperaturaAccessibile.situazioniDaEvitare.map((situazione, index) => (
                <div key={`situazione-${index}`} className="flex items-start gap-2 rounded-lg px-3 py-2 bg-[rgba(232,135,90,0.08)] border border-[rgba(232,135,90,0.15)]">
                  <span aria-hidden="true" className="mt-[1px] shrink-0">
                    <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
                      <circle cx="9" cy="9" r="7" stroke="#e8875a" strokeWidth="1.5" fill="none" />
                      <path d="M6 6l6 6M12 6l-6 6" stroke="#e8875a" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
                    <span className="font-semibold text-[var(--color-text-primary)]">Evita: </span>
                    {situazione}
                  </p>
                </div>
              ))}
              {/* Segni di stress da temperatura */}
              <div className="flex items-start gap-2 rounded-lg px-3 py-2 bg-[rgba(232,135,90,0.08)] border border-[rgba(232,135,90,0.15)]">
                <span aria-hidden="true" className="mt-[1px] shrink-0">
                  <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4">
                    <path d="M9 2l1.5 4.5H15l-3.7 2.7 1.4 4.3L9 11l-3.7 2.5 1.4-4.3L3 6.5h4.5z" stroke="#e8875a" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                  </svg>
                </span>
                <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
                  <span className="font-semibold text-[var(--color-text-primary)]">Segnali di allarme: </span>
                  {guidaTemperaturaAccessibile.segniStressDaTemperatura}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
