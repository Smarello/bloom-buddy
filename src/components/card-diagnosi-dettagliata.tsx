"use client";

import { useState } from "react";
import type { DiagnosiDettagliata } from "@/types/analysis";

interface PropsCardDiagnosiDettagliata {
  diagnosi: DiagnosiDettagliata;
}

const ETICHETTA_BADGE: Record<DiagnosiDettagliata["categoria"], string> = {
  critico: "CRITICO",
  attenzione: "ATTENZIONE",
};

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
  cosaAspettarsi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const SEZIONI_APPROFONDIMENTO = [
  { numero: 1, chiave: "cosaVedo" as const, titolo: "Cosa vedo", iconaChiave: "cosaVedo" as const },
  { numero: 2, chiave: "cosaSignifica" as const, titolo: "Cosa significa", iconaChiave: "cosaSignifica" as const },
  { numero: 3, chiave: "cosaAspettarsi" as const, titolo: "Cosa aspettarsi", iconaChiave: "cosaAspettarsi" as const },
];

function parseTempoRecupero(testo: string): { descrizione: string; tempo: string } | null {
  const match = testo.match(/(.+?)(\d[\w\s-]*(?:settiman[ae]|giorn[oi]|mes[ei]))\s*$/i);
  if (match) {
    return { descrizione: match[1].trim(), tempo: match[2].trim() };
  }
  return null;
}

export function CardDiagnosiDettagliata({ diagnosi }: PropsCardDiagnosiDettagliata) {
  const [aperta, setAperta] = useState(false);
  const tempoRecupero = parseTempoRecupero(diagnosi.cosaAspettarsi);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "var(--diagnosi-bg)",
        border: `2px solid var(--diagnosi-border-color)`,
        boxShadow: "var(--diagnosi-box-shadow)",
      }}
      data-testid="card-diagnosi-dettagliata"
      data-categoria={diagnosi.categoria}
    >
      {/* Bordo laterale sinistro */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full rounded-l-sm"
        style={{ background: "var(--diagnosi-bordo-sinistro)" }}
        aria-hidden="true"
      />

      {/* Decorazione angolo top-right */}
      <div
        className="absolute top-[-40px] right-[-40px] w-[140px] h-[140px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(circle, var(--diagnosi-cerchio), transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Header cliccabile: badge + titolo + chevron */}
      <button
        type="button"
        className="w-full flex items-center gap-4 max-sm:gap-3 p-8 max-sm:p-5 text-left"
        onClick={() => setAperta((prev) => !prev)}
        aria-expanded={aperta}
        aria-controls={`approfondimento-${diagnosi.titolo}`}
      >
        <div
          className="w-14 h-14 max-sm:w-11 max-sm:h-11 shrink-0 rounded-xl flex items-center justify-center relative"
          style={{ background: "var(--diagnosi-icona-sfondo)", boxShadow: "var(--diagnosi-icona-ombra)" }}
          aria-hidden="true"
        >
          <span className="w-7 h-7 max-sm:w-5 max-sm:h-5 relative z-[1]" style={{ color: "var(--diagnosi-icona-stroke)" }}>
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
            style={{ color: "var(--diagnosi-badge-colore)", background: "var(--diagnosi-badge-bg)" }}
            data-testid="badge-categoria"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              {diagnosi.categoria === "critico" ? (
                <circle cx="8" cy="8" r="5" />
              ) : (
                <path d="M8 1l7 14H1L8 1z" />
              )}
            </svg>
            {ETICHETTA_BADGE[diagnosi.categoria]}
          </span>
          <h3
            className="font-[family-name:var(--font-display)] font-bold text-xl max-sm:text-lg leading-tight mt-1.5"
            style={{ color: "var(--diagnosi-titolo-colore)" }}
          >
            {diagnosi.titolo}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {aperta ? "Nascondi dettagli" : "Mostra dettagli analisi"}
          </p>
        </div>
        {/* Chevron */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--diagnosi-sezione-icona)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-5 h-5 shrink-0 transition-transform duration-300 ${aperta ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Contenuto approfondimento — collassabile */}
      <div
        id={`approfondimento-${diagnosi.titolo}`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${aperta ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-8 max-sm:px-5 pb-8 max-sm:pb-5 pt-0">
            {/* Griglia 3 sezioni: cosaVedo, cosaSignifica, cosaAspettarsi */}
            <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4" data-testid="griglia-sezioni">
              {SEZIONI_APPROFONDIMENTO.map((sezione) => (
                <div
                  key={sezione.chiave}
                  className="p-5 max-sm:p-4 rounded-lg backdrop-blur-[4px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    border: "1px solid rgba(0, 0, 0, 0.04)",
                  }}
                  data-testid={`sezione-${sezione.chiave}`}
                >
                  {/* Header sezione */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-xs text-white"
                      style={{ background: "var(--diagnosi-sezione-numero)" }}
                    >
                      {sezione.numero}
                    </span>
                    <span
                      className="w-[18px] h-[18px] shrink-0"
                      style={{ color: "var(--diagnosi-sezione-icona)" }}
                    >
                      {ICONE_SEZIONI[sezione.iconaChiave]}
                    </span>
                    <span
                      className="font-[family-name:var(--font-display)] font-bold text-sm uppercase tracking-[0.06em]"
                      style={{ color: "var(--diagnosi-sezione-titolo)" }}
                    >
                      {sezione.titolo}
                    </span>
                  </div>

                  {/* Contenuto */}
                  {sezione.chiave === "cosaAspettarsi" ? (
                    <>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-1">
                        {tempoRecupero ? tempoRecupero.descrizione : diagnosi.cosaAspettarsi}
                      </p>
                      {tempoRecupero && (
                        <div
                          className="flex items-center gap-3 mt-3 px-4 py-3 rounded-md relative overflow-hidden font-[family-name:var(--font-display)] font-semibold text-sm"
                          style={{ background: "var(--diagnosi-timeline-bg)", color: "var(--diagnosi-timeline-colore)" }}
                          data-testid="indicatore-temporale"
                        >
                          <div
                            className="absolute left-0 top-0 w-[3px] h-full rounded-[3px]"
                            style={{ background: "var(--diagnosi-timeline-bordo)" }}
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
        </div>
      </div>
    </div>
  );
}
