import Link from "next/link";
import { ottieniSessioneServer } from "@/lib/auth/sessione";

export async function Navbar() {
  const sessione = await ottieniSessioneServer();

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

        {sessione.utenteId ? (
          <div className="flex items-center gap-3">
            {/* Link collezione */}
            <Link
              href="/collezione"
              className="inline-flex items-center gap-1.5 font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-primary-600)] transition-colors hover:text-[var(--color-primary-500)]"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  d="M10 18c-1-2-8-7-8-12a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 5-7 10-8 12z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              <span className="hidden sm:inline">Collezione</span>
            </Link>

            {/* Avatar con iniziale */}
            <div
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-[family-name:var(--font-display)] font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))",
              }}
            >
              {sessione.email?.charAt(0).toUpperCase() ?? "?"}
            </div>

            {/* Email visibile solo su schermi >= 480px */}
            <span className="hidden min-[480px]:inline font-[family-name:var(--font-display)] text-sm text-[var(--color-text-secondary)]">
              {sessione.email}
            </span>

            {/* Pulsante logout */}
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="flex items-center gap-1.5 font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-text-secondary)] border border-[var(--color-primary-200)] px-4 py-2 rounded-full transition-colors hover:text-red-600 hover:border-red-300 hover:bg-red-50 cursor-pointer"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                >
                  <path
                    d="M13 2.5H15.5C16.0523 2.5 16.5 2.94772 16.5 3.5V16.5C16.5 17.0523 16.0523 17.5 15.5 17.5H13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 14L13 10L9 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 10H3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Esci
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/accesso"
              className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-primary-600)] border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-4 py-2 rounded-full transition-colors hover:bg-[var(--color-primary-100)] hover:border-[var(--color-primary-300)]"
            >
              Accedi
            </Link>
            <Link
              href="/registrazione"
              className="font-[family-name:var(--font-display)] text-sm font-semibold text-white bg-[var(--color-primary-600)] px-4 py-2 rounded-full transition-colors hover:bg-[var(--color-primary-500)]"
            >
              Registrati
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
