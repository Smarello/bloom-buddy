export function HowItWorks() {
  return (
    <section className="py-16 relative" id="how">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)]">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-3xl text-[var(--color-text-primary)] animate-fade-in-up">
            Come funziona
          </h2>
          <p className="max-w-[460px] mx-auto mt-3 text-[var(--color-text-secondary)] animate-fade-in-up delay-1">
            Tre semplici passi per prenderti cura delle tue piante come un esperto.
          </p>
        </div>

        {/* Steps ribbon */}
        <div className="flex gap-5 relative max-md:flex-col max-md:max-w-[380px] max-md:mx-auto">
          {/* Connector line (desktop only) */}
          <div
            className="absolute top-[56px] left-[80px] right-[80px] h-[2px] z-0 max-md:hidden"
            style={{
              background:
                "repeating-linear-gradient(90deg, var(--color-primary-200) 0px, var(--color-primary-200) 8px, transparent 8px, transparent 14px)",
            }}
          />

          {/* Step 1 */}
          <div className="flex-1 text-center p-6 px-5 pb-8 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-light)] relative z-10 transition-all duration-[var(--transition-base)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)] hover:border-primary-200 animate-fade-in-up delay-2">
            <div className="w-20 h-20 mx-auto mb-5 relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(145deg, rgba(74, 124, 74, 0.1), rgba(218, 232, 218, 0.3))",
                }}
              />
              <span className="absolute -top-1 -right-1 w-[26px] h-[26px] bg-[var(--color-bg-card)] border-2 border-primary-400 rounded-full flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-xs text-primary-600 z-20">
                1
              </span>
              <svg viewBox="0 0 44 44" fill="none" className="relative z-10 w-full h-full p-[18px]">
                <rect x="6" y="12" width="32" height="22" rx="4" stroke="#4a7c4a" strokeWidth="2.2" fill="none" />
                <path d="M15 12l2-4h10l2 4" stroke="#4a7c4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="22" cy="23" r="6" stroke="#4a7c4a" strokeWidth="2" fill="none" />
                <path d="M22 21c-1.5-0.5-3.5-2-3-4.5 2 0 3.5 1.5 3.5 3.5" fill="#8eba8e" />
                <path d="M22 21c1.5-0.8 3.5-1 4.5 0.5-1.5 1-3.5 0.8-4-.3" fill="#6a9e6a" />
                <circle cx="31" cy="16" r="1.3" fill="#e8a87a" />
              </svg>
            </div>
            <h4 className="font-[family-name:var(--font-display)] font-bold text-xl mb-2 text-[var(--color-text-primary)]">
              Scatta una foto
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Fotografa la tua pianta direttamente dall&apos;app o carica un&apos;immagine dalla galleria.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex-1 text-center p-6 px-5 pb-8 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-light)] relative z-10 transition-all duration-[var(--transition-base)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)] hover:border-primary-200 animate-fade-in-up delay-4">
            <div className="w-20 h-20 mx-auto mb-5 relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(145deg, rgba(192, 106, 48, 0.08), rgba(250, 232, 219, 0.3))",
                }}
              />
              <span className="absolute -top-1 -right-1 w-[26px] h-[26px] bg-[var(--color-bg-card)] border-2 border-primary-400 rounded-full flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-xs text-primary-600 z-20">
                2
              </span>
              <svg viewBox="0 0 44 44" fill="none" className="relative z-10 w-full h-full p-[18px]">
                <circle cx="19" cy="19" r="10" stroke="#c06a30" strokeWidth="2.2" fill="none" />
                <line x1="26.5" y1="26.5" x2="36" y2="36" stroke="#c06a30" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M19 15c-2 0-5 2-4.5 6 3-0.5 5-2.5 5.5-5" fill="#6a9e6a" opacity="0.7" />
                <path d="M19 15c2 0.5 4 2.5 3.5 5.5-2.5-0.5-4-2-4.2-4.5" fill="#8eba8e" opacity="0.6" />
                <path d="M19 15v4" stroke="#4a7c4a" strokeWidth="0.7" opacity="0.5" />
                <circle cx="14" cy="12" r="1" fill="#e8a87a" opacity="0.7" />
                <circle cx="26" cy="14" r="0.8" fill="#e8a87a" opacity="0.5" />
              </svg>
            </div>
            <h4 className="font-[family-name:var(--font-display)] font-bold text-xl mb-2 text-[var(--color-text-primary)]">
              Analisi intelligente
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              La nostra AI identifica la specie, valuta lo stato di salute e individua eventuali problemi.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex-1 text-center p-6 px-5 pb-8 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-light)] relative z-10 transition-all duration-[var(--transition-base)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)] hover:border-primary-200 animate-fade-in-up delay-6">
            <div className="w-20 h-20 mx-auto mb-5 relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(145deg, rgba(124, 179, 66, 0.1), rgba(218, 232, 218, 0.3))",
                }}
              />
              <span className="absolute -top-1 -right-1 w-[26px] h-[26px] bg-[var(--color-bg-card)] border-2 border-primary-400 rounded-full flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-xs text-primary-600 z-20">
                3
              </span>
              <svg viewBox="0 0 44 44" fill="none" className="relative z-10 w-full h-full p-[18px]">
                <rect x="10" y="6" width="24" height="32" rx="3" stroke="#6a9e6a" strokeWidth="2" fill="none" />
                <rect x="16" y="3" width="12" height="6" rx="2" fill="#6a9e6a" opacity="0.2" stroke="#6a9e6a" strokeWidth="1.5" />
                <path d="M15 17l2.5 2.5L22 15" stroke="#7cb342" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="25" y1="17" x2="30" y2="17" stroke="#b8d4b8" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M15 25l2.5 2.5L22 23" stroke="#7cb342" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="25" y1="25" x2="30" y2="25" stroke="#b8d4b8" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M22 32c0 0-3-1.5-3-3.5a1.8 1.8 0 0 1 3-1.3 1.8 1.8 0 0 1 3 1.3c0 2-3 3.5-3 3.5" fill="#e8a87a" opacity="0.6" />
              </svg>
            </div>
            <h4 className="font-[family-name:var(--font-display)] font-bold text-xl mb-2 text-[var(--color-text-primary)]">
              Consigli su misura
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Ricevi un piano di cura personalizzato con istruzioni chiare e facili da seguire.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
