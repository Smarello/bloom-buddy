import { redirect } from "next/navigation";
import { ottieniSessioneServer } from "@/lib/auth/sessione";
import FormCambioPassword from "@/components/form-cambio-password";

export default async function PaginaProfilo() {
  const sessione = await ottieniSessioneServer();

  if (!sessione.utenteId) {
    redirect("/accesso");
  }

  const nomeUtente = sessione.email?.split("@")[0] ?? "utente";

  return (
    <>
      <style>{`
        @keyframes blob-morph {
          0%, 100% { border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%; }
          25%      { border-radius: 45% 55% 60% 40% / 60% 40% 55% 45%; }
          50%      { border-radius: 55% 45% 40% 60% / 40% 55% 45% 60%; }
          75%      { border-radius: 40% 60% 55% 45% / 55% 45% 60% 40%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes floaterEntrance {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to   { opacity: 0.3; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Botanical floaters — hidden on mobile */}
      <div
        className="hidden sm:block"
        style={{
          position: "fixed",
          top: 100,
          right: -15,
          pointerEvents: "none",
          opacity: 0,
          animation: "floaterEntrance 1s cubic-bezier(0.16,1,0.3,1) 600ms forwards",
          zIndex: 0,
        }}
      >
        <svg viewBox="0 0 80 100" fill="none" style={{ width: 70, animation: "float 8s ease-in-out infinite" }}>
          <path d="M40 95C38 80 20 65 12 45C8 30 18 15 35 20C42 22 40 35 40 50" fill="var(--color-primary-300)" opacity="0.5" stroke="var(--color-primary-400)" strokeWidth="0.8" />
          <path d="M40 95C42 78 58 62 65 42C68 28 60 14 44 19C38 21 40 33 40 48" fill="var(--color-primary-200)" opacity="0.4" stroke="var(--color-primary-300)" strokeWidth="0.6" />
          <path d="M40 95C40 70 38 45 40 20" stroke="var(--color-primary-400)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
        </svg>
      </div>
      <div
        className="hidden sm:block"
        style={{
          position: "fixed",
          bottom: 80,
          left: -25,
          pointerEvents: "none",
          opacity: 0,
          animation: "floaterEntrance 1s cubic-bezier(0.16,1,0.3,1) 900ms forwards",
          zIndex: 0,
        }}
      >
        <svg viewBox="0 0 90 80" fill="none" style={{ width: 80, animation: "float 10s ease-in-out -3s infinite" }}>
          <ellipse cx="45" cy="55" rx="25" ry="12" fill="var(--color-primary-300)" opacity="0.15" />
          <path d="M45 70C42 55 25 45 15 30C10 20 20 10 35 18C42 22 43 38 45 50" fill="var(--color-primary-200)" opacity="0.5" stroke="var(--color-primary-300)" strokeWidth="0.8" />
          <path d="M45 70C48 52 62 40 72 28C76 20 68 10 55 16C48 20 47 35 45 48" fill="var(--color-primary-300)" opacity="0.35" stroke="var(--color-primary-400)" strokeWidth="0.6" />
        </svg>
      </div>

      <main className="min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center py-8 pb-16">
          <div className="w-full mx-auto px-4" style={{ maxWidth: 480 }}>

            {/* === Avatar area === */}
            <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <div
                className="mx-auto mb-4 flex items-center justify-center relative overflow-hidden"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
                  background: "linear-gradient(135deg, var(--color-primary-200), var(--color-primary-400))",
                  boxShadow: "0 6px 24px rgba(74,124,74,0.2), 0 0 0 4px var(--color-bg), 0 0 0 6px var(--color-primary-200)",
                  animation: "blob-morph 12s ease-in-out infinite",
                }}
              >
                {/* Glossy overlay */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "-20%",
                    left: "-20%",
                    width: "140%",
                    height: "140%",
                    background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), transparent 50%)",
                    pointerEvents: "none",
                  }}
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white relative z-10"
                  style={{ width: 40, height: 40, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
                  aria-hidden="true"
                >
                  <path d="M12 22V12" />
                  <path d="M12 14c-4-1-7-5-6-10 5.5.5 8 4 8 8" />
                  <path d="M12 12c3-1.5 7-2 9 1.5-4 2.5-7.5 1.5-8.5-1" />
                </svg>
              </div>

              <h2
                className="font-[family-name:var(--font-display)] font-bold text-2xl mb-1"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary-700) 10%, var(--color-primary-400) 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Ciao, {nomeUtente}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Gestisci il tuo account Bloom Buddy
              </p>
            </div>

            {/* === Identity section === */}
            <div
              className="animate-fade-in-up relative mb-6"
              style={{
                animationDelay: "300ms",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-light)",
                borderRadius: "var(--radius-2xl)",
                boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(218,232,218,0.2)",
                padding: "1.5rem 1.75rem",
              }}
            >
              {/* Green accent line */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0",
                  background: "linear-gradient(90deg, transparent 0%, var(--color-primary-300) 30%, var(--color-primary-400) 50%, var(--color-primary-300) 70%, transparent 100%)",
                }}
              />
              {/* Botanical watermark */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: -30,
                  right: -30,
                  width: 140,
                  height: 140,
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='none' stroke='%236a9e6a' stroke-width='1' opacity='0.06'/%3E%3Ccircle cx='50' cy='50' r='28' fill='none' stroke='%236a9e6a' stroke-width='1' opacity='0.04'/%3E%3C/svg%3E\")",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  pointerEvents: "none",
                  opacity: 0.5,
                  overflow: "hidden",
                }}
              />

              <div className="flex items-center gap-3 mb-5">
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, var(--color-primary-200), var(--color-primary-100))",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5 20c0-4 3.1-7 7-7s7 3 7 7" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-display)] font-bold text-lg text-[var(--color-text-primary)]">
                  Il tuo account
                </h3>
              </div>

              {/* Email display */}
              <div
                className="flex items-center gap-3"
                style={{
                  padding: "var(--space-4) var(--space-5)",
                  background: "linear-gradient(135deg, rgba(74,124,74,0.04) 0%, rgba(74,124,74,0.01) 100%)",
                  border: "1px solid var(--color-primary-100)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-500))",
                    boxShadow: "0 2px 8px rgba(74,124,74,0.2)",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 6L2 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div
                    className="font-[family-name:var(--font-display)] font-semibold uppercase mb-0.5"
                    style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}
                  >
                    Email
                  </div>
                  <div className="font-semibold text-[var(--color-text-primary)]">
                    {sessione.email}
                  </div>
                </div>
              </div>
            </div>

            {/* === Security section === */}
            <div
              className="animate-fade-in-up relative mb-6"
              style={{
                animationDelay: "450ms",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-light)",
                borderRadius: "var(--radius-2xl)",
                boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(218,232,218,0.2)",
                padding: "1.5rem 1.75rem",
              }}
            >
              {/* Terracotta accent line */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  borderRadius: "var(--radius-2xl) var(--radius-2xl) 0 0",
                  background: "linear-gradient(90deg, transparent 0%, var(--color-secondary-200) 30%, var(--color-secondary-400) 50%, var(--color-secondary-200) 70%, transparent 100%)",
                }}
              />
              {/* Botanical watermark */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: -30,
                  right: -30,
                  width: 140,
                  height: 140,
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='none' stroke='%236a9e6a' stroke-width='1' opacity='0.06'/%3E%3Ccircle cx='50' cy='50' r='28' fill='none' stroke='%236a9e6a' stroke-width='1' opacity='0.04'/%3E%3C/svg%3E\")",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  pointerEvents: "none",
                  opacity: 0.5,
                  overflow: "hidden",
                }}
              />

              <div className="flex items-center gap-3 mb-5">
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-lg)",
                    background: "linear-gradient(135deg, var(--color-secondary-200), var(--color-secondary-100))",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-display)] font-bold text-lg text-[var(--color-text-primary)]">
                  Cambia password
                </h3>
              </div>

              <FormCambioPassword />
            </div>

            {/* === Logout === */}
            <div className="text-center animate-fade-in-up" style={{ animationDelay: "700ms" }}>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-semibold text-sm text-[var(--color-text-muted)] bg-transparent border-none cursor-pointer rounded-full transition-colors hover:text-[var(--color-accent-500)] hover:bg-[rgba(224,96,96,0.06)]"
                  style={{ padding: "var(--space-3) var(--space-5)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Esci dal tuo account
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
