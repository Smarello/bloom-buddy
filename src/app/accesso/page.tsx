"use client";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconaEmail,
  IconaLucchetto,
  IconaOcchioAperto,
  IconaOcchioChiuso,
  IconaAvviso,
} from "@/components/icone-form";

// ─── Tipi ────────────────────────────────────────────────────────────────────

type StatoForm = "idle" | "submitting" | "error";

// ─── Icone SVG (solo quelle specifiche di questa pagina) ─────────────────────

function IconaScudo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: "14px", height: "14px" }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ─── Componente principale ───────────────────────────────────────────────────

export default function PaginaAccesso() {
  const router = useRouter();

  // Stato form
  const [stato, setStato] = useState<StatoForm>("idle");
  const [messaggioErrore, setMessaggioErrore] = useState<string>("");

  // Valori campi
  const [emailUtente, setEmailUtente] = useState("");
  const [passwordUtente, setPasswordUtente] = useState("");

  // Visibilità password
  const [passwordVisibile, setPasswordVisibile] = useState(false);

  // Overlay successo
  const [successo, setSuccesso] = useState(false);
  const [contoAllaRovescia, setContoAllaRovescia] = useState(3);

  useEffect(() => {
    if (!successo) return;
    setContoAllaRovescia(3);
    let contatore = 3;
    const intervallo = setInterval(() => {
      contatore--;
      setContoAllaRovescia(contatore);
      if (contatore <= 0) {
        clearInterval(intervallo);
        setTimeout(() => { window.location.href = "/"; }, 200);
      }
    }, 1000);
    return () => clearInterval(intervallo);
  }, [successo, router]);

  // ID accessibilità
  const idEmail = useId();
  const idPassword = useId();

  // ─── Submit ─────────────────────────────────────────────────────────────────

  async function gestisciSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMessaggioErrore("");
    setStato("submitting");

    try {
      const risposta = await fetch("/api/auth/accesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailUtente, password: passwordUtente }),
      });

      if (risposta.ok) {
        setStato("idle");
        setSuccesso(true);
        return;
      }

      const corpo = await risposta.json().catch(() => ({}));

      if (risposta.status === 401) {
        setMessaggioErrore(
          corpo?.errore ??
            "Email o password non corrispondono. Nessun problema, riprova con calma!"
        );
      } else {
        setMessaggioErrore(
          corpo?.errore ??
            "Si è verificato un errore. Riprova tra qualche istante."
        );
      }

      setStato("error");
    } catch {
      setMessaggioErrore(
        "Impossibile connettersi al server. Controlla la tua connessione e riprova."
      );
      setStato("error");
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const staInviando = stato === "submitting";

  return (
    <>
      {/* ── Success overlay ── */}
      {successo && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            backgroundColor: "rgba(240, 245, 240, 0.88)",
            animation: "fadeIn 0.4s ease both",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          {/* Blob verde con checkmark */}
          <div
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              background:
                "linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "var(--shadow-glow)",
              animation: "blob-morph 8s ease-in-out infinite",
            }}
          >
            <svg
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "52px", height: "52px" }}
              aria-hidden="true"
            >
              <path
                d="M26 8 C20 8, 13 14, 14 24 C14.5 29, 17 33, 21 35 L21 42 C21 43.1 21.9 44 23 44 L29 44 C30.1 44 31 43.1 31 42 L31 35 C35 33, 37.5 29, 38 24 C39 14, 32 8, 26 8Z"
                fill="currentColor"
                opacity={0.3}
              />
              <path
                d="M17 26 L23 32 L35 20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 700,
              color: "var(--color-primary-700)",
              margin: 0,
            }}
          >
            Bentornato!
          </h2>

          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "1rem",
              maxWidth: "340px",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Le tue piante non vedevano l&apos;ora di rivederti.
          </p>

          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            Stai per essere reindirizzato alla home…{" "}
            <span
              style={{
                fontWeight: 700,
                color: "var(--color-primary-600)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {contoAllaRovescia}
            </span>
          </p>
        </div>
      )}

      {/* ── Pagina principale ── */}
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "3rem 1.25rem 4rem",
        }}
      >
        <div
          style={{ width: "100%", maxWidth: "440px" }}
          className="animate-fade-in-up"
        >
          {/* Eyebrow pill — secondary/terracotta tones with shield icon */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              backgroundColor: "var(--color-secondary-50)",
              color: "var(--color-secondary-600)",
              border: "1px solid var(--color-secondary-200)",
              borderRadius: "999px",
              padding: "0.3rem 0.875rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            <IconaScudo />
            Bentornato nel tuo giardino
          </div>

          {/* Heading — gradient primary-700 to primary-400 */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "0.5rem",
              background:
                "linear-gradient(135deg, var(--color-primary-700) 10%, var(--color-primary-400) 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Accedi al tuo account
          </h1>

          {/* Subheading */}
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "1rem",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            Le tue piante ti aspettano. Riprendi da dove avevi lasciato.
          </p>

          {/* Card — gradient accent line terracotta-to-green */}
          <div
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--color-border-light)",
              borderTop:
                "3px solid transparent",
              borderImage:
                "linear-gradient(90deg, transparent 0%, var(--color-secondary-300) 25%, var(--color-primary-400) 50%, var(--color-secondary-300) 75%, transparent 100%) 1",
              padding: "2rem",
              position: "relative",
            }}
          >
            {/* Error banner */}
            {stato === "error" && messaggioErrore && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  backgroundColor: "rgba(224, 96, 96, 0.06)",
                  border: "1px solid rgba(224, 96, 96, 0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.875rem 1rem",
                  marginBottom: "1.5rem",
                  animation: "fadeIn 0.25s ease both",
                }}
              >
                {/* Icona circolare avviso */}
                <div
                  style={{
                    flexShrink: 0,
                    width: "36px",
                    height: "36px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(224, 96, 96, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-accent-500)",
                  }}
                >
                  <IconaAvviso />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      fontSize: "0.875rem",
                      color: "var(--color-accent-600)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Ops, qualcosa non torna
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {messaggioErrore}
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={gestisciSubmit} noValidate>
              {/* Campo email */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label
                  htmlFor={idEmail}
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.4rem",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                      pointerEvents: "none",
                      display: "flex",
                    }}
                  >
                    <IconaEmail />
                  </span>
                  <input
                    id={idEmail}
                    type="email"
                    name="email"
                    value={emailUtente}
                    onChange={(e) => {
                      setEmailUtente(e.target.value);
                      if (stato === "error") {
                        setMessaggioErrore("");
                        setStato("idle");
                      }
                    }}
                    placeholder="giulia@example.com"
                    autoComplete="email"
                    inputMode="email"
                    required
                    style={{
                      width: "100%",
                      padding: "0.7rem 1rem 0.7rem 2.6rem",
                      fontSize: "0.9375rem",
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-primary)",
                      backgroundColor: "var(--color-primary-50)",
                      border: "1.5px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      outline: "none",
                      boxSizing: "border-box",
                      transition:
                        "border-color var(--transition-fast), box-shadow var(--transition-fast)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--color-primary-400)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(106, 158, 106, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Campo password */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor={idPassword}
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.4rem",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-muted)",
                      pointerEvents: "none",
                      display: "flex",
                    }}
                  >
                    <IconaLucchetto />
                  </span>
                  <input
                    id={idPassword}
                    type={passwordVisibile ? "text" : "password"}
                    name="password"
                    value={passwordUtente}
                    onChange={(e) => {
                      setPasswordUtente(e.target.value);
                      if (stato === "error") {
                        setMessaggioErrore("");
                        setStato("idle");
                      }
                    }}
                    placeholder="La tua password"
                    autoComplete="current-password"
                    required
                    style={{
                      width: "100%",
                      padding: "0.7rem 3rem 0.7rem 2.6rem",
                      fontSize: "0.9375rem",
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-primary)",
                      backgroundColor: "var(--color-primary-50)",
                      border: "1.5px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      outline: "none",
                      boxSizing: "border-box",
                      transition:
                        "border-color var(--transition-fast), box-shadow var(--transition-fast)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--color-primary-400)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(106, 158, 106, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  {/* Toggle mostra/nascondi */}
                  <button
                    type="button"
                    onClick={() => setPasswordVisibile((v) => !v)}
                    aria-label={
                      passwordVisibile ? "Nascondi password" : "Mostra password"
                    }
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      padding: "0.25rem",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "var(--radius-sm)",
                      transition: "color var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color =
                        "var(--color-primary-600)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color =
                        "var(--color-text-muted)";
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: "1.0625rem", height: "1.0625rem" }}
                      aria-hidden="true"
                    >
                      {passwordVisibile ? (
                        <IconaOcchioChiuso />
                      ) : (
                        <IconaOcchioAperto />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Pulsante submit */}
              <button
                type="submit"
                disabled={staInviando}
                style={{
                  width: "100%",
                  padding: "0.875rem 1.5rem",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-on-primary)",
                  background: staInviando
                    ? "var(--color-primary-400)"
                    : "linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)",
                  border: "none",
                  borderRadius: "var(--radius-lg)",
                  cursor: staInviando ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: staInviando ? "none" : "var(--shadow-md)",
                  transition:
                    "transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast)",
                  opacity: staInviando ? 0.85 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!staInviando) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!staInviando) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }
                }}
              >
                {staInviando ? (
                  <>
                    <span
                      aria-hidden="true"
                      style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}
                    >
                      {[0, 1, 2].map((indice) => (
                        <span
                          key={indice}
                          style={{
                            display: "inline-block",
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            backgroundColor: "currentColor",
                            animation: `pulse-gentle 1.2s ease-in-out ${indice * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </span>
                    <span className="sr-only">Accesso in corso…</span>
                  </>
                ) : (
                  "Accedi"
                )}
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                margin: "1.5rem 0 1rem",
              }}
            >
              <span
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "var(--color-border-light)",
                }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                oppure
              </span>
              <span
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "var(--color-border-light)",
                }}
              />
            </div>

            {/* Link registrazione */}
            <p
              style={{
                textAlign: "center",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              Non hai ancora un account?{" "}
              <Link
                href="/registrazione"
                style={{
                  fontWeight: 700,
                  color: "var(--color-primary-600)",
                  textDecoration: "none",
                }}
              >
                Creane uno gratis
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
