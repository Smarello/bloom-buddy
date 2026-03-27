"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnalysisResult } from "@/components/analysis-result";
import { CHIAVE_SESSION_STORAGE } from "@/hooks/useAnalysis";
import type { PlantAnalysis } from "@/types/analysis";

interface DatiAnalisi {
  analisi: PlantAnalysis;
  urlAnteprima: string;
}

export default function PaginaAnalisi() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]" aria-busy="true">
          <div
            className="w-10 h-10 border-3 border-[var(--color-primary-100)] border-t-[var(--color-primary-500)] rounded-full"
            style={{ animation: "spin-slow 1s linear infinite" }}
            role="status"
            aria-label="Caricamento in corso"
          />
        </div>
      }
    >
      <ContenutoPaginaAnalisi />
    </Suspense>
  );
}

function ContenutoPaginaAnalisi() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idCollezione = searchParams.get("id");
  const [dati, setDati] = useState<DatiAnalisi | null>(null);
  const [isCaricamento, setIsCaricamento] = useState(true);
  const [utenteAutenticato, setUtenteAutenticato] = useState<boolean>(false);
  const [giaSalvata, setGiaSalvata] = useState(false);
  const refTitoloPrincipale = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (idCollezione) {
      fetch(`/api/collezione/${idCollezione}`)
        .then((risposta) => {
          if (!risposta.ok) {
            router.replace(risposta.status === 401 ? "/accesso" : "/");
            return null;
          }
          return risposta.json();
        })
        .then((datiApi) => {
          if (datiApi) {
            setDati({
              analisi: datiApi.datiAnalisi as PlantAnalysis,
              urlAnteprima: datiApi.urlFoto as string,
            });
            setGiaSalvata(true);
            setUtenteAutenticato(true);
          }
        })
        .catch(() => {
          router.replace("/");
        })
        .finally(() => {
          setIsCaricamento(false);
        });
      return;
    }

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
  }, [router, idCollezione]);

  useEffect(() => {
    if (!idCollezione) {
      fetch("/api/auth/sessione")
        .then((risposta) => risposta.json())
        .then((datiSessione) => {
          if (datiSessione.autenticato) {
            setUtenteAutenticato(true);
          }
        })
        .catch(() => {});
    }
  }, [idCollezione]);

  useEffect(() => {
    if (!isCaricamento && dati && refTitoloPrincipale.current) {
      refTitoloPrincipale.current.focus();
    }
  }, [isCaricamento, dati]);

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
        {/* Ancora focus accessibile per screen reader e navigazione tastiera */}
        <h1
          ref={refTitoloPrincipale}
          tabIndex={-1}
          className="sr-only"
        >
          Risultato analisi: {dati.analisi.nomeComune}
        </h1>

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
          utenteAutenticato={utenteAutenticato}
          giaSalvata={giaSalvata}
        />
      </div>
    </section>
  );
}
