"use client";

import { useEffect, useRef } from "react";
import type { HealthStatus } from "@/types/analysis";

interface PropsHealthIndicator {
  stato: HealthStatus;
  descrizione: string;
}

const CONFIG_STATI: Record<
  HealthStatus,
  { etichetta: string; colore: string; percentuale: number; icona: string }
> = {
  excellent: {
    etichetta: "Ottima salute",
    colore: "var(--color-health-excellent)",
    percentuale: 1,
    icona: "🌿",
  },
  good: {
    etichetta: "Buona salute",
    colore: "var(--color-health-good)",
    percentuale: 0.75,
    icona: "🍃",
  },
  fair: {
    etichetta: "Condizioni discrete",
    colore: "var(--color-secondary-400)",
    percentuale: 0.5,
    icona: "🌱",
  },
  poor: {
    etichetta: "Ha bisogno di cure",
    colore: "var(--color-health-poor)",
    percentuale: 0.25,
    icona: "🪴",
  },
};

const CIRCONFERENZA = 138.23; // 2 * π * r, r = 22

export function HealthIndicator({ stato, descrizione }: PropsHealthIndicator) {
  const config = CONFIG_STATI[stato];
  const anelloRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const anello = anelloRef.current;
    if (!anello) return;

    // Inizia da zero (offset = intera circonferenza)
    anello.style.strokeDashoffset = String(CIRCONFERENZA);

    // Anima all'offset target dopo un breve ritardo
    const timer = setTimeout(() => {
      const offsetTarget = CIRCONFERENZA * (1 - config.percentuale);
      anello.style.strokeDashoffset = String(offsetTarget);
    }, 100);

    return () => clearTimeout(timer);
  }, [config.percentuale]);

  return (
    <div className="flex items-center gap-4">
      {/* Anello SVG animato */}
      <div className="relative w-14 h-14 shrink-0">
        <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
          {/* Traccia di sfondo */}
          <circle
            cx="28"
            cy="28"
            r="22"
            fill="none"
            stroke="var(--color-cream-200)"
            strokeWidth="4"
          />
          {/* Anello di progresso animato */}
          <circle
            ref={anelloRef}
            cx="28"
            cy="28"
            r="22"
            fill="none"
            stroke={config.colore}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCONFERENZA}
            strokeDashoffset={CIRCONFERENZA}
            style={{
              transformOrigin: "center",
              transform: "rotate(-90deg)",
              transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </svg>
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl leading-none"
          aria-hidden="true"
        >
          {config.icona}
        </span>
      </div>

      {/* Testo stato salute */}
      <div className="flex-1 min-w-0">
        <p
          className="font-[family-name:var(--font-display)] font-bold text-lg mb-1"
          style={{ color: config.colore }}
          data-testid="health-label"
        >
          {config.etichetta}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {descrizione}
        </p>
      </div>
    </div>
  );
}
