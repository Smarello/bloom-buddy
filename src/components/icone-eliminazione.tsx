// Icone SVG condivise tra i componenti di eliminazione (analisi e collezione)

/**
 * Spinner di caricamento usato nei pulsanti di conferma eliminazione.
 * Classi per dimensione (es. w-4 h-4) vanno applicate dall'esterno.
 */
export function IconaSpinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ animation: "spin-slow 1s linear infinite" }}
    >
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="15 47"
      />
    </svg>
  );
}

/**
 * Icona cestino dettagliata (viewBox 32x32) usata come overlay sulle card analisi.
 * Occupa il 100% del contenitore padre — avvolgerla in un div con dimensioni esplicite.
 */
export function IconaCestino() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Coperchio */}
      <rect
        x="8"
        y="9"
        width="16"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.9"
      />
      <rect
        x="12"
        y="7"
        width="8"
        height="2.5"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Corpo cestino con bordi arrotondati */}
      <path
        d="M10 11.5h12l-1.2 14a2 2 0 0 1-2 1.8h-5.6a2 2 0 0 1-2-1.8L10 11.5z"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      {/* Linee interne */}
      <line
        x1="14"
        y1="15"
        x2="14"
        y2="23"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="18"
        y1="15"
        x2="18"
        y2="23"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * Icona cestino grande (viewBox 56x56) con stile rosso, usata nel dialogo di eliminazione collezione.
 * Occupa il 100% del contenitore padre con padding interno.
 */
export function IconaCestinoCollezione() {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      className="relative z-10 w-full h-full p-3"
      aria-hidden="true"
    >
      {/* Cestino stilizzato */}
      <rect
        x="16"
        y="20"
        width="24"
        height="22"
        rx="3"
        stroke="#c43c3c"
        strokeWidth="2"
        opacity="0.5"
      />
      <path
        d="M13 20h30"
        stroke="#c43c3c"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M22 20v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"
        stroke="#c43c3c"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M24 26v10M28 26v10M32 26v10"
        stroke="#c43c3c"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

/**
 * Icona cestino a contorno (viewBox 24x24) usata nel pulsante elimina collezione nell'intestazione.
 */
export function IconaCestinoContorno() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
