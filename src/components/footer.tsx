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
            viewBox="0 0 24 24"
            fill="none"
            className="flex-shrink-0"
          >
            <path
              d="M12 22V14"
              stroke="#4a7c4a"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 16c-3-1-6-4.5-5-9 4.5 0.5 7 3.5 7 7"
              fill="#6a9e6a"
            />
            <path
              d="M12 15c2.5-1.5 6-2 8 1-3 2-6 1.5-7-0.5"
              fill="#8eba8e"
            />
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
