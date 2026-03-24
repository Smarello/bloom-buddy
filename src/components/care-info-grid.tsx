import type { CareInfo } from "@/types/analysis";

interface PropsCareInfoGrid {
  informazioni: CareInfo;
}

interface VoceCura {
  chiave: keyof CareInfo;
  etichetta: string;
  icona: React.ReactNode;
}

const VOCI_CURA: VoceCura[] = [
  {
    chiave: "annaffiatura",
    etichetta: "Annaffiatura",
    icona: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    chiave: "luce",
    etichetta: "Luce",
    icona: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  {
    chiave: "temperatura",
    etichetta: "Temperatura",
    icona: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
  },
  {
    chiave: "umidita",
    etichetta: "Umidità",
    icona: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        <path d="M12 22v-3" />
      </svg>
    ),
  },
];

export function CareInfoGrid({ informazioni }: PropsCareInfoGrid) {
  return (
    <div className="grid grid-cols-2 gap-3 p-5 pt-4">
      {VOCI_CURA.map(({ chiave, etichetta, icona }) => (
        <div
          key={chiave}
          className="flex flex-col gap-2 p-4 bg-[var(--color-cream-100)] rounded-xl border border-[var(--color-border-light)]"
        >
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-primary-500)]" aria-hidden="true">
              {icona}
            </span>
            <span className="font-[family-name:var(--font-display)] font-semibold text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
              {etichetta}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
            {informazioni[chiave]}
          </p>
        </div>
      ))}
    </div>
  );
}
