"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

interface MenuUtenteProps {
  email: string;
}

export function MenuUtente({ email }: MenuUtenteProps) {
  const iniziale = email.charAt(0).toUpperCase() || "?";
  const [aperto, setAperto] = useState(false);
  const contenitoreRef = useRef<HTMLDivElement>(null);
  const pulsanteRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aperto) return;

    function gestisciClickEsterno(evento: MouseEvent) {
      if (
        contenitoreRef.current &&
        !contenitoreRef.current.contains(evento.target as Node)
      ) {
        setAperto(false);
      }
    }

    function gestisciEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAperto(false);
        pulsanteRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", gestisciClickEsterno);
    document.addEventListener("keydown", gestisciEscape);
    return () => {
      document.removeEventListener("mousedown", gestisciClickEsterno);
      document.removeEventListener("keydown", gestisciEscape);
    };
  }, [aperto]);

  return (
    <div ref={contenitoreRef} className="relative">
      <button
        ref={pulsanteRef}
        type="button"
        onClick={() => setAperto((prev) => !prev)}
        aria-expanded={aperto}
        aria-haspopup="menu"
        className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-[family-name:var(--font-display)] font-bold text-sm cursor-pointer transition-opacity hover:opacity-80"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))",
        }}
        title={email}
      >
        {iniziale}
      </button>

      {aperto && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-xl shadow-lg border border-[rgba(218,232,218,0.5)] py-2 animate-fade-in z-50">
          <div className="px-4 py-2 border-b border-[rgba(218,232,218,0.3)]">
            <p className="text-xs text-[var(--color-text-secondary)] truncate">
              {email}
            </p>
          </div>

          <Link
            href="/profilo"
            onClick={() => setAperto(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-50)] transition-colors"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="w-4 h-4 text-[var(--color-primary-600)]"
              aria-hidden="true"
            >
              <circle
                cx="10"
                cy="7"
                r="3.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M3 17.5c0-3.5 3-5.5 7-5.5s7 2 7 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Il mio profilo
          </Link>

          <Link
            href="/collezione"
            onClick={() => setAperto(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-50)] transition-colors"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="w-4 h-4 text-[var(--color-primary-600)]"
              aria-hidden="true"
            >
              <path
                d="M10 18c-1-2-8-7-8-12a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 5-7 10-8 12z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
            La mia collezione
          </Link>

          <div className="border-t border-[rgba(218,232,218,0.3)] mt-1 pt-1">
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                onClick={() => setAperto(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="w-4 h-4"
                  aria-hidden="true"
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
        </div>
      )}
    </div>
  );
}
