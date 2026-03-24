"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAnalysis } from "@/hooks/useAnalysis";
import { IndicatoreAnalisi } from "@/components/indicatore-analisi";
import { PannelloErroreAnalisi } from "@/components/pannello-errore-analisi";
import { CameraModal } from "@/components/camera-modal";
import { STRINGA_ACCEPT_INPUT } from "@/lib/image/costanti-validazione";

function formattaDimensioneFile(byte: number): string {
  if (byte < 1024) return `${byte} B`;
  if (byte < 1024 * 1024) return `${(byte / 1024).toFixed(1)} KB`;
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadZone() {
  const {
    fileOriginale,
    fileCompresso,
    urlAnteprima,
    statoProcessamento,
    errore,
    tipoErrore,
    nomeFileRifiutato,
    gestisciSelezioneFile,
    rimuoviFile,
  } = useImageUpload();

  const {
    stato: statoAnalisi,
    errore: erroreAnalisi,
    avviaAnalisi,
    resetta: resettaAnalisi,
  } = useAnalysis();

  const router = useRouter();

  useEffect(() => {
    if (statoAnalisi === "successo") {
      router.push("/analysis");
    }
  }, [statoAnalisi, router]);

  const inputGalleriaRef = useRef<HTMLInputElement>(null);
  const inputFotocameraRef = useRef<HTMLInputElement>(null);
  const dragEnterCounterRef = useRef<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [mostraModalCamera, setMostraModalCamera] = useState(false);
  const [supportaGetUserMedia, setSupportaGetUserMedia] = useState(false);

  useEffect(() => {
    setSupportaGetUserMedia(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia
    );
  }, []);

  const gestisciCambioFile = useCallback(
    (evento: React.ChangeEvent<HTMLInputElement>) => {
      const file = evento.target.files?.[0];
      if (file) {
        gestisciSelezioneFile(file);
      }
      evento.target.value = "";
    },
    [gestisciSelezioneFile],
  );

  const apriGalleria = useCallback(() => {
    inputGalleriaRef.current?.click();
  }, []);

  const apriFotocamera = useCallback(() => {
    if (supportaGetUserMedia) {
      setMostraModalCamera(true);
    } else {
      inputFotocameraRef.current?.click();
    }
  }, [supportaGetUserMedia]);

  const gestisciFotoScattata = useCallback(
    (file: File) => {
      setMostraModalCamera(false);
      gestisciSelezioneFile(file);
    },
    [gestisciSelezioneFile]
  );

  const chiudiModalCamera = useCallback(() => {
    setMostraModalCamera(false);
  }, []);

  const gestisciDragEnter = useCallback((evento: React.DragEvent) => {
    evento.preventDefault();
    evento.stopPropagation();
    dragEnterCounterRef.current += 1;
    setIsDragOver(true);
  }, []);

  const gestisciDragLeave = useCallback((evento: React.DragEvent) => {
    evento.preventDefault();
    evento.stopPropagation();
    dragEnterCounterRef.current -= 1;
    if (dragEnterCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const gestisciDrop = useCallback(
    (evento: React.DragEvent) => {
      evento.preventDefault();
      evento.stopPropagation();
      dragEnterCounterRef.current = 0;
      setIsDragOver(false);
      const file = evento.dataTransfer.files?.[0];
      if (file) {
        gestisciSelezioneFile(file);
      }
    },
    [gestisciSelezioneFile],
  );

  const gestisciDragOver = useCallback((evento: React.DragEvent) => {
    evento.preventDefault();
    evento.stopPropagation();
  }, []);

  const gestisciAnalisi = useCallback(async () => {
    if (!fileCompresso || !urlAnteprima) return;

    await avviaAnalisi(fileCompresso, urlAnteprima);
  }, [fileCompresso, urlAnteprima, avviaAnalisi]);

  const isIdle = statoProcessamento === "idle";
  const isCompressione = statoProcessamento === "compressione";
  const isPronto = statoProcessamento === "pronto";
  const isErrore = statoProcessamento === "errore";

  const classiZona = [
    "relative max-w-[560px] mx-auto border-2 rounded-2xl p-12 px-8 text-center transition-all duration-[var(--transition-base)] animate-scale-in delay-4",
    isErrore
      ? "border-dashed border-[var(--color-accent-400)]"
      : isPronto
        ? "border-solid border-primary-200 cursor-default"
        : isIdle && isDragOver
          ? "border-solid border-primary-500 shadow-[var(--shadow-glow),var(--shadow-md)] -translate-y-[3px] cursor-copy"
          : "border-dashed border-primary-300 cursor-pointer hover:border-primary-400 hover:shadow-[var(--shadow-glow),var(--shadow-md)] hover:-translate-y-[3px]",
  ].join(" ");

  const stileZona = {
    background: isErrore
      ? "radial-gradient(ellipse at 50% 30%, rgba(224, 96, 96, 0.04), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(250, 232, 219, 0.15), transparent 60%), var(--color-bg-card)"
      : isPronto
        ? "radial-gradient(ellipse at 30% 20%, rgba(218, 232, 218, 0.15), transparent 60%), var(--color-bg-card)"
        : isIdle && isDragOver
          ? "radial-gradient(ellipse at 50% 50%, rgba(74, 124, 74, 0.12), transparent 70%), radial-gradient(ellipse at 30% 20%, rgba(218, 232, 218, 0.3), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(250, 232, 219, 0.3), transparent 60%), var(--color-bg-card)"
          : "radial-gradient(ellipse at 30% 20%, rgba(218, 232, 218, 0.2), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(250, 232, 219, 0.2), transparent 60%), var(--color-bg-card)",
  };

  return (
    <>
      {mostraModalCamera && (
        <CameraModal
          onFotoScattata={gestisciFotoScattata}
          onChiudi={chiudiModalCamera}
        />
      )}
    <section className="py-4 pb-16" id="upload">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)]">
        {/* Hidden file inputs */}
        <input
          ref={inputGalleriaRef}
          type="file"
          accept={STRINGA_ACCEPT_INPUT}
          onChange={gestisciCambioFile}
          className="sr-only"
          aria-label="Seleziona foto dalla galleria"
          data-testid="input-galleria"
        />
        <input
          ref={inputFotocameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={gestisciCambioFile}
          className="sr-only"
          aria-label="Scatta una foto"
          data-testid="input-fotocamera"
        />

        <div
          className={classiZona}
          style={stileZona}
          role={isIdle ? "button" : undefined}
          tabIndex={isIdle ? 0 : undefined}
          aria-label="Area di caricamento foto"
          onDragEnter={gestisciDragEnter}
          onDragLeave={gestisciDragLeave}
          onDrop={gestisciDrop}
          onDragOver={gestisciDragOver}
          onClick={isIdle ? apriGalleria : undefined}
          onKeyDown={isIdle ? (e) => { if (e.key === "Enter" || e.key === " ") apriGalleria(); } : undefined}
        >
          {/* STATE: Idle — upload prompt */}
          {isIdle && (
            <div className="flex flex-col items-center">
              {/* Upload icon with spinning ring */}
              <div className="w-24 h-24 mx-auto mb-5 relative">
                <div
                  className="absolute inset-0 border-2 border-dashed border-primary-200 rounded-full"
                  style={{ animation: "spin-slow 20s linear infinite" }}
                />
                <svg viewBox="0 0 60 60" fill="none" className="relative z-10 w-full h-full p-[18px]">
                  <circle cx="30" cy="30" r="24" fill="url(#upload-bg)" opacity="0.15" />
                  <path d="M30 40V28" stroke="#4a7c4a" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M25 33l5-5 5 5" stroke="#4a7c4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M30 28c-3-0.5-7-2-8-7 4 0 7 2 8 5.5" fill="#6a9e6a" opacity="0.6" />
                  <path d="M30 28c3-1 6.5-4 5.5-8-3.5 1-5.5 4-5.5 7" fill="#8eba8e" opacity="0.5" />
                  <rect x="18" y="40" width="24" height="2" rx="1" fill="#4a7c4a" opacity="0.2" />
                  <defs>
                    <radialGradient id="upload-bg" cx="30" cy="30" r="24">
                      <stop stopColor="#6a9e6a" />
                      <stop offset="1" stopColor="#6a9e6a" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              <p className="font-[family-name:var(--font-display)] font-bold text-xl text-[var(--color-text-primary)] mb-2">
                Trascina qui la foto della tua pianta
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                oppure scegli un&apos;opzione
              </p>

              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); apriGalleria(); }}
                  className="inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-base px-6 py-3 rounded-full text-white bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_4px_15px_rgba(74,124,74,0.3)] transition-all duration-[var(--transition-base)] hover:from-primary-400 hover:to-primary-500 hover:shadow-[0_6px_22px_rgba(74,124,74,0.38)] hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Scegli dalla galleria
                </button>

                <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-3 w-full max-w-[280px]">
                  <span className="flex-1 h-px bg-[var(--color-border)]" />
                  oppure
                  <span className="flex-1 h-px bg-[var(--color-border)]" />
                </span>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); apriFotocamera(); }}
                  className="inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-base px-6 py-3 rounded-full text-primary-600 bg-cream-100 border-2 border-primary-200 transition-all duration-[var(--transition-base)] hover:bg-primary-50 hover:border-primary-400 hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Scatta una foto
                </button>
              </div>

              <p className="text-xs text-[var(--color-text-muted)] mt-4">
                JPEG, PNG, WebP — max 10 MB
              </p>
            </div>
          )}

          {/* STATE: Compressing */}
          {isCompressione && (
            <div
              className="flex flex-col items-center gap-4"
              aria-live="polite"
              aria-label="Compressione immagine in corso"
            >
              <div className="w-20 h-20 relative">
                <div
                  className="absolute inset-0 border-3 border-primary-100 border-t-primary-500 rounded-full"
                  style={{ animation: "spin-slow 1.2s linear infinite" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" style={{ animation: "pulse-gentle 1.5s ease-in-out infinite" }}>
                    <path d="M16 4c-5 2-10 8-8 16 5-1 8-6 9-14" fill="#6a9e6a" opacity="0.7" />
                    <path d="M16 4c5 3 9 9 6 17-4-2-7-8-6-15" fill="#4a7c4a" opacity="0.5" />
                    <path d="M16 4v22" stroke="#4a7c4a" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                  </svg>
                </div>
              </div>
              <p className="font-[family-name:var(--font-display)] font-semibold text-[var(--color-text-primary)]">
                Ottimizzazione in corso...
              </p>
              <div className="w-[200px] h-1.5 bg-primary-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-[width] duration-300"
                  style={{ width: "60%", animation: "pulse-gentle 1.5s ease-in-out infinite" }}
                />
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Comprimo l&apos;immagine per un caricamento veloce
              </p>
            </div>
          )}

          {/* STATE: Analisi in corso */}
          {isPronto && statoAnalisi === "caricamento" && (
            <IndicatoreAnalisi />
          )}

          {/* STATE: Preview */}
          {isPronto && statoAnalisi !== "caricamento" && urlAnteprima && (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[360px]">
                {/* Image frame */}
                <div className="relative w-full aspect-[4/3] max-md:aspect-square max-md:max-w-[280px] max-md:mx-auto rounded-xl overflow-hidden shadow-lg mb-5 bg-cream-200">
                  <img
                    src={urlAnteprima}
                    alt="Anteprima foto pianta"
                    className="w-full h-full object-cover"
                  />
                  {/* Vignette overlay */}
                  <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_40px_rgba(44,62,44,0.06)] pointer-events-none" />
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={rimuoviFile}
                    className="absolute top-3 right-3 w-9 h-9 bg-[rgba(44,62,44,0.6)] text-white border-2 border-[rgba(255,255,255,0.3)] rounded-full flex items-center justify-center transition-all duration-[var(--transition-fast)] hover:bg-[rgba(224,96,96,0.8)] hover:border-[rgba(255,255,255,0.6)] hover:scale-110 backdrop-blur-sm z-10"
                    aria-label="Rimuovi foto selezionata"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>

                {/* File info */}
                <div className="flex items-center gap-3 p-3 px-4 bg-cream-50 border border-[var(--color-border-light)] rounded-lg mb-5 flex-wrap">
                  <div className="w-9 h-9 bg-primary-50 rounded-md flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4a7c4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-display)] font-semibold text-sm text-[var(--color-text-primary)] truncate">
                      {fileOriginale?.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {fileCompresso ? formattaDimensioneFile(fileCompresso.size) : ""}
                    </p>
                  </div>
                  {fileOriginale && fileCompresso && fileCompresso.size < fileOriginale.size && (
                    <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold text-primary-600 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                      <svg viewBox="0 0 12 12" fill="none" stroke="#4a7c4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                        <polyline points="2.5 6 5 8.5 9.5 3.5" />
                      </svg>
                      Compressa
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full max-md:flex-col">
                  <button
                    type="button"
                    onClick={apriGalleria}
                    aria-label="Cambia foto selezionata"
                    className="flex-1 inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-base px-6 py-3 rounded-full text-primary-600 bg-cream-100 border-2 border-primary-200 transition-all duration-[var(--transition-base)] hover:bg-primary-50 hover:border-primary-400 hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 4v6h6" /><path d="M23 20v-6h-6" />
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                    Cambia
                  </button>
                  <button
                    type="button"
                    onClick={gestisciAnalisi}
                    className="flex-1 relative inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-base px-6 py-3 rounded-full text-white bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_4px_15px_rgba(74,124,74,0.3)] transition-all duration-[var(--transition-base)] hover:from-primary-400 hover:to-primary-500 hover:shadow-[0_6px_22px_rgba(74,124,74,0.38)] hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    Analizza ora
                  </button>
                </div>

                {/* Errore analisi con pannello dedicato */}
                {erroreAnalisi && (
                  <div className="mt-4">
                    <PannelloErroreAnalisi
                      errore={erroreAnalisi}
                      onRiprova={resettaAnalisi}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATE: Error */}
          {isErrore && errore && (
            <div className="flex flex-col items-center gap-4" role="alert">
              {/* Error icon */}
              <div className="w-20 h-20 max-md:w-16 max-md:h-16 relative">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(224, 96, 96, 0.1), rgba(224, 96, 96, 0.03))",
                    animation: "pulse-gentle 2s ease-in-out infinite",
                  }}
                />
                <svg viewBox="0 0 60 60" fill="none" className="relative z-10 w-full h-full p-[18px]">
                  <circle cx="30" cy="30" r="22" stroke="#e06060" strokeWidth="2" strokeDasharray="4 3" opacity="0.3" />
                  <path d="M30 42V26" stroke="#c94a4a" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M30 28c-4 0-9-3-9-9 5 0 9 3 10 8" fill="#e06060" opacity="0.4" />
                  <path d="M30 26c3-1 7-5 5-10-3 1-5.5 5-5.5 9" fill="#c94a4a" opacity="0.3" />
                  <path d="M22 22c-1 3-3 5-2 5" stroke="#e06060" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
                  <path d="M37 19c1 2 2 5 1 5" stroke="#c94a4a" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
                </svg>
              </div>

              <p className="font-[family-name:var(--font-display)] font-bold text-lg text-[var(--color-accent-600)]">
                {tipoErrore === "formato" ? "Formato non supportato" : tipoErrore === "dimensione" ? "File troppo grande" : "Errore"}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-[320px] text-center leading-relaxed">
                {errore}
              </p>

              {nomeFileRifiutato && (
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-accent-600)] bg-[rgba(224,96,96,0.08)] border border-[rgba(224,96,96,0.2)] px-3 py-1 rounded-full">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                  {nomeFileRifiutato}
                </span>
              )}

              {tipoErrore === "formato" && (
                <div className="text-xs text-[var(--color-text-muted)] bg-cream-100 p-3 px-4 rounded-lg border-l-[3px] border-[var(--color-secondary-300)] text-left max-w-[320px] w-full leading-relaxed">
                  <strong className="text-[var(--color-text-secondary)]">Formati accettati:</strong> JPEG, PNG, WebP<br />
                  Scatta una foto o seleziona un&apos;immagine dalla galleria.
                </div>
              )}

              {tipoErrore === "dimensione" && (
                <div className="text-xs text-[var(--color-text-muted)] bg-cream-100 p-3 px-4 rounded-lg border-l-[3px] border-[var(--color-secondary-300)] text-left max-w-[320px] w-full leading-relaxed">
                  <strong className="text-[var(--color-text-secondary)]">Suggerimento:</strong> prova a ridimensionare l&apos;immagine prima di caricarla, oppure scatta una nuova foto a risoluzione standard.
                </div>
              )}

              <button
                type="button"
                onClick={rimuoviFile}
                aria-label="Riprova a caricare una foto"
                className="inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-base px-6 py-3 rounded-full text-white bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_4px_15px_rgba(74,124,74,0.3)] transition-all duration-[var(--transition-base)] hover:from-primary-400 hover:to-primary-500 hover:shadow-[0_6px_22px_rgba(74,124,74,0.38)] hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Riprova
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
    </>
  );
}
