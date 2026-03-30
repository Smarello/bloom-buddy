"use client";

import { useState, useRef, useCallback } from "react";
import { IconaCestino, IconaSpinner } from "@/components/icone-eliminazione";

interface PropsPulsanteEliminaAnalisi {
  idAnalisi: string;
  onEliminata: () => void;
}

function IconaAvviso() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Triangolo di avviso stilizzato */}
      <path
        d="M24 8L4 40h40L24 8z"
        fill="#c06a30"
        opacity="0.1"
        stroke="#c06a30"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeOpacity="0.4"
      />
      <path
        d="M24 20v10"
        stroke="#c06a30"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="24" cy="34" r="1.8" fill="#c06a30" opacity="0.7" />
    </svg>
  );
}

export function PulsanteEliminaAnalisi({
  idAnalisi,
  onEliminata,
}: PropsPulsanteEliminaAnalisi) {
  const [dialogAperto, setDialogAperto] = useState(false);
  const [eliminazioneInCorso, setEliminazioneInCorso] = useState(false);
  const [messaggioErrore, setMessaggioErrore] = useState<string | null>(null);
  const refDialog = useRef<HTMLDialogElement>(null);

  const apriConferma = useCallback(
    (evento: React.MouseEvent) => {
      evento.preventDefault();
      evento.stopPropagation();
      setMessaggioErrore(null);
      setDialogAperto(true);
      refDialog.current?.showModal();
    },
    [],
  );

  const chiudiConferma = useCallback(() => {
    setDialogAperto(false);
    refDialog.current?.close();
  }, []);

  const gestisciClickBackdrop = useCallback(
    (evento: React.MouseEvent<HTMLDialogElement>) => {
      if (evento.target === refDialog.current && !eliminazioneInCorso) {
        chiudiConferma();
      }
    },
    [eliminazioneInCorso, chiudiConferma],
  );

  const confermaEliminazione = useCallback(async () => {
    setEliminazioneInCorso(true);
    setMessaggioErrore(null);

    try {
      const risposta = await fetch(`/api/collezione/${idAnalisi}`, {
        method: "DELETE",
      });

      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => null);
        throw new Error(
          dati?.errore ?? "Non e stato possibile eliminare l'analisi.",
        );
      }

      chiudiConferma();
      onEliminata();
    } catch (errore) {
      const messaggio =
        errore instanceof Error
          ? errore.message
          : "Si e verificato un errore imprevisto. Riprova tra poco.";
      setMessaggioErrore(messaggio);
    } finally {
      setEliminazioneInCorso(false);
    }
  }, [idAnalisi, onEliminata, chiudiConferma]);

  return (
    <>
      {/* Pulsante cestino posizionato come overlay sulla card */}
      <button
        type="button"
        onClick={apriConferma}
        className="absolute top-2.5 left-2.5 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-black/40 text-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600/80 hover:text-white hover:scale-110 focus-visible:opacity-100 focus-visible:bg-red-600/80 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
        aria-label="Elimina analisi"
      >
        <div className="w-[18px] h-[18px]">
          <IconaCestino />
        </div>
      </button>

      {/* Dialog di conferma eliminazione */}
      <dialog
        ref={refDialog}
        onClose={chiudiConferma}
        onClick={gestisciClickBackdrop}
        className="fixed inset-0 z-50 m-auto w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-[var(--color-border-light)] shadow-[var(--shadow-lg)] p-0 bg-white backdrop:bg-black/40 backdrop:backdrop-blur-sm"
        style={{
          background: "var(--color-bg-primary, #ffffff)",
          animation: dialogAperto
            ? "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both"
            : undefined,
        }}
      >
        <div className="flex flex-col items-center px-6 pt-6 pb-5 gap-4">
          {/* Icona di avviso */}
          <div className="w-14 h-14 relative">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(192, 106, 48, 0.12), rgba(192, 106, 48, 0.03))",
              }}
              aria-hidden="true"
            />
            <IconaAvviso />
          </div>

          {/* Titolo */}
          <h3 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-text-primary)] text-center">
            Eliminare questa analisi?
          </h3>

          {/* Avviso irreversibilita */}
          <p className="text-sm text-[var(--color-text-secondary)] text-center leading-relaxed max-w-[280px]">
            L&apos;analisi verra rimossa dalla tua collezione.{" "}
            <strong className="text-[var(--color-accent-600)]">
              Questa azione non e reversibile.
            </strong>
          </p>

          {/* Messaggio di errore */}
          {messaggioErrore && (
            <div
              role="alert"
              className="w-full text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-center leading-relaxed"
            >
              {messaggioErrore}
            </div>
          )}

          {/* Bottoni azione */}
          <div className="flex gap-2.5 w-full mt-1">
            <button
              type="button"
              onClick={chiudiConferma}
              disabled={eliminazioneInCorso}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border-light)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-40"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={confermaEliminazione}
              disabled={eliminazioneInCorso}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600 active:scale-[0.97]"
            >
              {eliminazioneInCorso ? (
                <span className="inline-flex items-center gap-2">
                  <IconaSpinner className="w-4 h-4" />
                  Eliminazione...
                </span>
              ) : (
                "Elimina"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
