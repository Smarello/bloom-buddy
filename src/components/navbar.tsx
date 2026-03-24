import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-xl saturate-[1.3] border-b border-[rgba(218,232,218,0.4)] py-4 animate-fade-in">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)] flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 font-[family-name:var(--font-display)] font-bold text-xl text-primary-600 transition-colors hover:text-primary-500"
        >
          <span className="w-[38px] h-[38px] flex items-center justify-center">
            <svg
              viewBox="0 0 38 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <rect width="38" height="38" rx="10" fill="url(#logo-grad)" />
              {/* stelo */}
              <line x1="19" y1="34" x2="19" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              {/* foglia sinistra */}
              <path d="M19 28 C13 24 7 16 11 9 C14 4 20 13 19 28Z" fill="white" />
              {/* foglia destra */}
              <path d="M19 22 C25 18 32 10 28 5 C25 1 18 12 19 22Z" fill="white" opacity={0.72} />
              {/* terra */}
              <ellipse cx="19" cy="35" rx="5" ry="1.8" fill="white" opacity={0.25} />
              <defs>
                <linearGradient
                  id="logo-grad"
                  x1="0"
                  y1="0"
                  x2="38"
                  y2="38"
                >
                  <stop stopColor="#6a9e6a" />
                  <stop offset="1" stopColor="#3d663d" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          Bloom Buddy
        </Link>
        <span className="hidden sm:block font-[family-name:var(--font-body)] text-sm font-normal text-[var(--color-text-muted)]">
          La tua guida verde personale
        </span>
      </div>
    </nav>
  );
}
