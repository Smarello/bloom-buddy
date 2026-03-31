import type { CareInfo, GuidaAnnaffiaturaAccessibile } from "@/types/analysis";

interface PropsCareInfoGrid {
  informazioni: CareInfo;
  guidaAnnaffiaturaAccessibile?: GuidaAnnaffiaturaAccessibile;
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

export function CareInfoGrid({ informazioni, guidaAnnaffiaturaAccessibile }: PropsCareInfoGrid) {
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
            </div>
          )}
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {informazioni[chiave]}
          </p>
        </div>
      ))}
    </div>
  );
}
