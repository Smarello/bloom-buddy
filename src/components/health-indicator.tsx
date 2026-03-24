"use client";

import { useEffect, useRef } from "react";
import type { HealthStatus } from "@/types/analysis";

interface PropsHealthIndicator {
  stato: HealthStatus;
  descrizione: string;
}

const CONFIG_STATI: Record<
  HealthStatus,
  {
    etichetta: string;
    colore: string;
    percentuale: number;
    titolo: string;
    bgBadge: string;
  }
> = {
  excellent: {
    etichetta: "Ottima salute",
    colore: "var(--color-health-excellent)",
    percentuale: 1,
    titolo: "La tua pianta è in splendida forma!",
    bgBadge: "rgba(74, 158, 74, 0.12)",
  },
  good: {
    etichetta: "Buona salute",
    colore: "var(--color-health-good)",
    percentuale: 0.75,
    titolo: "La tua pianta sta abbastanza bene!",
    bgBadge: "rgba(124, 179, 66, 0.12)",
  },
  fair: {
    etichetta: "Condizioni discrete",
    colore: "var(--color-secondary-400)",
    percentuale: 0.5,
    titolo: "La tua pianta ha bisogno di attenzione.",
    bgBadge: "rgba(232, 168, 122, 0.15)",
  },
  poor: {
    etichetta: "Ha bisogno di cure",
    colore: "var(--color-health-poor)",
    percentuale: 0.25,
    titolo: "La tua pianta ha bisogno di cure urgenti.",
    bgBadge: "rgba(224, 96, 96, 0.12)",
  },
};

const CIRCONFERENZA = 283; // 2 * π * 45 ≈ 282.74

export function HealthIndicator({ stato, descrizione }: PropsHealthIndicator) {
  const config = CONFIG_STATI[stato];
  const anelloRef = useRef<SVGCircleElement>(null);
  const punteggio = Math.round(config.percentuale * 100);

  useEffect(() => {
    const anello = anelloRef.current;
    if (!anello) return;

    anello.style.strokeDashoffset = String(CIRCONFERENZA);

    const timer = setTimeout(() => {
      const offsetTarget = CIRCONFERENZA * (1 - config.percentuale);
      anello.style.strokeDashoffset = String(offsetTarget);
    }, 100);

    return () => clearTimeout(timer);
  }, [config.percentuale]);

  return (
    <div className="flex items-center gap-6 max-sm:flex-col max-sm:text-center">
      {/* Anello SVG grande */}
      <div className="relative w-[110px] h-[110px] shrink-0" aria-hidden="true">
        <svg
          width="110"
          height="110"
          viewBox="0 0 110 110"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="55"
            cy="55"
            r="45"
            fill="none"
            stroke="var(--color-primary-100)"
            strokeWidth="7"
          />
          <circle
            ref={anelloRef}
            cx="55"
            cy="55"
            r="45"
            fill="none"
            stroke={config.colore}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCONFERENZA}
            strokeDashoffset={CIRCONFERENZA}
            style={{
              transition: "stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </svg>
        {/* Valore numerico al centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-[family-name:var(--font-display)] font-bold leading-none"
            style={{ fontSize: "var(--text-3xl)", color: config.colore }}
          >
            {punteggio}
          </span>
          <span className="text-xs text-[var(--color-text-muted)] mt-0.5">su 100</span>
        </div>
      </div>

      {/* Testo: badge + titolo + descrizione */}
      <div className="flex-1 min-w-0">
        <span
          className="inline-flex items-center font-[family-name:var(--font-display)] font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wide mb-2"
          style={{ background: config.bgBadge, color: config.colore }}
        >
          {config.etichetta}
        </span>
        <h3
          className="font-[family-name:var(--font-display)] font-bold text-xl text-[var(--color-text-primary)] mb-2"
          data-testid="health-label"
        >
          {config.titolo}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {descrizione}
        </p>
      </div>
    </div>
  );
}
