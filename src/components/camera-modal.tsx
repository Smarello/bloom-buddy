"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface CameraModalProps {
  onFotoScattata: (file: File) => void;
  onChiudi: () => void;
}

export function CameraModal({ onFotoScattata, onChiudi }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [pronta, setPronta] = useState(false);

  useEffect(() => {
    const avviaCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setErrore(
          "Impossibile accedere alla fotocamera. Verifica i permessi del browser."
        );
      }
    };

    avviaCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const gestisciVideoReady = useCallback(() => {
    setPronta(true);
  }, []);

  const scattaFoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `foto_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        onFotoScattata(file);
      },
      "image/jpeg",
      0.92
    );
  }, [onFotoScattata]);

  const chiudi = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    onChiudi();
  }, [onChiudi]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" role="dialog" aria-label="Fotocamera">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60">
        <button
          type="button"
          onClick={chiudi}
          className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Chiudi fotocamera"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <span className="text-white text-sm font-medium font-[family-name:var(--font-display)]">
          Scatta una foto
        </span>
        <div className="w-10" />
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {!errore && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={gestisciVideoReady}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Mirino overlay */}
        {pronta && !errore && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[72%] aspect-square max-w-[320px]">
              <div className="relative w-full h-full">
                {/* Angoli del mirino */}
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((classi, i) => (
                  <div key={i} className={`absolute w-8 h-8 border-white/70 ${classi}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {!pronta && !errore && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/70 text-sm">Avvio fotocamera...</p>
          </div>
        )}

        {/* Errore */}
        {errore && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <p className="text-white/80 text-sm leading-relaxed">{errore}</p>
            <button
              type="button"
              onClick={chiudi}
              className="mt-2 px-5 py-2.5 rounded-full bg-white/15 text-white text-sm font-medium border border-white/20 hover:bg-white/25 transition-colors"
            >
              Chiudi
            </button>
          </div>
        )}
      </div>

      {/* Shutter area */}
      <div className="bg-black px-8 py-6 flex items-center justify-center">
        <button
          type="button"
          onClick={scattaFoto}
          disabled={!pronta || !!errore}
          aria-label="Scatta foto"
          className="w-18 h-18 rounded-full bg-white disabled:opacity-30 transition-all active:scale-90 shadow-lg flex items-center justify-center"
          style={{ width: "72px", height: "72px" }}
        >
          <div className="w-14 h-14 rounded-full border-4 border-black/10 bg-white" />
        </button>
      </div>

      {/* Canvas nascosto per catturare il frame */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
