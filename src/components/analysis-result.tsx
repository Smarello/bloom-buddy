import type { PlantAnalysis } from "@/types/analysis";
import { HealthIndicator } from "./health-indicator";
import { CareTipsList } from "./care-tips-list";
import { CareInfoGrid } from "./care-info-grid";

interface PropsAnalysisResult {
  analisi: PlantAnalysis;
  urlAnteprima: string;
  onNuovaAnalisi: () => void;
}

export function AnalysisResult({
  analisi,
  urlAnteprima,
  onNuovaAnalisi,
}: PropsAnalysisResult) {
  const percentualeConfidenza = Math.round(analisi.livelloConfidenza * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* HERO: Identità pianta con foto */}
      <div
        className="bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded-2xl overflow-hidden shadow-[var(--shadow-lg)]"
        style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {/* Banner foto */}
        <div className="relative h-[260px] max-md:h-[220px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlAnteprima}
            alt={`Foto analizzata — ${analisi.nomeComune}`}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.88) saturate(1.1)" }}
          />
          {/* Gradiente scuro in basso */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(20, 32, 20, 0.72) 0%, transparent 100%)",
            }}
          />

          {/* Chip confidenza in alto a destra */}
          <div
            className="absolute top-4 right-4 flex items-center gap-1 text-xs font-[family-name:var(--font-display)] font-semibold px-3 py-1.5 rounded-full border z-10"
            style={{
              background: "rgba(0, 0, 0, 0.38)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              color: "rgba(255, 255, 255, 0.95)",
              borderColor: "rgba(255, 255, 255, 0.15)",
              letterSpacing: "0.02em",
            }}
            aria-label={`Confidenza identificazione: ${percentualeConfidenza}%`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {percentualeConfidenza}% confidenza
          </div>

          {/* Nome pianta sovrapposto in basso */}
          <div className="absolute bottom-5 left-6 z-10">
            <h1
              className="font-[family-name:var(--font-display)] font-bold text-3xl max-md:text-2xl text-white leading-tight mb-1"
              style={{ textShadow: "0 2px 12px rgba(0, 0, 0, 0.4)" }}
            >
              {analisi.nomeComune}
            </h1>
            {analisi.nomeScientifico && (
              <p
                className="text-sm font-medium"
                style={{
                  color: "rgba(255, 255, 255, 0.75)",
                  fontStyle: "italic",
                  letterSpacing: "0.02em",
                }}
              >
                {analisi.nomeScientifico}
              </p>
            )}
          </div>
        </div>

        {/* Banda stato salute */}
        <div className="px-6 py-5 border-b border-[var(--color-border-light)]">
          <HealthIndicator
            stato={analisi.statoSalute}
            descrizione={analisi.descrizioneSalute}
          />
        </div>
      </div>

      {/* Griglia sezioni */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Consigli personalizzati — larghezza piena */}
        <div
          className="md:col-span-2 bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded-xl overflow-hidden shadow-[var(--shadow-sm)]"
          style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 150ms both" }}
        >
          <div className="flex items-center gap-3 px-6 py-5 pb-4 border-b border-[var(--color-border-light)]">
            <div className="w-[38px] h-[38px] rounded-lg bg-[rgba(74,124,74,0.1)] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4a7c4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                <path d="M12 22V12" />
                <path d="M12 12C10 8 4 4 2 6c0 6 5 10 10 9" />
                <path d="M12 16c2-3 8-5 10-2-1 5-6 8-10 6" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-text-primary)]">
              Consigli personalizzati
            </h2>
          </div>
          <div className="px-6 py-5">
            <CareTipsList consigli={analisi.consigliCura} />
          </div>
        </div>

        {/* Cura della specie */}
        <div
          className="bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded-xl overflow-hidden shadow-[var(--shadow-sm)]"
          style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 220ms both" }}
        >
          <div className="flex items-center gap-3 px-6 py-5 pb-4 border-b border-[var(--color-border-light)]">
            <div className="w-[38px] h-[38px] rounded-lg bg-[rgba(192,106,48,0.1)] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#c06a30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-text-primary)]">
              Cura della specie
            </h2>
          </div>
          <CareInfoGrid informazioni={analisi.informazioniGenerali} />
        </div>

        {/* Pulsante Nuova analisi */}
        <div
          className="flex flex-col items-center justify-center gap-4 p-8 rounded-xl text-center border"
          style={{
            background: "linear-gradient(135deg, rgba(74, 124, 74, 0.06) 0%, rgba(192, 106, 48, 0.04) 100%)",
            borderColor: "rgba(74, 124, 74, 0.12)",
            animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 290ms both",
          }}
        >
          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-[var(--shadow-md)]" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
              <path d="M20 34V20" stroke="#4a7c4a" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M20 20C18 14 10 8 6 10c0 8 6 14 14 13" fill="#6a9e6a" opacity="0.8" />
              <path d="M20 26c3-4 10-6 13-3-1 6-7 10-13 8" fill="#4a7c4a" opacity="0.6" />
            </svg>
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] font-bold text-xl text-[var(--color-text-primary)] mb-1">
              Hai un&apos;altra pianta?
            </p>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              Carica una nuova foto e scopri tutto sulla prossima pianta.
            </p>
          </div>
          <button
            type="button"
            onClick={onNuovaAnalisi}
            className="inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-base px-6 py-3 rounded-full text-white bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_4px_15px_rgba(74,124,74,0.3)] transition-all duration-[var(--transition-base)] hover:from-primary-400 hover:to-primary-500 hover:shadow-[0_6px_22px_rgba(74,124,74,0.38)] hover:-translate-y-0.5 active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #4a7c4a, #3d663d)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[18px] h-[18px]"
              aria-hidden="true"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Nuova analisi
          </button>
        </div>
      </div>
    </div>
  );
}
