export function HeroSection() {
  return (
    <section className="relative py-16 pb-12 overflow-hidden max-md:py-10 max-md:pb-8">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)]">
        <div className="grid grid-cols-2 gap-12 items-center max-md:grid-cols-1 max-md:text-center">
          {/* Text content */}
          <div>
            <span className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-semibold text-sm text-primary-500 bg-primary-50 border border-primary-200 px-4 py-2 rounded-full mb-5 animate-fade-in-up">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 22V12" />
                <path d="M12 14c-3-1-6-5-5-10 5 0.5 7 4 7 8" />
                <path d="M12 13c3-1.5 7-2 9.5 1-3 2.5-7 1.5-8.5-.5" />
              </svg>
              Nessuna registrazione richiesta
            </span>

            <h1 className="mb-5 text-5xl max-md:text-3xl font-bold font-[family-name:var(--font-display)] leading-tight bg-gradient-to-br from-primary-700 from-20% to-primary-500 to-80% bg-clip-text text-transparent animate-fade-in-up delay-1">
              Scatta una foto,
              <br />
              salva la tua pianta
            </h1>

            <p className="text-lg max-md:text-base text-[var(--color-text-secondary)] leading-relaxed mb-8 max-w-[440px] max-md:mx-auto animate-fade-in-up delay-2">
              Bloom Buddy riconosce le tue piante, capisce come stanno e ti dice
              esattamente cosa fare. Basta una foto.
            </p>

            <div className="flex gap-3 flex-wrap animate-fade-in-up delay-3 max-md:justify-center">
              <a
                href="#upload"
                className="inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-lg px-8 py-4 rounded-full text-white bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_4px_15px_rgba(74,124,74,0.3)] transition-all duration-[var(--transition-base)] hover:from-primary-400 hover:to-primary-500 hover:shadow-[0_6px_22px_rgba(74,124,74,0.38)] hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Analizza la tua pianta
              </a>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-lg px-8 py-4 rounded-full text-primary-600 bg-cream-100 border-2 border-primary-200 transition-all duration-[var(--transition-base)] hover:bg-primary-50 hover:border-primary-400 hover:-translate-y-0.5 active:scale-[0.97]"
              >
                Scopri come funziona
              </a>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative flex items-center justify-center h-[380px] max-md:h-[260px] max-md:order-first animate-scale-in delay-2">
            <HeroBlob />
            {/* Floating botanical elements */}
            <svg
              className="absolute opacity-60 top-[12%] right-[8%]"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              style={{ animation: "float 6s ease-in-out infinite -1s" }}
            >
              <path
                d="M12 3C7 4 3 9 4 16c5-1 9-5 10-11"
                fill="#8eba8e"
                opacity="0.7"
              />
              <path
                d="M6 11c3-1 6 0 8 2"
                stroke="#6a9e6a"
                strokeWidth="0.8"
                fill="none"
              />
            </svg>
            <svg
              className="absolute opacity-60 bottom-[20%] left-[8%]"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{ animation: "float 7s ease-in-out infinite -2.5s" }}
            >
              <circle cx="12" cy="12" r="4" fill="#e8a87a" opacity="0.5" />
              <circle cx="12" cy="12" r="2" fill="#d4864e" opacity="0.4" />
            </svg>
            <svg
              className="absolute opacity-60 top-[55%] right-[2%]"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              style={{ animation: "float 5.5s ease-in-out infinite -3.5s" }}
            >
              <path
                d="M12 4C8 6 6 10 8 15c4-2 6-6 5-10"
                fill="#b8d4b8"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroBlob() {
  return (
    <div
      className="w-[320px] h-[320px] max-md:w-[230px] max-md:h-[230px] flex items-center justify-center relative"
      style={{
        background:
          "linear-gradient(145deg, var(--color-primary-100) 0%, var(--color-cream-200) 50%, var(--color-secondary-100) 100%)",
        animation: "blob-morph 12s ease-in-out infinite",
        boxShadow:
          "inset 0 -20px 40px rgba(74, 124, 74, 0.08), 0 20px 60px rgba(74, 124, 74, 0.1)",
      }}
    >
      <svg
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[55%] h-[55%] drop-shadow-[0_8px_24px_rgba(44,62,44,0.15)]"
      >
        {/* Pot */}
        <path d="M35 95 L40 130 L80 130 L85 95Z" fill="#c06a30" />
        <path d="M37 95 L38 102 L82 102 L83 95Z" fill="#d4864e" />
        <ellipse cx="60" cy="95" rx="28" ry="4" fill="#a35628" />
        {/* Soil */}
        <ellipse cx="60" cy="96" rx="24" ry="3" fill="#5a3018" opacity="0.5" />
        {/* Main stem */}
        <path
          d="M60 95 L60 55"
          stroke="#4a7c4a"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M60 80 L55 65"
          stroke="#4a7c4a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Leaves */}
        <path
          d="M60 55 C50 45 38 42 32 35 C38 32 52 38 58 52"
          fill="#6a9e6a"
        />
        <path
          d="M60 55 C70 43 82 38 90 32 C86 38 72 48 62 52"
          fill="#4a7c4a"
        />
        <path
          d="M55 65 C45 58 34 58 28 54 C34 50 48 54 54 64"
          fill="#8eba8e"
        />
        {/* Leaf veins */}
        <path
          d="M60 55 C52 48 42 44 36 38"
          stroke="#4a7c4a"
          strokeWidth="0.8"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M60 55 C68 46 78 40 86 35"
          stroke="#2f4f2f"
          strokeWidth="0.8"
          fill="none"
          opacity="0.3"
        />
        {/* Small new leaf at top */}
        <path
          d="M60 55 C58 48 56 42 60 36 C64 42 62 48 60 55"
          fill="#8eba8e"
          opacity="0.8"
        />
        {/* Pot rim highlight */}
        <path
          d="M38 96 L82 96"
          stroke="#e8a87a"
          strokeWidth="1.5"
          opacity="0.5"
        />
        {/* Small decoration dots on pot */}
        <circle cx="50" cy="112" r="2" fill="#e8a87a" opacity="0.4" />
        <circle cx="60" cy="115" r="2" fill="#e8a87a" opacity="0.4" />
        <circle cx="70" cy="112" r="2" fill="#e8a87a" opacity="0.4" />
      </svg>
    </div>
  );
}
