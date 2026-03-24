export function CtaSection() {
  return (
    <section className="py-8 pb-4">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--container-padding)]">
        <div
          className="rounded-2xl p-12 px-8 text-center relative overflow-hidden animate-fade-in-up"
          style={{
            background:
              "radial-gradient(ellipse at 20% 80%, rgba(255, 255, 255, 0.08), transparent 50%), linear-gradient(145deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%)",
            color: "white",
          }}
        >
          {/* Decorative botanical SVG */}
          <svg
            className="absolute -top-5 -right-2.5 w-[180px] h-[180px] opacity-[0.06]"
            viewBox="0 0 180 180"
            fill="none"
          >
            <path d="M90 170V90" stroke="white" strokeWidth="3" />
            <path d="M90 120c-20-5-40-25-35-55 25 3 40 22 42 42" fill="white" opacity="0.15" />
            <path d="M90 100c18-8 42-10 55 5-18 12-40 8-50-2" fill="white" opacity="0.1" />
            <path d="M90 90c-15-10-20-30-10-50 15 8 20 28 14 44" fill="white" opacity="0.08" />
          </svg>

          <h2 className="font-[family-name:var(--font-display)] font-bold text-3xl text-white mb-3 relative">
            La tua pianta ha bisogno di aiuto?
          </h2>
          <p className="text-white/75 max-w-[420px] mx-auto mb-8 relative">
            Non aspettare che sia troppo tardi. Una foto è tutto quello che serve
            per capire come sta e cosa fare.
          </p>
          <a
            href="#upload"
            className="relative inline-flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-semibold text-lg px-8 py-4 rounded-full bg-white text-primary-700 shadow-[0_4px_15px_rgba(0,0,0,0.15)] transition-all duration-[var(--transition-base)] hover:bg-cream-50 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] active:scale-[0.97]"
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
            Inizia subito
          </a>
        </div>
      </div>
    </section>
  );
}
