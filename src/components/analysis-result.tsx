"use client";

import { useState, useEffect, useRef } from "react";
import type { HealthStatus, PlantAnalysis } from "@/types/analysis";
import type { CareInfo } from "@/types/analysis";
import { HealthIndicator } from "./health-indicator";
import { CareTipsList } from "./care-tips-list";
import { CareInfoGrid } from "./care-info-grid";

type StatoSalvataggio = "idle" | "saving" | "saved" | "duplicate";

interface PropsAnalysisResult {
  analisi: PlantAnalysis;
  urlAnteprima: string;
  onNuovaAnalisi: () => void;
  utenteAutenticato: boolean;
}

const TESTO_INCORAGGIAMENTO: Record<
  HealthStatus,
  { titolo: string; testo: string }
> = {
  excellent: {
    titolo: "La tua pianta è in splendida forma!",
    testo: "Stai facendo un lavoro eccellente. Continua con la cura attuale e la tua pianta continuerà a prosperare. Il pollice verde ce l'hai già!",
  },
  good: {
    titolo: "Non preoccuparti, ce la farai!",
    testo: "La tua pianta sta bene e, con i piccoli accorgimenti qui sotto, tornerà in forma perfetta in poco tempo. Ricorda: anche i pollici più neri possono diventare verdi con un po' di pratica!",
  },
  fair: {
    titolo: "Un po' di attenzione e migliorerà presto!",
    testo: "La tua pianta sta attraversando un momento difficile, ma niente di irrecuperabile. Segui i consigli qui sotto con costanza e vedrai la differenza in poche settimane.",
  },
  poor: {
    titolo: "La tua pianta ha bisogno di te!",
    testo: "Non è ancora troppo tardi per salvare la tua pianta. Con le cure giuste e un po' di pazienza, molte piante riescono a riprendersi anche da condizioni critiche. Segui attentamente i consigli qui sotto.",
  },
};

const QUICK_INFO: Array<{
  chiave: keyof CareInfo;
  etichetta: string;
  colore: string;
  bg: string;
  icona: React.ReactNode;
}> = [
  {
    chiave: "annaffiatura",
    etichetta: "Acqua",
    colore: "#5b9bd5",
    bg: "rgba(91, 155, 213, 0.12)",
    icona: (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        <path d="M12 4C9 8 6 12 6 16a6 6 0 0 0 12 0c0-4-3-8-6-12z" stroke="#5b9bd5" strokeWidth="2" fill="none" />
        <path d="M12 4C9 8 6 12 6 16a6 6 0 0 0 12 0c0-4-3-8-6-12z" fill="#5b9bd5" opacity="0.12" />
      </svg>
    ),
  },
  {
    chiave: "luce",
    etichetta: "Luce",
    colore: "#f5c542",
    bg: "rgba(245, 197, 66, 0.12)",
    icona: (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        <circle cx="12" cy="12" r="4" stroke="#f5c542" strokeWidth="2" />
        <path
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"
          stroke="#f5c542"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    chiave: "temperatura",
    etichetta: "Temperatura",
    colore: "#e8875a",
    bg: "rgba(232, 135, 90, 0.12)",
    icona: (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        <path
          d="M14 4v8l4 4H6l4-4V4"
          stroke="#e8875a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="9" y1="4" x2="15" y2="4" stroke="#e8875a" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="20" x2="18" y2="20" stroke="#e8875a" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="16" x2="12" y2="20" stroke="#e8875a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    chiave: "umidita",
    etichetta: "Umidità",
    colore: "#7ec8c8",
    bg: "rgba(126, 200, 200, 0.12)",
    icona: (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        <path d="M12 3c-4 3-8 7-8 12a8 8 0 0 0 16 0c0-5-4-9-8-12z" stroke="#7ec8c8" strokeWidth="2" fill="none" />
        <path d="M12 3c-4 3-8 7-8 12a8 8 0 0 0 16 0c0-5-4-9-8-12z" fill="#7ec8c8" opacity="0.08" />
        <path d="M8 16c1 2 3 3 5 3" stroke="#7ec8c8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
];

export function AnalysisResult({
  analisi,
  urlAnteprima,
  onNuovaAnalisi,
  utenteAutenticato,
}: PropsAnalysisResult) {
  const [popupAperto, setPopupAperto] = useState(false);
  const [statoSalvataggio, setStatoSalvataggio] = useState<StatoSalvataggio>("idle");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [traslazione, setTraslazione] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const puntoInizioTrascinamento = useRef({ x: 0, y: 0 });
  const refHaTrascinato = useRef(false);
  const refContenitorePopup = useRef<HTMLDivElement>(null);

  // Chiusura con Escape e reset zoom alla chiusura
  useEffect(() => {
    if (!popupAperto) {
      setZoomLevel(1);
      setTraslazione({ x: 0, y: 0 });
      return;
    }
    const chiudiConEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopupAperto(false);
    };
    document.addEventListener("keydown", chiudiConEscape);
    return () => document.removeEventListener("keydown", chiudiConEscape);
  }, [popupAperto]);

  // Zoom con Ctrl + rotella — listener imperativo per poter chiamare preventDefault
  useEffect(() => {
    if (!popupAperto) return;
    const el = refContenitorePopup.current;
    if (!el) return;
    const gestisciRotella = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      setZoomLevel((prev) => Math.min(5, Math.max(1, prev + delta)));
    };
    el.addEventListener("wheel", gestisciRotella, { passive: false });
    return () => el.removeEventListener("wheel", gestisciRotella);
  }, [popupAperto]);

  const gestisciMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    refHaTrascinato.current = false;
    puntoInizioTrascinamento.current = { x: e.clientX - traslazione.x, y: e.clientY - traslazione.y };
  };

  const gestisciMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    refHaTrascinato.current = true;
    setTraslazione({ x: e.clientX - puntoInizioTrascinamento.current.x, y: e.clientY - puntoInizioTrascinamento.current.y });
  };

  const gestisciMouseUp = () => setIsDragging(false);

  const gestisciDoppioClick = () => {
    setZoomLevel(1);
    setTraslazione({ x: 0, y: 0 });
  };

  const percentualeConfidenza = Math.round(analisi.livelloConfidenza * 100);
  const incoraggiamento = TESTO_INCORAGGIAMENTO[analisi.statoSalute];

  const salvaNellaCollezione = async () => {
    if (statoSalvataggio !== "idle") return;
    setStatoSalvataggio("saving");
    try {
      // Converte il data URL (base64) in File senza fetch, compatibile con tutti i browser
      const [intestazione, base64] = urlAnteprima.split(",");
      const mimeType = intestazione.match(/:(.*?);/)?.[1] ?? "image/jpeg";
      const byteString = atob(base64);
      const arrayBuffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }
      const fileImmagine = new File([arrayBuffer], "foto-pianta.jpg", { type: mimeType });

      const datiForm = new FormData();
      datiForm.append("foto", fileImmagine);
      datiForm.append("datiAnalisi", JSON.stringify(analisi));

      const risposta = await fetch("/api/collezione", { method: "POST", body: datiForm });
      if (risposta.status === 409) {
        setStatoSalvataggio("duplicate");
      } else if (risposta.ok) {
        setStatoSalvataggio("saved");
      } else {
        setStatoSalvataggio("idle");
      }
    } catch (errore) {
      console.error("Errore salvataggio nella collezione:", errore);
      setStatoSalvataggio("idle");
    }
  };

  // Azione immediata: primo consiglio ad alta priorità
  const azioneImmediata = analisi.consigliCura.find((c) => c.priorita === "alta");
  const altriConsigli = analisi.consigliCura.filter((c) => c !== azioneImmediata);

  return (
    <div className="flex flex-col gap-8">

      {/* 1. PLANT HERO — Split card: immagine grande a sinistra, info a destra */}
      <div
        className="flex max-sm:flex-col rounded-2xl overflow-hidden border border-[var(--color-border-light)] shadow-[var(--shadow-lg)] min-h-[320px]"
        style={{ animation: "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {/* Pannello sinistro: immagine pianta */}
        <button
          type="button"
          className="relative flex-none w-[42%] max-sm:w-full max-sm:h-[260px] overflow-hidden group cursor-zoom-in"
          onClick={() => setPopupAperto(true)}
          aria-label="Ingrandisci foto della pianta"
        >
          {/* Foto della pianta — full-bleed */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlAnteprima}
            alt={`Foto analizzata — ${analisi.nomeComune}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Overlay icona zoom */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "rgba(0,0,0,0.25)" }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 drop-shadow-lg">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </div>
        </button>

        {/* Pannello destro: nome e info pianta */}
        <div className="flex-1 bg-[var(--color-bg-card)] p-8 flex flex-col justify-center">
          {/* Badge confidenza in cima */}
          <div
            className="self-start flex items-center gap-1.5 text-sm font-[family-name:var(--font-display)] font-semibold px-3 py-1.5 rounded-full mb-4 whitespace-nowrap"
            style={{
              background: "rgba(47, 79, 47, 0.08)",
              color: "var(--color-primary-700)",
              border: "1px solid var(--color-primary-200)",
            }}
            aria-label={`Confidenza identificazione: ${percentualeConfidenza}%`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5 shrink-0"
              aria-hidden="true"
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
            Confidenza: {percentualeConfidenza}%
          </div>
          <h1 className="font-[family-name:var(--font-display)] font-bold text-3xl max-md:text-2xl text-[var(--color-text-primary)] leading-tight">
            {analisi.nomeComune}
          </h1>
          {analisi.nomeScientifico && (
            <p className="text-base italic text-[var(--color-text-muted)] mt-1">
              {analisi.nomeScientifico}
            </p>
          )}
          {analisi.descrizione && (
            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed mt-4 max-w-[560px]">
              {analisi.descrizione}
            </p>
          )}
        </div>
      </div>

      {/* 2. QUICK INFO */}
      <div
        className="grid grid-cols-4 max-md:grid-cols-2 gap-4"
        style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 100ms both" }}
      >
        {QUICK_INFO.map(({ chiave, etichetta, bg, icona }) => (
          <div
            key={chiave}
            className="text-center py-5 px-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-light)] shadow-[var(--shadow-sm)]"
          >
            <div
              className="w-10 h-10 mx-auto mb-3 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{ background: bg }}
              aria-hidden="true"
            >
              {icona}
            </div>
            <span className="block font-[family-name:var(--font-display)] font-semibold text-xs text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-1">
              {etichetta}
            </span>
            <span className="font-[family-name:var(--font-display)] font-bold text-sm text-[var(--color-text-primary)] leading-snug">
              {analisi.informazioniRapide[chiave]}
            </span>
          </div>
        ))}
      </div>

      {/* 3. HEALTH SECTION */}
      <section
        aria-labelledby="titolo-salute"
        style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 200ms both" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(124, 179, 66, 0.15), rgba(124, 179, 66, 0.05))",
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <circle cx="12" cy="10" r="7" stroke="#7cb342" strokeWidth="2" fill="none" />
              <path d="M12 17v3" stroke="#7cb342" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M9.5 8.5l2 2.5 3.5-4"
                stroke="#7cb342"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2
            id="titolo-salute"
            className="font-[family-name:var(--font-display)] font-bold text-xl text-[var(--color-text-primary)]"
          >
            Stato di salute
          </h2>
        </div>
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded-xl p-6 shadow-[var(--shadow-sm)]">
          <HealthIndicator
            stato={analisi.statoSalute}
            descrizione={analisi.descrizioneSalute}
          />
        </div>
      </section>

      {/* 4. ENCOURAGEMENT BOX */}
      <div
        className="relative rounded-xl border border-[var(--color-primary-200)] p-6 flex items-start gap-4 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 0% 0%, rgba(124, 179, 66, 0.08), transparent 50%), linear-gradient(135deg, var(--color-primary-50), var(--color-cream-100))",
          animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 300ms both",
        }}
      >
        <div
          className="absolute bottom-[-20px] right-[-20px] w-24 h-24 rounded-full opacity-[0.03] bg-[var(--color-primary-400)]"
          aria-hidden="true"
        />
        <div
          className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--color-primary-200), var(--color-primary-100))",
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 28 28" fill="none" className="w-[26px] h-[26px]">
            <path
              d="M14 24c-7-4-10-8-10-12a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 4-3 8-10 12z"
              fill="#6a9e6a"
              opacity="0.4"
              stroke="#4a7c4a"
              strokeWidth="1.5"
            />
            <path
              d="M14 17c-1-0.5-3-2-3-4a1.8 1.8 0 0 1 3-.8 1.8 1.8 0 0 1 3 .8c0 2-2 3.5-3 4z"
              fill="#e8a87a"
              opacity="0.7"
            />
          </svg>
        </div>
        <div>
          <h4 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-primary-700)] mb-2">
            {incoraggiamento.titolo}
          </h4>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {incoraggiamento.testo}
          </p>
        </div>
      </div>

      {/* 5. SALVA NELLA COLLEZIONE */}
      <div
        className="mb-0"
        style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 350ms both" }}
      >
        {!utenteAutenticato ? (
          /* Hint per utente non autenticato */
          <div
            className="flex items-center gap-3 p-4 px-5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(192, 106, 48, 0.06), rgba(192, 106, 48, 0.02))",
              border: "1px solid rgba(192, 106, 48, 0.18)",
            }}
          >
            <div
              className="w-9 h-9 shrink-0 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--color-secondary-200), var(--color-secondary-100))" }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h5 className="font-[family-name:var(--font-display)] font-bold text-sm text-[var(--color-secondary-700)]">
                Vuoi salvare questa analisi?
              </h5>
              <p className="text-xs text-[var(--color-text-muted)] mt-px">
                <a href="/login" className="font-semibold text-[var(--color-secondary-500)] underline underline-offset-2 hover:text-[var(--color-secondary-600)]">Accedi</a>
                {" "}o{" "}
                <a href="/registrazione" className="font-semibold text-[var(--color-secondary-500)] underline underline-offset-2 hover:text-[var(--color-secondary-600)]">crea un account</a>
                {" "}per salvare le piante nella tua collezione personale.
              </p>
            </div>
          </div>
        ) : (
          /* Bottone salva e toast */
          <div>
            <button
              type="button"
              disabled={statoSalvataggio !== "idle"}
              onClick={salvaNellaCollezione}
              className={`
                group relative w-full inline-flex items-center justify-center gap-3
                font-[family-name:var(--font-display)] font-bold text-base
                py-4 px-8 rounded-xl border-2 overflow-hidden
                transition-all duration-[var(--transition-base)]
                ${statoSalvataggio === "idle"
                  ? "border-[var(--color-primary-300)] text-[var(--color-primary-600)] cursor-pointer hover:-translate-y-0.5 hover:border-[var(--color-primary-400)] hover:shadow-[0_4px_20px_rgba(74,124,74,0.18),var(--shadow-glow)] active:scale-[0.98]"
                  : statoSalvataggio === "saving"
                    ? "border-[var(--color-primary-300)] opacity-85 pointer-events-none"
                    : "border-[var(--color-primary-200)] bg-[var(--color-primary-50)] pointer-events-none"
                }
              `}
              style={statoSalvataggio === "idle" ? {
                background: "linear-gradient(135deg, rgba(74, 124, 74, 0.06), rgba(74, 124, 74, 0.02))",
              } : undefined}
            >
              {/* Hover fill overlay (only for idle state) */}
              {statoSalvataggio === "idle" && (
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-base)]"
                  style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <span className={`relative z-10 flex items-center justify-center transition-colors duration-[var(--transition-base)] ${statoSalvataggio === "idle" ? "group-hover:text-white" : ""}`}>
                {statoSalvataggio === "saving" ? (
                  <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]" style={{ animation: "spin-slow 1s linear infinite" }}>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-primary-400)" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-primary-400)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="15 47" />
                  </svg>
                ) : statoSalvataggio === "saved" || statoSalvataggio === "duplicate" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px] group-hover:stroke-white transition-[stroke] duration-[var(--transition-base)]">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                )}
              </span>

              {/* Label */}
              <span className={`relative z-10 transition-colors duration-[var(--transition-base)] ${statoSalvataggio === "idle" ? "group-hover:text-white" : ""} ${(statoSalvataggio === "saved" || statoSalvataggio === "duplicate") ? "text-[var(--color-primary-600)]" : statoSalvataggio === "saving" ? "text-[var(--color-text-muted)]" : ""}`}>
                {statoSalvataggio === "saving"
                  ? "Salvataggio in corso..."
                  : statoSalvataggio === "saved"
                    ? "Salvata nella collezione"
                    : statoSalvataggio === "duplicate"
                      ? "Già nella tua collezione"
                      : (
                        <>
                          Salva nella collezione
                          <span className={`block font-normal text-xs text-[var(--color-text-muted)] mt-px transition-colors duration-[var(--transition-base)] ${statoSalvataggio === "idle" ? "group-hover:text-white/75" : ""}`}>
                            Consultala quando vuoi, senza rifare la foto
                          </span>
                        </>
                      )
                }
              </span>

              {/* Decorative leaf */}
              {statoSalvataggio === "idle" && (
                <svg
                  className="absolute bottom-[-6px] right-[-4px] w-[60px] h-[60px] opacity-[0.08] -rotate-[25deg] pointer-events-none transition-all duration-[var(--transition-slow)] group-hover:opacity-[0.15] group-hover:-rotate-[18deg] group-hover:-translate-x-1 group-hover:-translate-y-1"
                  viewBox="0 0 60 60"
                  fill="var(--color-primary-500)"
                  aria-hidden="true"
                >
                  <path d="M50 5C30 10 10 30 8 52c15-2 30-15 38-30 2-5 4-12 4-17z" />
                </svg>
              )}
            </button>

            {/* Inline toast — successo */}
            {statoSalvataggio === "saved" && (
              <div
                className="relative flex items-center gap-3 mt-3 p-4 px-5 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(74, 158, 74, 0.08), rgba(74, 124, 74, 0.04))",
                  border: "1px solid rgba(74, 158, 74, 0.2)",
                  animation: "toastSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <div
                  className="w-9 h-9 shrink-0 rounded-[var(--radius-md)] flex items-center justify-center shadow-[0_2px_8px_rgba(74,124,74,0.25)]"
                  style={{ background: "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-500))" }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                    <path d="M20 6L9 17l-5-5" style={{ strokeDasharray: 24, strokeDashoffset: 24, animation: "drawCheck 0.4s ease 0.3s forwards" }} />
                  </svg>
                </div>
                <div>
                  <h5 className="font-[family-name:var(--font-display)] font-bold text-sm text-[var(--color-primary-700)]">
                    Fantastico, pianta salvata!
                  </h5>
                  <p className="text-xs text-[var(--color-text-muted)] mt-px">
                    La tua {analisi.nomeComune} ti aspetta nella collezione
                  </p>
                </div>
                {/* Sparkle */}
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ width: 20, height: 20, opacity: 0, animation: "sparkleIn 0.6s ease 0.5s forwards" }}
                  aria-hidden="true"
                >
                  <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" fill="var(--color-primary-400)" opacity="0.5" />
                  <path d="M19 13l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5L15 16l2.5-1z" fill="var(--color-secondary-400)" opacity="0.4" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. CARE SECTION */}
      <section
        aria-labelledby="titolo-cura"
        style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 400ms both" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(74, 124, 74, 0.12), rgba(74, 124, 74, 0.04))",
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M12 22V12" stroke="#4a7c4a" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M12 14c-4-1-7-5-6-10 5.5.5 8 4 8 8"
                fill="#6a9e6a"
                opacity="0.6"
                stroke="#4a7c4a"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M12 12c3-1.5 7-2 9 1.5-4 2.5-7.5 1.5-8.5-1"
                fill="#8eba8e"
                opacity="0.5"
                stroke="#4a7c4a"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2
            id="titolo-cura"
            className="font-[family-name:var(--font-display)] font-bold text-xl text-[var(--color-text-primary)]"
          >
            Piano di cura
          </h2>
        </div>

        {/* Azione immediata (solo se presente un consiglio ad alta priorità) */}
        {azioneImmediata && (
          <div
            className="relative rounded-2xl p-8 mb-6 overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse at 100% 0%, rgba(192, 106, 48, 0.08), transparent 50%), linear-gradient(135deg, var(--color-secondary-50), #fff8f3)",
              border: "2px solid var(--color-secondary-300)",
            }}
          >
            {/* Bordo sinistro accentuato */}
            <div
              className="absolute top-0 left-0 w-1.5 h-full rounded-sm"
              style={{
                background:
                  "linear-gradient(180deg, var(--color-secondary-400), var(--color-secondary-500))",
              }}
              aria-hidden="true"
            />
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 shrink-0 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(192,106,48,0.12)]"
                style={{
                  background:
                    "linear-gradient(145deg, var(--color-secondary-100), var(--color-secondary-50))",
                }}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a35628"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <span
                  className="inline-flex items-center gap-1.5 font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-[0.08em] px-3 py-1 rounded-full mb-1"
                  style={{
                    color: "var(--color-secondary-600)",
                    background: "rgba(192, 106, 48, 0.12)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Da fare subito
                </span>
                <h3
                  className="font-[family-name:var(--font-display)] font-bold text-2xl"
                  style={{ color: "var(--color-secondary-700)" }}
                >
                  {azioneImmediata.titolo}
                </h3>
              </div>
            </div>
            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
              {azioneImmediata.descrizione}
            </p>
          </div>
        )}

        {/* Altri consigli (media/bassa priorità, o tutti se non c'è azione immediata) */}
        {altriConsigli.length > 0 && (
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded-xl overflow-hidden shadow-[var(--shadow-sm)] mb-6">
            <div className="flex items-center gap-3 px-6 py-5 pb-4 border-b border-[var(--color-border-light)]">
              <div
                className="w-[38px] h-[38px] rounded-lg bg-[rgba(74,124,74,0.1)] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4a7c4a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M12 22V12" />
                  <path d="M12 12C10 8 4 4 2 6c0 6 5 10 10 9" />
                  <path d="M12 16c2-3 8-5 10-2-1 5-6 8-10 6" />
                </svg>
              </div>
              <h2 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-text-primary)]">
                {azioneImmediata ? "Altri consigli" : "Consigli personalizzati"}
              </h2>
            </div>
            <div className="px-6 py-5">
              <CareTipsList consigli={altriConsigli} />
            </div>
          </div>
        )}

        {/* Cura quotidiana — care cards */}
        <p className="font-[family-name:var(--font-display)] font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-4">
          Cura quotidiana
        </p>
        <CareInfoGrid informazioni={analisi.informazioniGenerali} />
      </section>

      {/* POPUP ZOOM FOTO */}
      {popupAperto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => { if (!refHaTrascinato.current) setPopupAperto(false); refHaTrascinato.current = false; }}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ingrandita — ${analisi.nomeComune}`}
        >
          {/* Contenitore immagine — intercetta rotella e drag */}
          <div
            ref={refContenitorePopup}
            className="relative select-none overflow-hidden"
            style={{
              animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={gestisciMouseDown}
            onMouseMove={gestisciMouseMove}
            onMouseUp={gestisciMouseUp}
            onMouseLeave={gestisciMouseUp}
            onDoubleClick={gestisciDoppioClick}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlAnteprima}
              alt={`Foto ingrandita — ${analisi.nomeComune}`}
              className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl"
              style={{
                transform: `translate(${traslazione.x}px, ${traslazione.y}px) scale(${zoomLevel})`,
                transformOrigin: "center",
                transition: isDragging ? "none" : "transform 0.12s ease",
                cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
              draggable={false}
            />

            {/* Indicatore livello zoom */}
            {zoomLevel > 1 && (
              <div
                className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-white text-xs font-mono font-semibold pointer-events-none"
                style={{ background: "rgba(0,0,0,0.6)" }}
                aria-live="polite"
                aria-label={`Zoom ${Math.round(zoomLevel * 100)}%`}
              >
                {Math.round(zoomLevel * 100)}%
              </div>
            )}

            {/* Bottone chiudi */}
            <button
              type="button"
              onClick={() => setPopupAperto(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/70"
              style={{ background: "rgba(0,0,0,0.55)" }}
              aria-label="Chiudi anteprima"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Suggerimento comandi */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs whitespace-nowrap pointer-events-none">
            Ctrl + rotella per zoomare · Trascina per spostarti · Doppio clic per resettare
          </p>
        </div>
      )}

      {/* 7. NEW ANALYSIS CTA */}
      <div
        className="text-center py-10"
        style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 500ms both" }}
      >
        <p className="text-[var(--color-text-secondary)] mb-4">
          Hai un&apos;altra pianta che ti preoccupa?
        </p>
        <button
          type="button"
          onClick={onNuovaAnalisi}
          className="inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-base px-8 py-3.5 rounded-full text-white shadow-[0_4px_15px_rgba(74,124,74,0.3)] transition-all duration-[var(--transition-base)] hover:shadow-[0_6px_22px_rgba(74,124,74,0.38)] hover:-translate-y-0.5 active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg, #4a7c4a, #3d663d)" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
            aria-hidden="true"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Analizza un&apos;altra pianta
        </button>
      </div>
    </div>
  );
}
