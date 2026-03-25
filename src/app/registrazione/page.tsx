"use client";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Tipi ────────────────────────────────────────────────────────────────────

type StatoForm = "idle" | "submitting" | "error";

type LivellForza = "debole" | "media" | "forte";

// ─── Logica forza password ────────────────────────────────────────────────────

function calcolaForzaPassword(valore: string): LivellForza | null {
  if (!valore) return null;
  let punteggio = 0;
  if (valore.length >= 8) punteggio++;
  if (valore.length >= 12) punteggio++;
  if (/[A-Z]/.test(valore)) punteggio++;
  if (/[0-9]/.test(valore)) punteggio++;
  if (/[^A-Za-z0-9]/.test(valore)) punteggio++;
  if (punteggio <= 2) return "debole";
  if (punteggio <= 3) return "media";
  return "forte";
}

const ETICHETTE_FORZA: Record<LivellForza, string> = {
  debole: "Password debole",
  media: "Password discreta",
  forte: "Password sicura",
};

const COLORI_FORZA: Record<LivellForza, string> = {
  debole: "var(--color-accent-500)",
  media: "var(--color-secondary-400)",
  forte: "var(--color-health-excellent)",
};

const LARGHEZZA_FORZA: Record<LivellForza, string> = {
  debole: "33%",
  media: "66%",
  forte: "100%",
};

// ─── Icone SVG ────────────────────────────────────────────────────────────────

function IconaFoglia() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 1 C5 1, 2 3.5, 2.5 7.5 C2.7 9.2, 3.8 10.5, 5.5 11.2 L5.5 12.8 C5.5 13.2 5.8 13.5 6.2 13.5 L7.8 13.5 C8.2 13.5 8.5 13.2 8.5 12.8 L8.5 11.2 C10.2 10.5, 11.3 9.2, 11.5 7.5 C12 3.5, 9 1, 7 1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconaEmail() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: "1rem", height: "1rem" }}
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconaLucchetto() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: "1rem", height: "1rem" }}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconaLucchettoSpunta() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: "1rem", height: "1rem" }}
    >
      <path d="M9 12l2 2 4-4" />
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconaOcchioAperto() {
  return (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  );
}

function IconaOcchioChiuso() {
  return (
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </>
  );
}

function IconaAvviso() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: "1.125rem", height: "1.125rem", flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconaScudo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: "1rem", height: "1rem", flexShrink: 0, marginTop: "1px" }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ─── Componente principale ───────────────────────────────────────────────────

export default function PaginaRegistrazione() {
  const router = useRouter();

  // Stato form
  const [stato, setStato] = useState<StatoForm>("idle");
  const [messaggioErrore, setMessaggioErrore] = useState<string>("");

  // Valori campi
  const [emailUtente, setEmailUtente] = useState("");
  const [passwordUtente, setPasswordUtente] = useState("");
  const [confermaPassword, setConfermaPassword] = useState("");

  // Errori inline dei campi
  const [erroreEmail, setErroreEmail] = useState("");
  const [errorePassword, setErrorePassword] = useState("");
  const [erroreConferma, setErroreConferma] = useState("");

  // Visibilità password
  const [passwordVisibile, setPasswordVisibile] = useState(false);

  // Forza password
  const forzaPassword = calcolaForzaPassword(passwordUtente);

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
        setTimeout(() => router.push("/"), 200);
      }
    }, 1000);
    return () => clearInterval(intervallo);
  }, [successo, router]);

  // ID accessibilità
  const idEmail = useId();
  const idPassword = useId();
  const idConferma = useId();

  // ─── Validazione client ─────────────────────────────────────────────────────

  function validaForm(): boolean {
    let valido = true;

    if (!emailUtente || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailUtente)) {
      setErroreEmail("Inserisci un indirizzo email valido.");
      valido = false;
    }

    if (!passwordUtente || passwordUtente.length < 8) {
      setErrorePassword("La password deve essere di almeno 8 caratteri.");
      valido = false;
    }

    if (confermaPassword !== passwordUtente) {
      setErroreConferma("Le password non corrispondono.");
      valido = false;
    }

    return valido;
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  async function gestisciSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMessaggioErrore("");

    if (!validaForm()) return;

    setStato("submitting");

    try {
      const risposta = await fetch("/api/auth/registrazione", {
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

      if (risposta.status === 409) {
        setMessaggioErrore(
          corpo?.errore ?? "Questa email è già associata a un account."
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

  const isSubmitting = stato === "submitting";

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
            Benvenuto/a!
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
            Il tuo account è pronto. Ora puoi salvare le tue piante e
            ritrovarle sempre con te.
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
          style={{ width: "100%", maxWidth: "480px" }}
          className="animate-fade-in-up"
        >
          {/* Eyebrow pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              backgroundColor: "var(--color-primary-100)",
              color: "var(--color-primary-700)",
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
            <IconaFoglia />
            Nuovo account
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "0.75rem",
              background:
                "linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-400) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Il tuo giardino
            <br />
            ti aspetta.
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
            Crea il tuo spazio personale per tenere traccia di ogni pianta,
            annaffiatura e momento speciale.
          </p>

          {/* Card */}
          <div
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--color-border-light)",
              borderTop: "3px solid var(--color-primary-400)",
              padding: "2rem",
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
                  backgroundColor: "#fff5f5",
                  border: "1px solid #fca5a5",
                  borderRadius: "var(--radius-md)",
                  padding: "0.875rem 1rem",
                  marginBottom: "1.5rem",
                  color: "#b91c1c",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  animation: "fadeIn 0.25s ease both",
                }}
              >
                <IconaAvviso />
                <div>
                  <div style={{ fontWeight: 700, marginBottom: "0.125rem" }}>
                    Si è verificato un problema
                  </div>
                  <div>{messaggioErrore}</div>
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
                  Indirizzo email
                </label>
                <div style={{ position: "relative" }}>
                  {/* Icona sinistra */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: erroreEmail
                        ? "var(--color-accent-500)"
                        : "var(--color-text-muted)",
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
                      setErroreEmail("");
                      if (stato === "error") {
                        setMessaggioErrore("");
                        setStato("idle");
                      }
                    }}
                    placeholder="nome@esempio.it"
                    autoComplete="email"
                    inputMode="email"
                    required
                    aria-invalid={erroreEmail ? "true" : "false"}
                    aria-describedby={
                      erroreEmail ? `${idEmail}-errore` : undefined
                    }
                    style={{
                      width: "100%",
                      padding: "0.7rem 1rem 0.7rem 2.6rem",
                      fontSize: "0.9375rem",
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-primary)",
                      backgroundColor: erroreEmail
                        ? "#fff5f5"
                        : "var(--color-primary-50)",
                      border: `1.5px solid ${erroreEmail ? "var(--color-accent-500)" : "var(--color-border)"}`,
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
                      e.currentTarget.style.borderColor = erroreEmail
                        ? "var(--color-accent-500)"
                        : "var(--color-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                {erroreEmail && (
                  <p
                    id={`${idEmail}-errore`}
                    role="alert"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.8125rem",
                      color: "var(--color-accent-600)",
                      marginTop: "0.35rem",
                      animation: "fadeIn 0.2s ease both",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                      style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {erroreEmail}
                  </p>
                )}
              </div>

              {/* Campo password */}
              <div style={{ marginBottom: "1.25rem" }}>
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
                  {/* Icona lucchetto sinistra */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: errorePassword
                        ? "var(--color-accent-500)"
                        : "var(--color-text-muted)",
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
                      setErrorePassword("");
                    }}
                    placeholder="Almeno 8 caratteri"
                    autoComplete="new-password"
                    required
                    aria-invalid={errorePassword ? "true" : "false"}
                    aria-describedby={
                      errorePassword ? `${idPassword}-errore` : undefined
                    }
                    style={{
                      width: "100%",
                      padding: "0.7rem 3rem 0.7rem 2.6rem",
                      fontSize: "0.9375rem",
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-primary)",
                      backgroundColor: errorePassword
                        ? "#fff5f5"
                        : "var(--color-primary-50)",
                      border: `1.5px solid ${errorePassword ? "var(--color-accent-500)" : "var(--color-border)"}`,
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
                      e.currentTarget.style.borderColor = errorePassword
                        ? "var(--color-accent-500)"
                        : "var(--color-border)";
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

                {/* Indicatore forza password */}
                {passwordUtente && forzaPassword && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      animation: "fadeIn 0.25s ease both",
                    }}
                  >
                    {/* Barra */}
                    <div
                      style={{
                        height: "4px",
                        backgroundColor: "var(--color-border)",
                        borderRadius: "999px",
                        overflow: "hidden",
                        marginBottom: "0.3rem",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: LARGHEZZA_FORZA[forzaPassword],
                          backgroundColor: COLORI_FORZA[forzaPassword],
                          borderRadius: "999px",
                          transition:
                            "width var(--transition-base), background-color var(--transition-base)",
                        }}
                      />
                    </div>
                    {/* Etichetta */}
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: COLORI_FORZA[forzaPassword],
                      }}
                    >
                      {ETICHETTE_FORZA[forzaPassword]}
                    </span>
                  </div>
                )}

                {errorePassword && (
                  <p
                    id={`${idPassword}-errore`}
                    role="alert"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.8125rem",
                      color: "var(--color-accent-600)",
                      marginTop: "0.35rem",
                      animation: "fadeIn 0.2s ease both",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                      style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errorePassword}
                  </p>
                )}
              </div>

              {/* Campo conferma password */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor={idConferma}
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.4rem",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Conferma password
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: erroreConferma
                        ? "var(--color-accent-500)"
                        : "var(--color-text-muted)",
                      pointerEvents: "none",
                      display: "flex",
                    }}
                  >
                    <IconaLucchettoSpunta />
                  </span>
                  <input
                    id={idConferma}
                    type="password"
                    name="confermaPassword"
                    value={confermaPassword}
                    onChange={(e) => {
                      setConfermaPassword(e.target.value);
                      setErroreConferma("");
                    }}
                    placeholder="Ripeti la password"
                    autoComplete="new-password"
                    required
                    aria-invalid={erroreConferma ? "true" : "false"}
                    aria-describedby={
                      erroreConferma ? `${idConferma}-errore` : undefined
                    }
                    style={{
                      width: "100%",
                      padding: "0.7rem 1rem 0.7rem 2.6rem",
                      fontSize: "0.9375rem",
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-primary)",
                      backgroundColor: erroreConferma
                        ? "#fff5f5"
                        : "var(--color-primary-50)",
                      border: `1.5px solid ${erroreConferma ? "var(--color-accent-500)" : "var(--color-border)"}`,
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
                      e.currentTarget.style.borderColor = erroreConferma
                        ? "var(--color-accent-500)"
                        : "var(--color-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                {erroreConferma && (
                  <p
                    id={`${idConferma}-errore`}
                    role="alert"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.8125rem",
                      color: "var(--color-accent-600)",
                      marginTop: "0.35rem",
                      animation: "fadeIn 0.2s ease both",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                      style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {erroreConferma}
                  </p>
                )}
              </div>

              {/* Nota privacy */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.6rem",
                  backgroundColor: "var(--color-primary-50)",
                  border: "1px solid var(--color-primary-100)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem",
                  marginBottom: "1.5rem",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.8125rem",
                  lineHeight: 1.55,
                }}
              >
                <IconaScudo />
                <p style={{ margin: 0 }}>
                  La tua password è cifrata e non viene mai salvata in chiaro.
                  Creando un account accetti i nostri{" "}
                  <Link
                    href="/termini"
                    style={{
                      color: "var(--color-primary-600)",
                      fontWeight: 600,
                      textDecoration: "underline",
                    }}
                  >
                    Termini di servizio
                  </Link>{" "}
                  e la{" "}
                  <Link
                    href="/privacy"
                    style={{
                      color: "var(--color-primary-600)",
                      fontWeight: 600,
                      textDecoration: "underline",
                    }}
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              {/* Pulsante submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "0.875rem 1.5rem",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-on-primary)",
                  background: isSubmitting
                    ? "var(--color-primary-400)"
                    : "linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)",
                  border: "none",
                  borderRadius: "var(--radius-lg)",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: isSubmitting ? "none" : "var(--shadow-md)",
                  transition:
                    "transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast)",
                  opacity: isSubmitting ? 0.85 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    {/* Tre pallini animati */}
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
                    <span className="sr-only">Creazione account in corso…</span>
                  </>
                ) : (
                  "Crea account"
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
                  fontSize: "0.8125rem",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-body)",
                  whiteSpace: "nowrap",
                }}
              >
                hai già un account?
              </span>
              <span
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "var(--color-border-light)",
                }}
              />
            </div>

            {/* Link login */}
            <div style={{ textAlign: "center" }}>
              <Link
                href="/login"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: "var(--color-primary-600)",
                  textDecoration: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--color-primary-200)",
                  display: "inline-block",
                  transition:
                    "background-color var(--transition-fast), border-color var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-primary-50)";
                  e.currentTarget.style.borderColor =
                    "var(--color-primary-400)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor =
                    "var(--color-primary-200)";
                }}
              >
                Accedi
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
