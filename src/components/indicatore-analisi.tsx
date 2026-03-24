"use client";

import { useState, useEffect } from "react";
import {
  MESSAGGI_CARICAMENTO_ANALISI,
  INTERVALLO_ROTAZIONE_MS,
} from "@/lib/analisi/messaggi-caricamento";

export function IndicatoreAnalisi() {
  const [indiceMessaggio, setIndiceMessaggio] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndiceMessaggio((indice) => (indice + 1) % MESSAGGI_CARICAMENTO_ANALISI.length);
    }, INTERVALLO_ROTAZIONE_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex flex-col items-center gap-5 py-4"
      aria-busy="true"
      aria-label="Analisi in corso"
      data-testid="indicatore-analisi"
    >
      {/* Spinner con icona foglia SVG */}
      <div className="w-24 h-24 relative">
        {/* Anello esterno rotante */}
        <div
          className="absolute inset-0 border-2 border-primary-100 border-t-primary-500 rounded-full"
          style={{ animation: "spin-slow 1.2s linear infinite" }}
          aria-hidden="true"
        />
        {/* Anello intermedio decorativo */}
        <div
          className="absolute inset-[6px] border border-dashed border-primary-200 rounded-full opacity-60"
          style={{ animation: "spin-slow 8s linear infinite reverse" }}
          aria-hidden="true"
        />
        {/* Icona foglia centrale */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            className="w-10 h-10"
            style={{ animation: "pulse-gentle 2s ease-in-out infinite" }}
            aria-hidden="true"
          >
            <path
              d="M20 6c-6 2.5-12 10-10 20 6-1.5 10-7 11-17"
              fill="#6a9e6a"
              opacity="0.7"
            />
            <path
              d="M20 6c6 3.5 11 11 7.5 21-5-2.5-8.5-9.5-7.5-18.5"
              fill="#4a7c4a"
              opacity="0.5"
            />
            <path
              d="M20 6v26"
              stroke="#4a7c4a"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M14 16c-1.5 4-3.5 6.5-3 7.5"
              stroke="#6a9e6a"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.4"
            />
            <path
              d="M26 13c1.5 3 3 6 2 7"
              stroke="#4a7c4a"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.3"
            />
          </svg>
        </div>
      </div>

      {/* Testo del messaggio con aria-live per screen reader */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="min-h-[1.5rem] text-center"
      >
        <p
          className="font-[family-name:var(--font-display)] font-semibold text-[var(--color-text-primary)] text-base transition-opacity duration-300"
          key={indiceMessaggio}
        >
          {MESSAGGI_CARICAMENTO_ANALISI[indiceMessaggio]}
        </p>
      </div>

      {/* Barra di progresso indeterminata */}
      <div className="w-[200px] h-1.5 bg-primary-50 rounded-full overflow-hidden">
        <div
          className="h-full w-1/2 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
          style={{ animation: "progress-slide 1.8s ease-in-out infinite" }}
          aria-hidden="true"
        />
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        Potrebbe richiedere qualche secondo...
      </p>
    </div>
  );
}
