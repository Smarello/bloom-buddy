"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "@/components/analysis-result";
import { CHIAVE_SESSION_STORAGE } from "@/hooks/useAnalysis";
import type { PlantAnalysis } from "@/types/analysis";

interface DatiAnalisi {
  analisi: PlantAnalysis;
  urlAnteprima: string;
}

export default function PaginaAnalisi() {
  const router = useRouter();
  const [dati, setDati] = useState<DatiAnalisi | null>(null);
  const [isCaricamento, setIsCaricamento] = useState(true);

  useEffect(() => {
    const serializzato = sessionStorage.getItem(CHIAVE_SESSION_STORAGE);

    if (!serializzato) {
      router.replace("/");
      return;
    }

    try {
      const datiParsati = JSON.parse(serializzato) as DatiAnalisi;
      setDati(datiParsati);
    } catch {
      router.replace("/");
    } finally {
      setIsCaricamento(false);
    }
  }, [router]);

  const gestisciNuovaAnalisi = () => {
    sessionStorage.removeItem(CHIAVE_SESSION_STORAGE);
    router.push("/");
  };

  if (isCaricamento) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" aria-busy="true">
        <div
          className="w-10 h-10 border-3 border-[var(--color-primary-100)] border-t-[var(--color-primary-500)] rounded-full"
          style={{ animation: "spin-slow 1s linear infinite" }}
          role="status"
          aria-label="Caricamento in corso"
        />
      </div>
    );
  }

  if (!dati) {
    return null;
  }

  return (
    <section className="py-8 pb-20">
      <div
        className="mx-auto px-6 max-md:px-4"
        style={{ maxWidth: "var(--container-max, 1100px)" }}
      >
        {/* Link torna indietro */}
        <button
          type="button"
          onClick={gestisciNuovaAnalisi}
          className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-semibold text-sm text-[var(--color-text-muted)] mb-8 py-2 transition-colors duration-[var(--transition-fast)] hover:text-[var(--color-primary-600)]"
          aria-label="Torna alla homepage e avvia una nuova analisi"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Analizza un&apos;altra pianta
        </button>

        <AnalysisResult
          analisi={dati.analisi}
          urlAnteprima={dati.urlAnteprima}
          onNuovaAnalisi={gestisciNuovaAnalisi}
        />
      </div>
    </section>
  );
}
