"use client";

import { useState, useCallback } from "react";
import type { PlantAnalysis } from "@/types/analysis";

export type StatoAnalisi = "idle" | "caricamento" | "successo" | "errore";

export interface ErroreAnalisiHook {
  messaggio: string;
  tipo?: "pianta-non-riconosciuta" | "confidenza-bassa" | "risposta-malformata" | "errore-api" | "rete";
}

export interface StatoUseAnalysis {
  stato: StatoAnalisi;
  errore: ErroreAnalisiHook | null;
}

export interface AzioniUseAnalysis {
  avviaAnalisi: (fileCompresso: File, urlAnteprima: string) => Promise<void>;
  resetta: () => void;
}

export const CHIAVE_SESSION_STORAGE = "bloombuddy-analisi-corrente";

export function useAnalysis(): StatoUseAnalysis & AzioniUseAnalysis {
  const [stato, setStato] = useState<StatoAnalisi>("idle");
  const [errore, setErrore] = useState<ErroreAnalisiHook | null>(null);

  const resetta = useCallback(() => {
    setStato("idle");
    setErrore(null);
  }, []);

  const avviaAnalisi = useCallback(
    async (fileCompresso: File, urlAnteprima: string) => {
      setStato("caricamento");
      setErrore(null);

      const formData = new FormData();
      formData.append("immagine", fileCompresso);

      try {
        const risposta = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        const dati = await risposta.json();

        if (!risposta.ok) {
          setStato("errore");
          setErrore({
            messaggio: dati.errore ?? "Si è verificato un errore imprevisto. Riprova.",
            tipo: dati.tipo,
          });
          return;
        }

        // Salva il risultato e l'URL anteprima in sessionStorage per la pagina /analysis
        const datoCompleto = {
          analisi: dati as PlantAnalysis,
          urlAnteprima,
        };
        sessionStorage.setItem(CHIAVE_SESSION_STORAGE, JSON.stringify(datoCompleto));

        setStato("successo");
      } catch {
        setStato("errore");
        setErrore({
          messaggio:
            "Connessione non disponibile. Verifica la connessione internet e riprova.",
          tipo: "rete",
        });
      }
    },
    // Nessuna dipendenza: la funzione usa solo setStato/setErrore (stabili per referenza) e sessionStorage
    [],
  );

  return {
    stato,
    errore,
    avviaAnalisi,
    resetta,
  };
}
