"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { HealthStatus, PlantAnalysis } from "@/types/analysis";
import type { CareInfo } from "@/types/analysis";
import type { DiagnosiDettagliata } from "@/types/analysis";
import { HealthIndicator } from "./health-indicator";
import { CareTipsList } from "./care-tips-list";
import { CareInfoGrid } from "./care-info-grid";
import { CardDiagnosiDettagliata } from "./card-diagnosi-dettagliata";
import { SelettoreCollezione, type SelezioneCollezione, type CollezioneListItem } from "./selettore-collezione";
import { normalizzaNome } from "@/lib/collezione/normalizzazione";

type StatoSalvataggio = "idle" | "saving" | "saved" | "duplicate" | "error";

interface PropsAnalysisResult {
  analisi: PlantAnalysis;
  urlAnteprima: string;
  onNuovaAnalisi: () => void;
  utenteAutenticato: boolean;
  giaSalvata?: boolean;
  collezioneId?: string;
}

const COLORE_BORDO_SALUTE: Record<HealthStatus, string> = {
  excellent: "var(--color-health-excellent)",
  good: "var(--color-health-good)",
  fair: "var(--color-secondary-400)",
  poor: "var(--color-health-poor)",
};

const BG_SALUTE: Record<HealthStatus, string> = {
  excellent: "rgba(74, 158, 74, 0.04)",
  good: "rgba(124, 179, 66, 0.04)",
  fair: "rgba(232, 168, 122, 0.04)",
  poor: "rgba(224, 96, 96, 0.04)",
};

const QUICK_INFO: Array<{
  chiave: keyof CareInfo;
  etichetta: string;
  colore: string;
  bg: string;
  borderTop: string;
  icona: React.ReactNode;
}> = [
  {
    chiave: "annaffiatura",
    etichetta: "Acqua",
    colore: "#5b9bd5",
    bg: "rgba(91, 155, 213, 0.12)",
    borderTop: "linear-gradient(90deg, #5b9bd5, #7eb8e8)",
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
    borderTop: "linear-gradient(90deg, #f5c542, #f7d872)",
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
    borderTop: "linear-gradient(90deg, #e8875a, #f0a880)",
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
    borderTop: "linear-gradient(90deg, #7ec8c8, #a0dada)",
    icona: (
      <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]">
        <path d="M12 3c-4 3-8 7-8 12a8 8 0 0 0 16 0c0-5-4-9-8-12z" stroke="#7ec8c8" strokeWidth="2" fill="none" />
        <path d="M12 3c-4 3-8 7-8 12a8 8 0 0 0 16 0c0-5-4-9-8-12z" fill="#7ec8c8" opacity="0.08" />
        <path d="M8 16c1 2 3 3 5 3" stroke="#7ec8c8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
];

interface SezioneNav {
  id: string;
  etichetta: string;
}

export function AnalysisResult({
  analisi,
  urlAnteprima,
  onNuovaAnalisi,
  utenteAutenticato,
  giaSalvata = false,
  collezioneId,
}: PropsAnalysisResult) {
  const router = useRouter();
  const [popupAperto, setPopupAperto] = useState(false);
  const [statoSalvataggio, setStatoSalvataggio] = useState<StatoSalvataggio>("idle");
  const [selettoreAperto, setSelettoreAperto] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [traslazione, setTraslazione] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const puntoInizioTrascinamento = useRef({ x: 0, y: 0 });
  const refHaTrascinato = useRef(false);
  const refContenitorePopup = useRef<HTMLDivElement>(null);

  // Collezioni suggerite (shortcut salvataggio rapido)
  const [collezioniSuggerite, setCollezioniSuggerite] = useState<CollezioneListItem[]>([]);
  const [collezioniUtente, setCollezioniUtente] = useState<CollezioneListItem[] | undefined>();

  useEffect(() => {
    if (!utenteAutenticato || giaSalvata) return;

    const controller = new AbortController();

    fetch("/api/collezione/lista", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((dati) => {
        const tutteCollezioni: CollezioneListItem[] = dati.collezioni;
        setCollezioniUtente(tutteCollezioni);

        const nomeSciNorm = analisi.nomeScientifico
          ? normalizzaNome(analisi.nomeScientifico)
          : null;
        const nomeComuneNorm = normalizzaNome(analisi.nomeComune);

        const compatibili = tutteCollezioni.filter((c) => {
          if (nomeSciNorm && c.nomeScientifico && normalizzaNome(c.nomeScientifico) === nomeSciNorm) {
            return true;
          }
          return normalizzaNome(c.nome) === nomeComuneNorm;
        });

        setCollezioniSuggerite(compatibili);
      })
      .catch(() => {
        // Fallback silenzioso: lo shortcut non appare
      });

    return () => controller.abort();
  }, [utenteAutenticato, giaSalvata, analisi.nomeScientifico, analisi.nomeComune]);

  // Touch zoom state
  const refDistanzaIniziale = useRef(0);
  const refZoomIniziale = useRef(1);
  const refTouchTraslazione = useRef({ x: 0, y: 0 });

  // Mini-nav: sezione attiva via IntersectionObserver
  const [sezioneAttiva, setSezioneAttiva] = useState("sezione-identificazione");
  const [navScrolled, setNavScrolled] = useState(false);

  const diagnosiDettagliate = analisi.diagnosi?.filter(
    (d): d is DiagnosiDettagliata => d.categoria !== "ottimizzazione" && "cosaVedo" in d
  ) ?? [];

  const sezioniNav: SezioneNav[] = [
    { id: "sezione-identificazione", etichetta: "Pianta" },
    { id: "sezione-salute", etichetta: "Salute" },
    { id: "sezione-cosa-fare", etichetta: "Cosa fare" },
    ...(diagnosiDettagliate.length > 0 ? [{ id: "sezione-approfondimento", etichetta: "Approfondimento" }] : []),
    { id: "sezione-cura", etichetta: "Cura" },
  ];

  // IntersectionObserver per mini-nav
  useEffect(() => {
    const ids = sezioniNav.map((s) => s.id);
    const elementi = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elementi.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSezioneAttiva(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    for (const el of elementi) observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagnosiDettagliate.length]);

  // Nav shadow on scroll
  useEffect(() => {
    const gestisciScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", gestisciScroll, { passive: true });
    return () => window.removeEventListener("scroll", gestisciScroll);
  }, []);

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

  // Zoom con Ctrl + rotella
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

  // Touch: pinch-to-zoom e pan
  useEffect(() => {
    if (!popupAperto) return;
    const el = refContenitorePopup.current;
    if (!el) return;

    const gestisciTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        refDistanzaIniziale.current = Math.hypot(dx, dy);
        refZoomIniziale.current = zoomLevel;
      } else if (e.touches.length === 1 && zoomLevel > 1) {
        refTouchTraslazione.current = {
          x: e.touches[0].clientX - traslazione.x,
          y: e.touches[0].clientY - traslazione.y,
        };
      }
    };

    const gestisciTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distanza = Math.hypot(dx, dy);
        const rapporto = distanza / refDistanzaIniziale.current;
        setZoomLevel(Math.min(5, Math.max(1, refZoomIniziale.current * rapporto)));
      } else if (e.touches.length === 1 && zoomLevel > 1) {
        setTraslazione({
          x: e.touches[0].clientX - refTouchTraslazione.current.x,
          y: e.touches[0].clientY - refTouchTraslazione.current.y,
        });
      }
    };

    el.addEventListener("touchstart", gestisciTouchStart, { passive: false });
    el.addEventListener("touchmove", gestisciTouchMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", gestisciTouchStart);
      el.removeEventListener("touchmove", gestisciTouchMove);
    };
  }, [popupAperto, zoomLevel, traslazione]);

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
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setTraslazione({ x: 0, y: 0 });
    } else {
      setZoomLevel(2);
    }
  };

  const percentualeConfidenza = Math.round(analisi.livelloConfidenza * 100);

  const salvaNellaCollezione = async (collezioneIdSelezionato?: string | null, nomeCollezione?: string) => {
    if (statoSalvataggio !== "idle" && statoSalvataggio !== "error") return;
    setStatoSalvataggio("saving");
    try {
      const [intestazione, base64] = urlAnteprima.split(",");
      const mimeType = intestazione.match(/:(.*?);/)?.[1] ?? "image/jpeg";
      const byteString = atob(base64);
      const arrayBuffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }
      const fileImmagine = new File([arrayBuffer], "foto-pianta.jpg", { type: mimeType });

      const idCollezioneFinale = collezioneIdSelezionato ?? collezioneId;

      const datiForm = new FormData();
      datiForm.append("foto", fileImmagine);
      datiForm.append("datiAnalisi", JSON.stringify(analisi));
      if (idCollezioneFinale) {
        datiForm.append("collezioneId", idCollezioneFinale);
      }
      if (nomeCollezione) {
        datiForm.append("nomeCollezione", nomeCollezione);
      }

      const risposta = await fetch("/api/collezione", { method: "POST", body: datiForm });
      if (risposta.ok) {
        setStatoSalvataggio("saved");
        const datiRisposta = await risposta.json();
        if (idCollezioneFinale || datiRisposta.collezioneId) {
          router.push(`/collezione/${idCollezioneFinale || datiRisposta.collezioneId}`);
        }
      } else {
        setStatoSalvataggio("error");
      }
    } catch (errore) {
      console.error("Errore salvataggio nella collezione:", errore);
      setStatoSalvataggio("error");
    }
  };

  const gestisciSelezioneCollezione = (selezione: SelezioneCollezione) => {
    if (selezione.tipo === "esistente") {
      salvaNellaCollezione(selezione.collezioneId);
    } else {
      salvaNellaCollezione(null, selezione.nomeCollezione);
    }
  };

  // Aggregazione azioni: diagnosi cosaFare + consigliCura
  const azioniDaDiagnosi = diagnosiDettagliate.flatMap((d) =>
    d.cosaFare.split("\n").map((riga) => riga.trim()).filter((riga) => riga.length > 0).map((azione) => ({
      testo: azione,
      origine: d.titolo,
      categoria: d.categoria,
    }))
  );

  const piantaSana = analisi.statoSalute === "excellent" || analisi.statoSalute === "good";

  const scrollAllaSezione = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="flex flex-col gap-8">

      {/* MINI-NAV STICKY */}
      <nav
        className={`nav-analisi -mx-6 max-md:-mx-4 px-6 max-md:px-4 py-2.5 ${navScrolled ? "scrolled" : ""}`}
        aria-label="Navigazione sezioni analisi"
      >
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {sezioniNav.map((sez) => (
            <button
              key={sez.id}
              type="button"
              className={`nav-analisi-pill font-[family-name:var(--font-display)] ${sezioneAttiva === sez.id ? "active" : ""}`}
              onClick={() => scrollAllaSezione(sez.id)}
            >
              {sez.etichetta}
            </button>
          ))}
        </div>
      </nav>

      {/* 1. PLANT HERO — Split card: immagine grande a sinistra, info a destra */}
      <div
        id="sezione-identificazione"
        className="flex max-sm:flex-col rounded-2xl overflow-hidden border border-[var(--color-border-light)] shadow-[var(--shadow-lg)] min-h-[320px] scroll-mt-16"
        style={{ animation: "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {/* Pannello sinistro: immagine pianta */}
        <button
          type="button"
          className="relative flex-none w-[42%] max-sm:w-full max-sm:h-[260px] overflow-hidden group cursor-zoom-in"
          onClick={() => setPopupAperto(true)}
          aria-label="Ingrandisci foto della pianta"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlAnteprima}
            alt={`Foto analizzata — ${analisi.nomeComune}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
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
          <div
            className="self-start flex items-center gap-1.5 text-sm font-[family-name:var(--font-display)] font-semibold px-3 py-1.5 rounded-full mb-4 whitespace-nowrap group relative"
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
            {/* Tooltip esplicativo */}
            <span
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 rounded-lg text-xs font-normal text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
              style={{ background: "var(--color-primary-700)" }}
            >
              Quanto siamo sicuri dell&apos;identificazione
            </span>
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

      {/* 2. QUICK INFO — con top border colorato per ogni card */}
      <div
        className="grid grid-cols-4 max-md:grid-cols-2 gap-4"
        style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 100ms both" }}
      >
        {QUICK_INFO.map(({ chiave, etichetta, bg, borderTop, icona }) => (
          <div
            key={chiave}
            className="relative text-center py-5 px-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-light)] shadow-[var(--shadow-sm)] overflow-hidden"
          >
            {/* Top border colorato */}
            <div
              className="absolute top-0 left-4 right-4 h-[3px] rounded-b"
              style={{ background: borderTop }}
              aria-hidden="true"
            />
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

      {/* 3. HEALTH SECTION — con bordo colorato in base allo stato */}
      <section
        id="sezione-salute"
        className="scroll-mt-16"
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
        <div
          className="rounded-xl p-6 shadow-[var(--shadow-sm)] overflow-hidden relative"
          style={{
            background: BG_SALUTE[analisi.statoSalute],
            border: `2px solid ${COLORE_BORDO_SALUTE[analisi.statoSalute]}`,
          }}
        >
          {/* Bordo sinistro colorato per continuità con diagnosi */}
          <div
            className="absolute top-0 left-0 w-1 h-full"
            style={{ background: COLORE_BORDO_SALUTE[analisi.statoSalute] }}
            aria-hidden="true"
          />
          <HealthIndicator
            stato={analisi.statoSalute}
            descrizione={analisi.descrizioneSalute}
          />
        </div>
      </section>

      {/* 3b. COSA FARE — sezione prominente con tono adattivo */}
      <section
        id="sezione-cosa-fare"
        className="scroll-mt-16"
        aria-labelledby="titolo-cosa-fare"
        style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 250ms both" }}
      >
        {/* Header sezione — solo per pianta non sana */}
        {!piantaSana && (
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(192, 106, 48, 0.15), rgba(192, 106, 48, 0.05))",
              }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#a35628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91A6 6 0 016.3 2.53l3.77 3.77z" />
              </svg>
            </div>
            <h2
              id="titolo-cosa-fare"
              className="font-[family-name:var(--font-display)] font-bold text-xl text-[var(--color-text-primary)]"
            >
              Cosa fare
            </h2>
          </div>
        )}

        {/* Azioni dalla diagnosi — per piante non sane */}
        {!piantaSana && azioniDaDiagnosi.length > 0 && (
          <div
            className="relative rounded-2xl p-7 max-sm:p-5 mb-5 overflow-hidden"
            style={{
              background: analisi.statoSalute === "poor"
                ? "radial-gradient(ellipse at 100% 0%, rgba(224, 96, 96, 0.06), transparent 50%), linear-gradient(135deg, #fef5f5, #fffafa)"
                : "radial-gradient(ellipse at 100% 0%, rgba(192, 106, 48, 0.08), transparent 50%), linear-gradient(135deg, var(--color-secondary-50), #fff8f3)",
              border: analisi.statoSalute === "poor"
                ? "2px solid rgba(224, 96, 96, 0.3)"
                : "2px solid var(--color-secondary-300)",
            }}
          >
            {/* Bordo sinistro */}
            <div
              className="absolute top-0 left-0 w-1.5 h-full rounded-sm"
              style={{
                background: analisi.statoSalute === "poor"
                  ? "linear-gradient(180deg, var(--color-accent-400), var(--color-accent-600))"
                  : "linear-gradient(180deg, var(--color-secondary-400), var(--color-secondary-500))",
              }}
              aria-hidden="true"
            />

            {/* Badge urgenza */}
            <span
              className="inline-flex items-center gap-1.5 font-[family-name:var(--font-display)] font-bold text-xs uppercase tracking-[0.08em] px-3 py-1 rounded-full mb-4"
              style={{
                color: analisi.statoSalute === "poor" ? "var(--color-accent-600)" : "var(--color-secondary-600)",
                background: analisi.statoSalute === "poor" ? "rgba(224, 96, 96, 0.12)" : "rgba(192, 106, 48, 0.12)",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              {analisi.statoSalute === "poor" ? "Intervento urgente" : "Da fare subito"}
            </span>

            {/* Lista azioni numerate */}
            <ol className="flex flex-col gap-3 list-none counter-reset-[azione]" data-testid="lista-azioni-diagnosi">
              {azioniDaDiagnosi.map((azione, indice) => (
                <li
                  key={indice}
                  className="flex items-start gap-3"
                >
                  <span
                    className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-xs text-white mt-px"
                    style={{
                      background: analisi.statoSalute === "poor"
                        ? "var(--color-accent-500)"
                        : "var(--color-secondary-500)",
                    }}
                  >
                    {indice + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-[var(--color-text-primary)] leading-relaxed font-medium">
                      {azione.testo}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {azione.origine}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* APPROFONDIMENTO DIAGNOSI — subito dopo le azioni urgenti */}
        {diagnosiDettagliate.length > 0 && (
          <div
            id="sezione-approfondimento"
            className="scroll-mt-16 mb-5"
            data-testid="sezione-diagnosi"
            aria-labelledby="titolo-approfondimento"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(224, 96, 96, 0.12), rgba(224, 96, 96, 0.04))",
                }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path
                    d="M12 2a4 4 0 0 0-4 4v2H7a2 2 0 0 0-2 2v1a7 7 0 0 0 14 0v-1a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4z"
                    stroke="var(--color-accent-500)"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 14l2 2 4-4"
                    stroke="var(--color-accent-500)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3
                  id="titolo-approfondimento"
                  className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-text-primary)]"
                >
                  Approfondimento diagnosi
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Cosa ha osservato l&apos;analisi, cosa significa e cosa aspettarsi
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {diagnosiDettagliate.map((d, indice) => (
                <CardDiagnosiDettagliata key={indice} diagnosi={d} />
              ))}
            </div>
          </div>
        )}

        {/* Consigli di cura — tutti, con tono adattivo */}
        {analisi.consigliCura.length > 0 && (
          <div
            className="rounded-xl overflow-hidden shadow-[var(--shadow-sm)]"
            style={{
              background: piantaSana
                ? "linear-gradient(135deg, rgba(74, 124, 74, 0.03), var(--color-bg-card))"
                : "var(--color-bg-card)",
              border: piantaSana
                ? "1px solid var(--color-primary-200)"
                : "1px solid var(--color-border-light)",
            }}
          >
            <div className="flex items-center gap-3 px-6 py-5 pb-4 border-b border-[var(--color-border-light)]">
              <div
                className="w-[38px] h-[38px] rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: piantaSana ? "rgba(74,124,74,0.1)" : "rgba(192,106,48,0.08)",
                }}
                aria-hidden="true"
              >
                {piantaSana ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4a7c4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M12 22V12" />
                    <path d="M12 12C10 8 4 4 2 6c0 6 5 10 10 9" />
                    <path d="M12 16c2-3 8-5 10-2-1 5-6 8-10 6" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#a35628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                )}
              </div>
              <h3 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-text-primary)]">
                {piantaSana ? "Consigli per mantenerla in salute" : "Altri consigli"}
              </h3>
            </div>
            <div className="px-6 py-5">
              <CareTipsList consigli={analisi.consigliCura} />
            </div>
          </div>
        )}
      </section>

      {/* 5. CURA QUOTIDIANA */}
      <section
        id="sezione-cura"
        className="scroll-mt-16"
        aria-labelledby="titolo-cura"
        style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 350ms both" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(126, 200, 200, 0.12)" }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#7ec8c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h2
            id="titolo-cura"
            className="font-[family-name:var(--font-display)] font-bold text-xl text-[var(--color-text-primary)]"
          >
            Cura quotidiana
          </h2>
        </div>
        <CareInfoGrid informazioni={analisi.informazioniGenerali} />
      </section>

      {/* 5. SALVA NELLA COLLEZIONE */}
      {!giaSalvata && (
      <div
        className="mb-0"
        style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 350ms both" }}
      >
        {!utenteAutenticato ? (
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
          <div>
            {/* Griglia pulsanti salvataggio: shortcut suggeriti + salvataggio generico */}
            {collezioniSuggerite.length > 0 && (statoSalvataggio === "idle" || statoSalvataggio === "error") && !selettoreAperto ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {collezioniSuggerite.map((collezione) => (
                  <button
                    key={collezione.id}
                    type="button"
                    onClick={() => salvaNellaCollezione(collezione.id)}
                    aria-label={`Salva nella collezione ${collezione.nome}`}
                    className="group relative inline-flex items-center justify-center gap-3 font-[family-name:var(--font-display)] font-bold text-base py-4 px-6 rounded-xl border-2 overflow-hidden transition-all duration-[var(--transition-base)] border-[var(--color-primary-400)] text-white cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(74,124,74,0.25),var(--shadow-glow)] active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    }}
                  >
                    {/* Hover brighten overlay */}
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-base)]"
                      style={{ background: "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-500))" }}
                      aria-hidden="true"
                    />

                    {/* Icon */}
                    <span className="relative z-10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]">
                        <path d="M12 3c-2 0-4 2-4 4 0 3 4 5 4 5s4-2 4-5c0-2-2-4-4-4z" />
                        <path d="M12 12v9" />
                        <path d="M9 18c-2 0-4-1-4-3 0-1.5 1.5-3 4-3" />
                        <path d="M15 18c2 0 4-1 4-3 0-1.5-1.5-3-4-3" />
                      </svg>
                    </span>

                    {/* Label */}
                    <span className="relative z-10 flex flex-col items-start leading-tight">
                      <span>Salva in {collezione.nome}</span>
                      <span className="text-xs font-normal opacity-70">{collezione.numeroAnalisi} analisi</span>
                    </span>

                    {/* Decorative leaf */}
                    <svg
                      className="absolute bottom-[-6px] right-[-4px] w-[60px] h-[60px] opacity-[0.12] -rotate-[25deg] pointer-events-none transition-all duration-[var(--transition-slow)] group-hover:opacity-[0.2] group-hover:-rotate-[18deg] group-hover:-translate-x-1 group-hover:-translate-y-1"
                      viewBox="0 0 60 60"
                      fill="white"
                      aria-hidden="true"
                    >
                      <path d="M50 5C30 10 10 30 8 52c15-2 30-15 38-30 2-5 4-12 4-17z" />
                    </svg>
                  </button>
                ))}

                {/* Pulsante salvataggio generico (altra collezione) */}
                <button
                  type="button"
                  onClick={() => collezioneId ? salvaNellaCollezione(collezioneId) : setSelettoreAperto(true)}
                  className="group relative inline-flex items-center justify-center gap-3 font-[family-name:var(--font-display)] font-bold text-base py-4 px-6 rounded-xl border-2 overflow-hidden transition-all duration-[var(--transition-base)] border-[var(--color-primary-300)] text-[var(--color-primary-600)] cursor-pointer hover:-translate-y-0.5 hover:border-[var(--color-primary-400)] hover:shadow-[0_4px_20px_rgba(74,124,74,0.18),var(--shadow-glow)] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, rgba(74, 124, 74, 0.06), rgba(74, 124, 74, 0.02))",
                  }}
                >
                  {/* Hover fill overlay */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-base)]"
                    style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}
                    aria-hidden="true"
                  />

                  <span className="relative z-10 flex items-center justify-center group-hover:text-white transition-colors duration-[var(--transition-base)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px] group-hover:stroke-white transition-[stroke] duration-[var(--transition-base)]">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                  </span>

                  <span className="relative z-10 group-hover:text-white transition-colors duration-[var(--transition-base)]">
                    Altra collezione
                  </span>

                  {/* Decorative leaf */}
                  <svg
                    className="absolute bottom-[-6px] right-[-4px] w-[60px] h-[60px] opacity-[0.08] -rotate-[25deg] pointer-events-none transition-all duration-[var(--transition-slow)] group-hover:opacity-[0.15] group-hover:-rotate-[18deg] group-hover:-translate-x-1 group-hover:-translate-y-1"
                    viewBox="0 0 60 60"
                    fill="var(--color-primary-500)"
                    aria-hidden="true"
                  >
                    <path d="M50 5C30 10 10 30 8 52c15-2 30-15 38-30 2-5 4-12 4-17z" />
                  </svg>
                </button>
              </div>
            ) : (
            <button
              type="button"
              disabled={statoSalvataggio === "saving" || statoSalvataggio === "saved" || statoSalvataggio === "duplicate"}
              onClick={() => collezioneId ? salvaNellaCollezione(collezioneId) : setSelettoreAperto(true)}
              className={`
                group relative w-full inline-flex items-center justify-center gap-3
                font-[family-name:var(--font-display)] font-bold text-base
                py-4 px-8 rounded-xl border-2 overflow-hidden
                transition-all duration-[var(--transition-base)]
                ${statoSalvataggio === "idle" || statoSalvataggio === "error"
                  ? "border-[var(--color-primary-300)] text-[var(--color-primary-600)] cursor-pointer hover:-translate-y-0.5 hover:border-[var(--color-primary-400)] hover:shadow-[0_4px_20px_rgba(74,124,74,0.18),var(--shadow-glow)] active:scale-[0.98]"
                  : statoSalvataggio === "saving"
                    ? "border-[var(--color-primary-300)] opacity-85 pointer-events-none"
                    : "border-[var(--color-primary-200)] bg-[var(--color-primary-50)] pointer-events-none"
                }
              `}
              style={(statoSalvataggio === "idle" || statoSalvataggio === "error") ? {
                background: "linear-gradient(135deg, rgba(74, 124, 74, 0.06), rgba(74, 124, 74, 0.02))",
              } : undefined}
            >
              {/* Hover fill overlay */}
              {(statoSalvataggio === "idle" || statoSalvataggio === "error") && (
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--transition-base)]"
                  style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <span className={`relative z-10 flex items-center justify-center transition-colors duration-[var(--transition-base)] ${(statoSalvataggio === "idle" || statoSalvataggio === "error") ? "group-hover:text-white" : ""}`}>
                {statoSalvataggio === "saving" ? (
                  <svg viewBox="0 0 24 24" fill="none" className="w-[22px] h-[22px]" style={{ animation: "spin-slow 1s linear infinite" }}>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-primary-400)" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-primary-400)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="15 47" />
                  </svg>
                ) : statoSalvataggio === "saved" || statoSalvataggio === "duplicate" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : statoSalvataggio === "error" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px] group-hover:stroke-white transition-[stroke] duration-[var(--transition-base)]">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
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
              <span className={`relative z-10 transition-colors duration-[var(--transition-base)] ${(statoSalvataggio === "idle" || statoSalvataggio === "error") ? "group-hover:text-white" : ""} ${(statoSalvataggio === "saved" || statoSalvataggio === "duplicate") ? "text-[var(--color-primary-600)]" : statoSalvataggio === "saving" ? "text-[var(--color-text-muted)]" : ""}`}>
                {statoSalvataggio === "saving"
                  ? "Salvataggio in corso..."
                  : statoSalvataggio === "saved"
                    ? "Salvata nella collezione"
                    : statoSalvataggio === "duplicate"
                      ? "Già nella tua collezione"
                      : statoSalvataggio === "error"
                        ? "Riprova il salvataggio"
                        : "Salva nella collezione"
                }
              </span>

              {/* Decorative leaf */}
              {(statoSalvataggio === "idle" || statoSalvataggio === "error") && (
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
            )}

            {/* Toast errore */}
            {statoSalvataggio === "error" && (
              <div
                className="relative flex items-center gap-3 mt-3 p-4 px-5 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(224, 96, 96, 0.08), rgba(224, 96, 96, 0.04))",
                  border: "1px solid rgba(224, 96, 96, 0.2)",
                  animation: "toastSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
                role="alert"
              >
                <div
                  className="w-9 h-9 shrink-0 rounded-[var(--radius-md)] flex items-center justify-center shadow-[0_2px_8px_rgba(224,96,96,0.25)]"
                  style={{ background: "linear-gradient(135deg, var(--color-accent-400), var(--color-accent-500))" }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-[family-name:var(--font-display)] font-bold text-sm text-[var(--color-accent-600)]">
                    Salvataggio non riuscito
                  </h5>
                  <p className="text-xs text-[var(--color-text-muted)] mt-px">
                    Qualcosa è andato storto. Premi il bottone per riprovare.
                  </p>
                </div>
              </div>
            )}

            <SelettoreCollezione
              aperto={selettoreAperto}
              onChiudi={() => setSelettoreAperto(false)}
              onSeleziona={gestisciSelezioneCollezione}
              nomePiantaCorrente={analisi.nomeComune}
              nomeScientifico={analisi.nomeScientifico}
              collezioniPrecaricate={collezioniUtente}
            />

            {/* Toast successo */}
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

      {/* POPUP ZOOM FOTO — con supporto touch */}
      {popupAperto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => { if (!refHaTrascinato.current) setPopupAperto(false); refHaTrascinato.current = false; }}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ingrandita — ${analisi.nomeComune}`}
        >
          <div
            ref={refContenitorePopup}
            className="relative select-none overflow-hidden touch-none"
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

          {/* Suggerimento comandi — adattivo desktop/mobile */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs whitespace-nowrap pointer-events-none hidden sm:block">
            Ctrl + rotella per zoomare · Trascina per spostarti · Doppio clic per resettare
          </p>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs whitespace-nowrap pointer-events-none sm:hidden">
            Pizzica per zoomare · Doppio tap per toggle zoom
          </p>
        </div>
      )}
    </div>
  );
}
