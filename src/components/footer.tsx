export function Footer() {
  return (
    <footer className="text-center py-12 pb-8 text-[var(--color-text-muted)] text-sm relative">
      {/* Decorative gradient separator */}
      <div className="w-[60px] h-[2px] bg-gradient-to-r from-transparent via-primary-300 to-transparent mx-auto mb-8 rounded-full" />

      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)]">
        <span className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-bold text-primary-500">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="flex-shrink-0"
          >
            {/* stelo */}
            <line x1="10" y1="18" x2="10" y2="10" stroke="#4a7c4a" strokeWidth="1.8" strokeLinecap="round" />
            {/* foglia sinistra */}
            <path d="M10 14 C7 11 3 7 5 3 C7 0 11 5 10 14Z" fill="#6aab6a" />
            {/* foglia destra */}
            <path d="M10 11 C13 8 17 4 15 1 C13 -1 9 5 10 11Z" fill="#4a7c4a" />
            {/* terra */}
            <ellipse cx="10" cy="18.5" rx="3.5" ry="1.3" fill="#c06a30" opacity={0.3} />
          </svg>
          Bloom Buddy
        </span>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Fatto con cura per chi ama le piante (anche quelle un po&apos; sofferenti).
        </p>
      </div>
    </footer>
  );
}
