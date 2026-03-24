export function UploadZone() {
  return (
    <section className="py-4 pb-16" id="upload">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)]">
        <div
          className="relative max-w-[560px] mx-auto border-2 border-dashed border-primary-300 rounded-2xl p-12 px-8 text-center cursor-pointer transition-all duration-[var(--transition-base)] hover:border-primary-400 hover:shadow-[var(--shadow-glow),var(--shadow-md)] hover:-translate-y-[3px] animate-scale-in delay-4"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(218, 232, 218, 0.2), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(250, 232, 219, 0.2), transparent 60%), var(--color-bg-card)",
          }}
          role="button"
          tabIndex={0}
          aria-label="Area di caricamento foto"
        >
          {/* Upload icon with spinning ring */}
          <div className="w-24 h-24 mx-auto mb-5 relative">
            <div className="absolute inset-0 border-2 border-dashed border-primary-200 rounded-full" style={{ animation: "spin-slow 20s linear infinite" }} />
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

          {/* Action buttons (placeholder — non-functional in US-001) */}
          <div className="flex flex-col items-center gap-3">
            <span className="inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-base px-6 py-3 rounded-full text-white bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_4px_15px_rgba(74,124,74,0.3)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Scegli dalla galleria
            </span>

            {/* Divider */}
            <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-3 w-full max-w-[280px]">
              <span className="flex-1 h-px bg-[var(--color-border)]" />
              oppure
              <span className="flex-1 h-px bg-[var(--color-border)]" />
            </span>

            <span className="inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-base px-6 py-3 rounded-full text-primary-600 bg-cream-100 border-2 border-primary-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Scatta una foto
            </span>
          </div>

          <p className="text-xs text-[var(--color-text-muted)] mt-4">
            JPEG, PNG, WebP — max 10 MB
          </p>
        </div>
      </div>
    </section>
  );
}
