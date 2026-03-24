import { useState, useCallback, useEffect, useRef } from "react";
import { validaFormatoImmagine, validaDimensioneImmagine } from "@/lib/image/costanti-validazione";
import { comprimiImmagine } from "@/lib/image/comprimi-immagine";

export type StatoProcessamento = "idle" | "compressione" | "pronto" | "errore";

export type TipoErrore = "formato" | "dimensione" | "compressione" | null;

export interface StatoImageUpload {
  fileOriginale: File | null;
  fileCompresso: File | null;
  urlAnteprima: string | null;
  statoProcessamento: StatoProcessamento;
  errore: string | null;
  tipoErrore: TipoErrore;
  nomeFileRifiutato: string | null;
}

export interface AzioniImageUpload {
  gestisciSelezioneFile: (file: File) => void;
  rimuoviFile: () => void;
}

const STATO_INIZIALE: StatoImageUpload = {
  fileOriginale: null,
  fileCompresso: null,
  urlAnteprima: null,
  statoProcessamento: "idle",
  errore: null,
  tipoErrore: null,
  nomeFileRifiutato: null,
};

export function useImageUpload(): StatoImageUpload & AzioniImageUpload {
  const [stato, setStato] = useState<StatoImageUpload>(STATO_INIZIALE);
  const urlAnteprimaRef = useRef<string | null>(null);

  const revocaUrlAnteprima = useCallback(() => {
    if (urlAnteprimaRef.current) {
      URL.revokeObjectURL(urlAnteprimaRef.current);
      urlAnteprimaRef.current = null;
    }
  }, []);

  const rimuoviFile = useCallback(() => {
    revocaUrlAnteprima();
    setStato(STATO_INIZIALE);
  }, [revocaUrlAnteprima]);

  const gestisciSelezioneFile = useCallback(
    (file: File) => {
      revocaUrlAnteprima();

      const validazioneFormato = validaFormatoImmagine(file.type);
      if (!validazioneFormato.valido) {
        setStato({
          ...STATO_INIZIALE,
          statoProcessamento: "errore",
          errore: validazioneFormato.errore!,
          tipoErrore: "formato",
          nomeFileRifiutato: file.name,
        });
        return;
      }

      const validazioneDimensione = validaDimensioneImmagine(file.size);
      if (!validazioneDimensione.valido) {
        setStato({
          ...STATO_INIZIALE,
          statoProcessamento: "errore",
          errore: validazioneDimensione.errore!,
          tipoErrore: "dimensione",
          nomeFileRifiutato: file.name,
        });
        return;
      }

      setStato({
        ...STATO_INIZIALE,
        fileOriginale: file,
        statoProcessamento: "compressione",
      });

      comprimiImmagine(file)
        .then((fileCompresso) => {
          const url = URL.createObjectURL(fileCompresso);
          urlAnteprimaRef.current = url;

          setStato({
            fileOriginale: file,
            fileCompresso,
            urlAnteprima: url,
            statoProcessamento: "pronto",
            errore: null,
            tipoErrore: null,
            nomeFileRifiutato: null,
          });
        })
        .catch(() => {
          setStato({
            ...STATO_INIZIALE,
            statoProcessamento: "errore",
            errore: "Si è verificato un errore durante la compressione dell'immagine. Riprova.",
            tipoErrore: "compressione",
            nomeFileRifiutato: file.name,
          });
        });
    },
    [revocaUrlAnteprima],
  );

  useEffect(() => {
    return () => {
      revocaUrlAnteprima();
    };
  }, [revocaUrlAnteprima]);

  return {
    ...stato,
    gestisciSelezioneFile,
    rimuoviFile,
  };
}
