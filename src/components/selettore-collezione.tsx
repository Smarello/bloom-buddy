"use client";

import { useState, useEffect, useRef, useMemo } from "react";

interface CollezioneListItem {
  id: string;
  nome: string;
  nomeScientifico: string | null;
  numeroAnalisi: number;
  anteprimaUrl: string | null;
}

interface PropsSelettoreCollezione {
  aperto: boolean;
  onChiudi: () => void;
  onSeleziona: (collezioneId: string | null) => void;
  nomePiantaCorrente: string;
  nomeScientifico?: string;
}

function normalizzaNome(nome: string): string {
  return nome.toLowerCase().trim();
}

export function SelettoreCollezione({
  aperto,
  onChiudi,
  onSeleziona,
  nomePiantaCorrente,
  nomeScientifico,
}: PropsSelettoreCollezione) {
  const [collezioni, setCollezioni] = useState<CollezioneListItem[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(false);
  const refDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (aperto) {
      refDialog.current?.showModal();
      setCaricamento(true);
      setErrore(false);
      fetch("/api/collezione/lista")
        .then((r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((dati) => setCollezioni(dati.collezioni))
        .catch(() => setErrore(true))
        .finally(() => setCaricamento(false));
    } else {
      refDialog.current?.close();
    }
  }, [aperto]);

  const gestisciClickBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === refDialog.current) onChiudi();
  };

  // Identifica la collezione suggerita (stesso nome pianta o nome scientifico)
  const idCollezioneSuggerita = useMemo(() => {
    const nomeNorm = normalizzaNome(nomePiantaCorrente);
    const sciNorm = nomeScientifico ? normalizzaNome(nomeScientifico) : null;

    // Cerca prima per nome scientifico (più preciso), poi per nome comune
    if (sciNorm) {
      const perScientifico = collezioni.find(
        (c) => c.nomeScientifico && normalizzaNome(c.nomeScientifico) === sciNorm
      );
      if (perScientifico) return perScientifico.id;
    }

    const perNome = collezioni.find((c) => normalizzaNome(c.nome) === nomeNorm);
    return perNome?.id ?? null;
  }, [collezioni, nomePiantaCorrente, nomeScientifico]);

  // Ordina: suggerita prima, poi le altre
  const collezioniOrdinate = useMemo(() => {
    if (!idCollezioneSuggerita) return collezioni;
    return [
      ...collezioni.filter((c) => c.id === idCollezioneSuggerita),
      ...collezioni.filter((c) => c.id !== idCollezioneSuggerita),
    ];
  }, [collezioni, idCollezioneSuggerita]);

  return (
    <dialog
      ref={refDialog}
      onClose={onChiudi}
      onClick={gestisciClickBackdrop}
      className="fixed inset-0 z-50 m-auto w-[min(420px,calc(100vw-2rem))] max-h-[min(520px,calc(100vh-4rem))] rounded-2xl border border-[var(--color-border-light)] shadow-[var(--shadow-lg)] p-0 bg-white backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      style={{
        background: "var(--color-bg-primary, #ffffff)",
        animation: aperto ? "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both" : undefined,
      }}
    >
      <div className="flex flex-col max-h-[inherit]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-[var(--color-border-light)]">
          <h3 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-text-primary)]">
            Salva nella collezione
          </h3>
          <button
            type="button"
            onClick={onChiudi}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
            aria-label="Chiudi"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Crea nuova */}
        <div className="px-5 pt-4 pb-2">
          <button
            type="button"
            onClick={() => { onSeleziona(null); onChiudi(); }}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-[var(--color-primary-300)] hover:border-[var(--color-primary-400)] hover:bg-[rgba(74,124,74,0.04)] transition-all group"
          >
            <div
              className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-[var(--color-primary-50)] group-hover:bg-[var(--color-primary-100)] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="text-left">
              <span className="font-[family-name:var(--font-display)] font-semibold text-sm text-[var(--color-primary-600)]">
                Crea nuova collezione
              </span>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                &ldquo;{nomePiantaCorrente}&rdquo;
              </p>
            </div>
          </button>
        </div>

        {/* Lista collezioni */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {caricamento ? (
            <div className="flex items-center justify-center py-8">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" style={{ animation: "spin-slow 1s linear infinite" }}>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-primary-400)" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-primary-400)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="15 47" />
              </svg>
            </div>
          ) : errore ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
              Errore nel caricamento delle collezioni.
            </p>
          ) : collezioniOrdinate.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-4">
              Non hai ancora collezioni salvate.
            </p>
          ) : (
            <>
              <p className="text-xs text-[var(--color-text-muted)] mb-2 mt-1">Collezioni esistenti</p>
              <div className="flex flex-col gap-2">
                {collezioniOrdinate.map((collezione) => {
                  const suggerita = collezione.id === idCollezioneSuggerita;
                  return (
                    <button
                      key={collezione.id}
                      type="button"
                      onClick={() => { onSeleziona(collezione.id); onChiudi(); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                        suggerita
                          ? "border-[var(--color-primary-400)] bg-[rgba(74,124,74,0.06)] ring-1 ring-[var(--color-primary-200)]"
                          : "border-[var(--color-border-light)] hover:border-[var(--color-primary-300)] hover:bg-[rgba(74,124,74,0.03)]"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className={`w-10 h-10 shrink-0 rounded-lg overflow-hidden ${suggerita ? "ring-2 ring-[var(--color-primary-300)]" : "bg-[var(--color-bg-secondary)]"}`}>
                        {collezione.anteprimaUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={collezione.anteprimaUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-secondary)]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" className="w-5 h-5 opacity-40">
                              <path d="M12 22c4-4 8-7.5 8-12A8 8 0 0 0 4 10c0 4.5 4 8 8 12z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className={`font-[family-name:var(--font-display)] font-semibold text-sm block truncate transition-colors ${
                          suggerita
                            ? "text-[var(--color-primary-700)]"
                            : "text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-600)]"
                        }`}>
                          {collezione.nome}
                          {suggerita && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                              Suggerita
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] block truncate">
                          {collezione.nomeScientifico && <em>{collezione.nomeScientifico}</em>}
                          {collezione.nomeScientifico && " · "}
                          {collezione.numeroAnalisi} {collezione.numeroAnalisi === 1 ? "analisi" : "analisi"}
                        </span>
                      </div>
                      {/* Arrow */}
                      <svg viewBox="0 0 24 24" fill="none" stroke={suggerita ? "var(--color-primary-500)" : "var(--color-text-muted)"} strokeWidth="2" strokeLinecap="round" className={`w-4 h-4 shrink-0 transition-opacity ${suggerita ? "opacity-60" : "opacity-0 group-hover:opacity-60"}`}>
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
