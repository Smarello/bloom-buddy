"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconaCestinoCollezione, IconaSpinner } from "@/components/icone-eliminazione";

interface PropsDialogoEliminaCollezione {
  idCollezione: string;
  nomeCollezione: string;
  numeroAnalisi: number;
  aperto: boolean;
  onChiudi: () => void;
}

export default function DialogoEliminaCollezione({
  idCollezione,
  nomeCollezione,
  numeroAnalisi,
  aperto,
  onChiudi,
}: PropsDialogoEliminaCollezione) {
  const router = useRouter();
  const refDialog = useRef<HTMLDialogElement>(null);
  const refInputConferma = useRef<HTMLInputElement>(null);

  const [nomeDigitato, setNomeDigitato] = useState("");
  const [inEliminazione, setInEliminazione] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  const richiedeConfermaDigitata = numeroAnalisi > 0;
  const nomeCorrispondente = nomeDigitato.trim() === nomeCollezione.trim();
  const eliminazioneAbilitata = richiedeConfermaDigitata
    ? nomeCorrispondente
    : true;

  useEffect(() => {
    if (aperto) {
      refDialog.current?.showModal();
      setNomeDigitato("");
      setErrore(null);
      setInEliminazione(false);
      setTimeout(() => refInputConferma.current?.focus(), 0);
    } else {
      refDialog.current?.close();
    }
  }, [aperto]);

  function gestisciClickBackdrop(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === refDialog.current && !inEliminazione) onChiudi();
  }

  async function eseguiEliminazione() {
    if (!eliminazioneAbilitata || inEliminazione) return;

    setInEliminazione(true);
    setErrore(null);

    try {
      const risposta = await fetch(`/api/collezioni/${idCollezione}`, {
        method: "DELETE",
      });

      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => null);
        setErrore(
          dati?.errore ??
            "Impossibile eliminare la collezione. Riprova tra qualche istante."
        );
        setInEliminazione(false);
        return;
      }

      router.push("/collezione");
    } catch {
      setErrore(
        "Errore di connessione. Controlla la rete e riprova."
      );
      setInEliminazione(false);
    }
  }

  return (
    <dialog
      ref={refDialog}
      onClose={onChiudi}
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
            Elimina collezione
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
                    "radial-gradient(circle, rgba(220, 60, 60, 0.12), rgba(220, 60, 60, 0.03))",
                }}
                aria-hidden="true"
              />
              <IconaCestinoCollezione />
            </div>
          </div>

          {/* Messaggio */}
          {richiedeConfermaDigitata ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[var(--color-text-primary)] text-center leading-relaxed">
                Stai per eliminare{" "}
                <strong className="font-semibold">{nomeCollezione}</strong>.
              </p>
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 leading-relaxed text-center">
                {numeroAnalisi === 1
                  ? "1 analisi e le relative foto verranno eliminate definitivamente."
                  : `${numeroAnalisi} analisi e le relative foto verranno eliminate definitivamente.`}
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                <label
                  htmlFor="input-conferma-nome-collezione"
                  className="text-xs font-medium text-[var(--color-text-muted)]"
                >
                  Digita{" "}
                  <strong className="text-[var(--color-text-primary)] font-semibold">
                    {nomeCollezione}
                  </strong>{" "}
                  per confermare
                </label>
                <input
                  ref={refInputConferma}
                  id="input-conferma-nome-collezione"
                  type="text"
                  value={nomeDigitato}
                  onChange={(e) => setNomeDigitato(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && eliminazioneAbilitata) {
                      eseguiEliminazione();
                    }
                  }}
                  disabled={inEliminazione}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none transition-colors ${
                    nomeDigitato.length > 0 && !nomeCorrispondente
                      ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                      : "border-[var(--color-border-light)] focus:border-[var(--color-primary-400)] focus:ring-1 focus:ring-[var(--color-primary-200)]"
                  } disabled:opacity-50`}
                  placeholder={nomeCollezione}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-primary)] text-center leading-relaxed">
              Vuoi eliminare la collezione{" "}
              <strong className="font-semibold">{nomeCollezione}</strong>?
              <br />
              <span className="text-[var(--color-text-muted)]">
                La collezione è vuota e verrà rimossa.
              </span>
            </p>
          )}

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
              disabled={!eliminazioneAbilitata || inEliminazione}
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
