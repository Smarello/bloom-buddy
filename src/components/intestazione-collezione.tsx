"use client";

import { useState } from "react";

interface PropsIntestazioneCollezione {
  idCollezione: string;
  nome: string;
  nomeScientifico: string | null;
}

export default function IntestazioneCollezione({
  idCollezione,
  nome,
  nomeScientifico,
}: PropsIntestazioneCollezione) {
  const [nomeCorrente, setNomeCorrente] = useState(nome);
  const [inModifica, setInModifica] = useState(false);
  const [nomeInput, setNomeInput] = useState(nome);
  const [inSalvataggio, setInSalvataggio] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  const inputValido = nomeInput.trim().length > 0 && nomeInput.trim().length <= 100;

  function avviaModifica() {
    setNomeInput(nomeCorrente);
    setInModifica(true);
  }

  function annullaModifica() {
    setNomeInput(nomeCorrente);
    setInModifica(false);
  }

  async function confermaModifica() {
    if (!inputValido) return;

    const nomePrecedente = nomeCorrente;
    const nuovoNome = nomeInput.trim();

    setNomeCorrente(nuovoNome);
    setInModifica(false);
    setInSalvataggio(true);
    setErrore(null);

    try {
      const risposta = await fetch(`/api/collezioni/${idCollezione}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nuovoNome }),
      });

      if (!risposta.ok) {
        setNomeCorrente(nomePrecedente);
        setErrore("Impossibile salvare il nome. Riprova.");
      }
    } catch {
      setNomeCorrente(nomePrecedente);
      setErrore("Impossibile salvare il nome. Riprova.");
    } finally {
      setInSalvataggio(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {inModifica ? (
          <>
            <input
              type="text"
              value={nomeInput}
              onChange={(e) => setNomeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confermaModifica();
                if (e.key === "Escape") annullaModifica();
              }}
              maxLength={100}
              autoFocus
              className="font-[family-name:var(--font-display)] font-bold text-2xl text-[var(--color-text)] leading-tight bg-transparent border-b-2 border-[var(--color-primary-600)] outline-none w-full"
            />
            <button
              onClick={confermaModifica}
              disabled={!inputValido || inSalvataggio}
              className="shrink-0 p-1.5 rounded-md text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Conferma"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </button>
            <button
              onClick={annullaModifica}
              className="shrink-0 p-1.5 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-primary-50)] transition-colors"
              aria-label="Annulla"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <h1 className="font-[family-name:var(--font-display)] font-bold text-2xl text-[var(--color-text)] leading-tight mb-1">
              {nomeCorrente}
            </h1>
            <button
              onClick={avviaModifica}
              className="shrink-0 p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] transition-colors"
              aria-label="Modifica nome"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </>
        )}
      </div>
      {nomeScientifico && (
        <p className="text-base text-[var(--color-text-muted)] italic mb-3">
          {nomeScientifico}
        </p>
      )}
      {errore && (
        <p className="text-sm text-red-600 mt-1">{errore}</p>
      )}
    </div>
  );
}
