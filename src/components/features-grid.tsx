const featureTiles = [
  {
    span: "col-span-7",
    iconBg: "linear-gradient(135deg, rgba(74, 124, 74, 0.12), rgba(74, 124, 74, 0.04))",
    decorColor: "bg-primary-500",
    delay: "delay-3",
    title: "Riconoscimento specie",
    description: "Nome comune e scientifico della tua pianta, identificati in pochi secondi dall'intelligenza artificiale.",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
        <circle cx="14" cy="14" r="11" stroke="#4a7c4a" strokeWidth="1.8" fill="none" />
        <ellipse cx="14" cy="14" rx="5" ry="11" stroke="#4a7c4a" strokeWidth="1.2" fill="none" />
        <line x1="3" y1="14" x2="25" y2="14" stroke="#4a7c4a" strokeWidth="1.2" />
        <path d="M18 5c-1 1-2 3-1 5 2-0.5 3-2 2.5-4" fill="#8eba8e" />
      </svg>
    ),
  },
  {
    span: "col-span-5",
    iconBg: "linear-gradient(135deg, rgba(192, 106, 48, 0.12), rgba(192, 106, 48, 0.04))",
    decorColor: "bg-secondary-500",
    delay: "delay-4",
    title: "Diagnosi salute",
    description: "Valutazione visiva delle condizioni: foglie, colore, parassiti.",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
        <circle cx="14" cy="10" r="6" stroke="#c06a30" strokeWidth="1.8" fill="none" />
        <path d="M14 16v5" stroke="#c06a30" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 21c0 2.5-4 2.5-4 0" stroke="#c06a30" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M12 8l2 2.5L17 7" stroke="#7cb342" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    span: "col-span-5",
    iconBg: "linear-gradient(135deg, rgba(124, 179, 66, 0.12), rgba(124, 179, 66, 0.04))",
    decorColor: "bg-[#7cb342]",
    delay: "delay-5",
    title: "Cura personalizzata",
    description: "Acqua, luce, temperatura — tutto calibrato sulla tua pianta.",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
        <path d="M6 12h12v8a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-8z" stroke="#7cb342" strokeWidth="1.8" fill="none" />
        <path d="M18 14c2-1 4-3 4-5h-4" stroke="#7cb342" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <line x1="6" y1="9" x2="18" y2="9" stroke="#7cb342" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="9" cy="16" r="0.8" fill="#5b9bd5" opacity="0.6" />
        <circle cx="12" cy="17.5" r="0.8" fill="#5b9bd5" opacity="0.6" />
        <circle cx="15" cy="16" r="0.8" fill="#5b9bd5" opacity="0.6" />
      </svg>
    ),
  },
  {
    span: "col-span-7",
    iconBg: "linear-gradient(135deg, rgba(100, 100, 120, 0.1), rgba(100, 100, 120, 0.03))",
    decorColor: "bg-[var(--color-text-primary)]",
    delay: "delay-6",
    title: "Nessun account richiesto",
    description: "Analisi immediata senza registrazione. La tua foto non viene salvata da nessuna parte.",
    icon: (
      <svg viewBox="0 0 28 28" fill="none" className="w-7 h-7">
        <path d="M14 3L4 8v6c0 6.5 4.5 11 10 13 5.5-2 10-6.5 10-13V8L14 3z" stroke="#5a6b5a" strokeWidth="1.8" fill="none" />
        <path d="M10 14l3 3 5-6" stroke="#7cb342" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-4 pb-16">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)]">
        <div className="grid grid-cols-12 gap-4 max-md:grid-cols-1">
          {featureTiles.map((tile) => (
            <div
              key={tile.title}
              className={`${tile.span} max-md:col-span-1 p-6 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-light)] transition-all duration-[var(--transition-base)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-[3px] relative overflow-hidden animate-fade-in-up ${tile.delay} group`}
            >
              {/* Decorative corner circle */}
              <div
                className={`absolute -bottom-[30px] -right-[30px] w-[90px] h-[90px] rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-[var(--transition-base)] ${tile.decorColor}`}
              />

              <div
                className="w-[52px] h-[52px] rounded-lg flex items-center justify-center mb-4"
                style={{ background: tile.iconBg }}
              >
                {tile.icon}
              </div>
              <h5 className="font-[family-name:var(--font-display)] font-bold text-lg mb-2 text-[var(--color-text-primary)]">
                {tile.title}
              </h5>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {tile.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
