"use client";

import type { ErroreAnalisiHook } from "@/hooks/useAnalysis";
import {
  MESSAGGI_ERRORE_ANALISI,
  MESSAGGIO_ERRORE_GENERICO,
} from "@/lib/analisi/messaggi-errore";

interface PropsPannelloErroreAnalisi {
  errore: ErroreAnalisiHook;
  onRiprova: () => void;
}

/**
 * Icone SVG distinte per ciascun tipo di errore dell'analisi.
 */
function IconaErrore({
  tipo,
}: {
  tipo: ErroreAnalisiHook["tipo"];
}) {
  if (tipo === "confidenza-bassa") {
    // Icona: occhio con punto interrogativo — "non vedo bene"
    return (
      <svg viewBox="0 0 60 60" fill="none" className="relative z-10 w-full h-full p-[14px]" aria-hidden="true">
        <ellipse cx="30" cy="30" rx="20" ry="14" stroke="#c06a30" strokeWidth="2" strokeDasharray="4 3" opacity="0.4" />
        <circle cx="30" cy="30" r="7" fill="#c06a30" opacity="0.15" stroke="#c06a30" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx="30" cy="30" r="3" fill="#c06a30" opacity="0.5" />
        <path d="M30 22v-5" stroke="#c06a30" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <path d="M28 18h4" stroke="#c06a30" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
        <path d="M38 16l1.5-2" stroke="#c06a30" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M42 22l2-1" stroke="#c06a30" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    );
  }

  if (tipo === "pianta-non-riconosciuta") {
    // Icona: foglia con X — "non è una pianta"
    return (
      <svg viewBox="0 0 60 60" fill="none" className="relative z-10 w-full h-full p-[14px]" aria-hidden="true">
        <path d="M30 44V24" stroke="#c06a30" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
        <path d="M30 24c-4 0-10-4-10-12 6 0 10 4 11 10" fill="#c06a30" opacity="0.3" />
        <path d="M30 30c3-1.5 8-5 7-12-4 1-7 5-7 11" fill="#a05520" opacity="0.25" />
        <path d="M38 18l-16 16" stroke="#c06a30" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
        <path d="M22 18l16 16" stroke="#c06a30" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      </svg>
    );
  }

  if (tipo === "rete") {
    // Icona: segnale wifi interrotto
    return (
      <svg viewBox="0 0 60 60" fill="none" className="relative z-10 w-full h-full p-[14px]" aria-hidden="true">
        <path d="M10 26c5.5-5.5 13-9 20-9s14.5 3.5 20 9" stroke="#c06a30" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />
        <path d="M16 32c3.8-3.8 8.5-6 14-6s10.2 2.2 14 6" stroke="#c06a30" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
        <path d="M22 38c2.2-2.2 5-3.5 8-3.5s5.8 1.3 8 3.5" stroke="#c06a30" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
        <circle cx="30" cy="44" r="2.5" fill="#c06a30" opacity="0.55" />
        <path d="M25 21l10 10" stroke="#c06a30" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <path d="M35 21L25 31" stroke="#c06a30" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      </svg>
    );
  }

  // errore-api, risposta-malformata e fallback: icona generica "servizio non disponibile"
  return (
    <svg viewBox="0 0 60 60" fill="none" className="relative z-10 w-full h-full p-[14px]" aria-hidden="true">
      <circle cx="30" cy="30" r="22" stroke="#c06a30" strokeWidth="2" strokeDasharray="4 3" opacity="0.3" />
      <path d="M30 20v12" stroke="#c06a30" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <circle cx="30" cy="38" r="2" fill="#c06a30" opacity="0.7" />
    </svg>
  );
}

export function PannelloErroreAnalisi({
  errore,
  onRiprova,
}: PropsPannelloErroreAnalisi) {
  const configurazione =
    errore.tipo && errore.tipo in MESSAGGI_ERRORE_ANALISI
      ? MESSAGGI_ERRORE_ANALISI[errore.tipo as keyof typeof MESSAGGI_ERRORE_ANALISI]
      : MESSAGGIO_ERRORE_GENERICO;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center gap-4 py-2"
      data-testid="pannello-errore-analisi"
    >
      {/* Icona */}
      <div className="w-20 h-20 max-md:w-16 max-md:h-16 relative">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(192, 106, 48, 0.1), rgba(192, 106, 48, 0.03))",
            animation: "pulse-gentle 2s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        <IconaErrore tipo={errore.tipo} />
      </div>

      {/* Titolo */}
      <p
        className="font-[family-name:var(--font-display)] font-bold text-lg text-[var(--color-accent-600)]"
        data-testid="titolo-errore"
      >
        {configurazione.titolo}
      </p>

      {/* Messaggio principale */}
      <p
        className="text-sm text-[var(--color-text-secondary)] max-w-[320px] text-center leading-relaxed"
        data-testid="messaggio-errore"
      >
        {configurazione.messaggio}
      </p>

      {/* Suggerimento contestuale */}
      <div
        className="text-xs text-[var(--color-text-muted)] bg-cream-100 p-3 px-4 rounded-lg border-l-[3px] border-[var(--color-secondary-300)] text-left max-w-[320px] w-full leading-relaxed"
        data-testid="suggerimento-errore"
      >
        <strong className="text-[var(--color-text-secondary)]">Suggerimento: </strong>
        {configurazione.suggerimento}
      </div>

      {/* CTA Riprova */}
      <button
        type="button"
        onClick={onRiprova}
        className="inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-base px-6 py-3 rounded-full text-white bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_4px_15px_rgba(74,124,74,0.3)] transition-all duration-[var(--transition-base)] hover:from-primary-400 hover:to-primary-500 hover:shadow-[0_6px_22px_rgba(74,124,74,0.38)] hover:-translate-y-0.5 active:scale-[0.97]"
        data-testid="bottone-riprova"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M1 4v6h6" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        {configurazione.testoBottone}
      </button>
    </div>
  );
}
