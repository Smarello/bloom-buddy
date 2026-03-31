"use client";

import { useState, useRef, useEffect } from "react";
import { IconaCestino, IconaSpinner } from "@/components/icone-eliminazione";

function IconaAvviso() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className="w-full h-full"
      aria-hidden="true"
    >
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

interface PropsDialogoEliminaAnalisi {
  idAnalisi: string;
  aperto: boolean;
  onChiudi: () => void;
  onEliminata: () => void;
}

export default function DialogoEliminaAnalisi({
  idAnalisi,
  aperto,
  onChiudi,
  onEliminata,
}: PropsDialogoEliminaAnalisi) {
  const refDialog = useRef<HTMLDialogElement>(null);

  const [inEliminazione, setInEliminazione] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    if (aperto) {
      refDialog.current?.showModal();
      setErrore(null);
      setInEliminazione(false);
    } else {
      refDialog.current?.close();
    }
  }, [aperto]);

  function gestisciClickBackdrop(e: React.MouseEvent<HTMLDialogElement>) {
    e.stopPropagation();
    if (e.target === refDialog.current && !inEliminazione) onChiudi();
  }

  async function eseguiEliminazione() {
    if (inEliminazione) return;

    setInEliminazione(true);
    setErrore(null);

    try {
      const risposta = await fetch(`/api/collezione/${idAnalisi}`, {
        method: "DELETE",
      });

      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => null);
        setErrore(
          dati?.errore ?? "Non è stato possibile eliminare l'analisi."
        );
        setInEliminazione(false);
        return;
      }

      onChiudi();
      onEliminata();
    } catch {
      setErrore("Errore di connessione. Controlla la rete e riprova.");
      setInEliminazione(false);
    }
  }

  return (
    <dialog
      ref={refDialog}
      onClick={gestisciClickBackdrop}
      className="fixed inset-0 z-50 m-auto w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-[var(--color-border-light)] shadow-[var(--shadow-lg)] p-0 bg-white backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      style={{
        background: "var(--color-bg-primary, #ffffff)",
        animation: aperto
          ? "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both"
          : undefined,
      }}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-[var(--color-border-light)]">
          <h3 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-text-primary)]">
            Elimina analisi
          </h3>
          <button
            type="button"
            onClick={onChiudi}
            disabled={inEliminazione}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-40"
            aria-label="Chiudi"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              className="w-4 h-4"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corpo */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Icona avvertimento */}
          <div className="flex justify-center">
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
          </div>

          {/* Messaggio */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[var(--color-text-primary)] text-center leading-relaxed">
              Eliminare questa analisi?
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] text-center leading-relaxed">
              L'analisi verrà rimossa dalla tua collezione.{" "}
              <strong className="text-[var(--color-accent-600)]">
                Questa azione non è reversibile.
              </strong>
            </p>
          </div>

          {/* Errore */}
          {errore && (
            <p
              className="text-xs text-red-600 text-center"
              role="alert"
            >
              {errore}
            </p>
          )}

          {/* Azioni */}
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onChiudi}
              disabled={inEliminazione}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border-light)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={eseguiEliminazione}
              disabled={inEliminazione}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 active:scale-[0.97]"
            >
              {inEliminazione ? (
                <span className="inline-flex items-center gap-2">
                  <IconaSpinner className="w-4 h-4" />
                  Eliminazione…
                </span>
              ) : (
                "Elimina"
              )}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
