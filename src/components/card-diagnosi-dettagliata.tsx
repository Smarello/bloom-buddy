import type { DiagnosiDettagliata } from "@/types/analysis";

interface PropsCardDiagnosiDettagliata {
  diagnosi: DiagnosiDettagliata;
}

const STILI_CATEGORIA = {
  critico: {
    etichettaBadge: "CRITICO",
    background:
      "radial-gradient(ellipse at 100% 0%, rgba(224, 96, 96, 0.07), transparent 50%), radial-gradient(ellipse at 0% 100%, rgba(224, 96, 96, 0.03), transparent 40%), linear-gradient(135deg, #fef5f5, #fff8f6, #fffafa)",
    borderColor: "rgba(224, 96, 96, 0.35)",
    boxShadow: "0 4px 24px rgba(224, 96, 96, 0.08)",
    bordoSinistro: "linear-gradient(180deg, var(--color-accent-400), var(--color-accent-600))",
    cerchioDecorativo: "var(--color-accent-500)",
    icona: { coloreStroke: "#c94a4a" },
    badgeBg: "rgba(224, 96, 96, 0.14)",
    badgeColore: "var(--color-accent-600)",
    titoloColore: "var(--color-accent-600)",
    iconaSfondo: "linear-gradient(145deg, rgba(224, 96, 96, 0.18), rgba(224, 96, 96, 0.06))",
    iconaOmbra: "0 4px 16px rgba(224, 96, 96, 0.12)",
    sezioneNumero: "var(--color-accent-500)",
    sezioneIcona: "var(--color-accent-500)",
    sezioneTitolo: "var(--color-accent-600)",
    bulletColore: "var(--color-accent-500)",
    timelineBg: "rgba(224, 96, 96, 0.06)",
    timelineColore: "var(--color-accent-600)",
    timelineBordo: "linear-gradient(180deg, var(--color-accent-400), var(--color-accent-600))",
  },
  attenzione: {
    etichettaBadge: "ATTENZIONE",
    background:
      "radial-gradient(ellipse at 100% 0%, rgba(192, 106, 48, 0.07), transparent 50%), radial-gradient(ellipse at 0% 100%, rgba(192, 106, 48, 0.03), transparent 40%), linear-gradient(135deg, var(--color-secondary-50), #fff8f3, #fffcf8)",
    borderColor: "var(--color-secondary-300)",
    boxShadow: "0 4px 24px rgba(192, 106, 48, 0.08)",
    bordoSinistro: "linear-gradient(180deg, var(--color-secondary-400), var(--color-secondary-500))",
    cerchioDecorativo: "var(--color-secondary-500)",
    icona: { coloreStroke: "#a35628" },
    badgeBg: "rgba(192, 106, 48, 0.14)",
    badgeColore: "var(--color-secondary-600)",
    titoloColore: "var(--color-secondary-700)",
    iconaSfondo: "linear-gradient(145deg, var(--color-secondary-100), var(--color-secondary-50))",
    iconaOmbra: "0 4px 16px rgba(192, 106, 48, 0.12)",
    sezioneNumero: "var(--color-secondary-500)",
    sezioneIcona: "var(--color-secondary-500)",
    sezioneTitolo: "var(--color-secondary-600)",
    bulletColore: "var(--color-secondary-500)",
    timelineBg: "rgba(192, 106, 48, 0.08)",
    timelineColore: "var(--color-secondary-600)",
    timelineBordo: "linear-gradient(180deg, var(--color-secondary-400), var(--color-secondary-500))",
  },
} as const;

const ICONE_SEZIONI = {
  cosaVedo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    </svg>
  ),
  cosaSignifica: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4m0-4h.01" />
    </svg>
  ),
  cosaFare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91A6 6 0 016.3 2.53l3.77 3.77z" />
    </svg>
  ),
  cosaAspettarsi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const SEZIONI = [
  { numero: 1, chiave: "cosaVedo" as const, titolo: "Cosa vedo", iconaChiave: "cosaVedo" as const },
  { numero: 2, chiave: "cosaSignifica" as const, titolo: "Cosa significa", iconaChiave: "cosaSignifica" as const },
  { numero: 3, chiave: "cosaFare" as const, titolo: "Cosa fare", iconaChiave: "cosaFare" as const },
  { numero: 4, chiave: "cosaAspettarsi" as const, titolo: "Cosa aspettarsi", iconaChiave: "cosaAspettarsi" as const },
];

function parseAzioni(testo: string): string[] {
  return testo
    .split("\n")
    .map((riga) => riga.trim())
    .filter((riga) => riga.length > 0);
}

function parseTempoRecupero(testo: string): { descrizione: string; tempo: string } | null {
  // Cerca un pattern temporale alla fine (es. "... in 3-4 settimane")
  const match = testo.match(/(.+?)(\d[\w\s-]*(?:settiman[ae]|giorn[oi]|mes[ei]))\s*$/i);
  if (match) {
    return { descrizione: match[1].trim(), tempo: match[2].trim() };
  }
  return null;
}

export function CardDiagnosiDettagliata({ diagnosi }: PropsCardDiagnosiDettagliata) {
  const stili = STILI_CATEGORIA[diagnosi.categoria];
  const azioni = parseAzioni(diagnosi.cosaFare);
  const tempoRecupero = parseTempoRecupero(diagnosi.cosaAspettarsi);

  return (
    <div
      className="relative rounded-2xl p-8 max-sm:p-5 overflow-hidden"
      style={{
        background: stili.background,
        border: `2px solid ${stili.borderColor}`,
        boxShadow: stili.boxShadow,
      }}
      data-testid="card-diagnosi-dettagliata"
      data-categoria={diagnosi.categoria}
    >
      {/* Bordo laterale sinistro */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full rounded-l-sm"
        style={{ background: stili.bordoSinistro }}
        aria-hidden="true"
      />

      {/* Decorazione angolo top-right */}
      <div
        className="absolute top-[-40px] right-[-40px] w-[140px] h-[140px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${stili.cerchioDecorativo}, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Header: icona + badge + titolo */}
      <div className="flex items-center gap-4 max-sm:gap-3 mb-6">
        <div
          className="w-16 h-16 max-sm:w-12 max-sm:h-12 shrink-0 rounded-xl flex items-center justify-center relative"
          style={{ background: stili.iconaSfondo, boxShadow: stili.iconaOmbra }}
          aria-hidden="true"
        >
          <span className="w-8 h-8 max-sm:w-6 max-sm:h-6 relative z-[1]" style={{ color: stili.icona.coloreStroke }}>
            {diagnosi.categoria === "critico" ? (
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4L3 28h26L16 4z" />
                <path d="M16 13v7" />
                <circle cx="16" cy="24" r="1" fill="currentColor" stroke="none" />
              </svg>
            ) : (
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="16" cy="16" r="12" />
                <path d="M16 10v7" />
                <circle cx="16" cy="22" r="1" fill="currentColor" stroke="none" />
              </svg>
            )}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span
            className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-[0.08em] px-3 py-1 rounded-full"
            style={{ color: stili.badgeColore, background: stili.badgeBg }}
            data-testid="badge-categoria"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              {diagnosi.categoria === "critico" ? (
                <circle cx="8" cy="8" r="5" />
              ) : (
                <path d="M8 1l7 14H1L8 1z" />
              )}
            </svg>
            {stili.etichettaBadge}
          </span>
          <h3
            className="font-[family-name:var(--font-display)] font-bold text-2xl max-sm:text-xl leading-tight mt-2"
            style={{ color: stili.titoloColore }}
          >
            {diagnosi.titolo}
          </h3>
        </div>
      </div>

      {/* Griglia 4 sezioni: 2x2 desktop, 1 colonna mobile */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4" data-testid="griglia-sezioni">
        {SEZIONI.map((sezione) => (
          <div
            key={sezione.chiave}
            className="p-5 max-sm:p-4 rounded-lg backdrop-blur-[4px] transition-all hover:shadow-[var(--shadow-sm)] hover:-translate-y-px"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(0, 0, 0, 0.04)",
            }}
            data-testid={`sezione-${sezione.chiave}`}
          >
            {/* Header sezione: numero + icona + titolo */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-xs text-white"
                style={{ background: stili.sezioneNumero }}
              >
                {sezione.numero}
              </span>
              <span
                className="w-[18px] h-[18px] shrink-0"
                style={{ color: stili.sezioneIcona }}
              >
                {ICONE_SEZIONI[sezione.iconaChiave]}
              </span>
              <span
                className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-[0.06em]"
                style={{ color: stili.sezioneTitolo }}
              >
                {sezione.titolo}
              </span>
            </div>

            {/* Contenuto sezione */}
            {sezione.chiave === "cosaFare" ? (
              <ul className="flex flex-col gap-2 list-none" data-testid="lista-azioni">
                {azioni.map((azione, indice) => (
                  <li
                    key={indice}
                    className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)] leading-relaxed"
                  >
                    <span
                      className="w-[7px] h-[7px] shrink-0 rounded-full mt-[8px] shadow-[0_0_6px_rgba(0,0,0,0.08)]"
                      style={{ background: stili.bulletColore }}
                      aria-hidden="true"
                    />
                    <span>{azione}</span>
                  </li>
                ))}
              </ul>
            ) : sezione.chiave === "cosaAspettarsi" ? (
              <>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-1">
                  {tempoRecupero ? tempoRecupero.descrizione : diagnosi.cosaAspettarsi}
                </p>
                {tempoRecupero && (
                  <div
                    className="flex items-center gap-3 mt-3 px-4 py-3 rounded-md relative overflow-hidden font-[family-name:var(--font-display)] font-semibold text-sm"
                    style={{ background: stili.timelineBg, color: stili.timelineColore }}
                    data-testid="indicatore-temporale"
                  >
                    <div
                      className="absolute left-0 top-0 w-[3px] h-full rounded-[3px]"
                      style={{ background: stili.timelineBordo }}
                      aria-hidden="true"
                    />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Recupero visibile in {tempoRecupero.tempo}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {diagnosi[sezione.chiave]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
