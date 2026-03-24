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
              <path
                d="M19 28V20"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M19 22c-3-1-6-4.5-5-9 4.5 0.5 7 3.5 7 7"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M19 20c2.5-1.5 6.5-2 9 1-3 2-6.5 1.5-8-0.5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="19" cy="28.5" r="1.2" fill="white" opacity="0.6" />
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
