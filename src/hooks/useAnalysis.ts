"use client";

import { useState, useCallback } from "react";
import type { PlantAnalysis } from "@/types/analysis";

export type StatoAnalisi = "idle" | "caricamento" | "successo" | "errore";

export interface ErroreAnalisiHook {
  messaggio: string;
  tipo?: "pianta-non-riconosciuta" | "confidenza-bassa" | "risposta-malformata" | "errore-api" | "rete" | "quota-esaurita";
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

function leggiFileComDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useAnalysis(collezioneId?: string): StatoUseAnalysis & AzioniUseAnalysis {
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
        // Converti il file in data URL prima della navigazione per evitare
        // che la revoca del blob URL al dismount del componente renda l'immagine invisibile
        const dataUrlAnteprima = await leggiFileComDataUrl(fileCompresso);

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

        // Salva il risultato e il data URL (base64) in sessionStorage per la pagina /analysis
        const datoCompleto = {
          analisi: dati as PlantAnalysis,
          urlAnteprima: dataUrlAnteprima,
          ...(collezioneId != null && { collezioneId }),
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
    [collezioneId],
  );

  return {
    stato,
    errore,
    avviaAnalisi,
    resetta,
  };
}
