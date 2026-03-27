"use client";

import { useState, useId } from "react";
import {
  IconaLucchetto,
  IconaOcchioAperto,
  IconaOcchioChiuso,
  IconaAvviso,
} from "@/components/icone-form";

// ─── Tipi ────────────────────────────────────────────────────────────────────

type StatoForm = "idle" | "submitting" | "error" | "success";

type RobustezzaPassword = "Debole" | "Media" | "Forte";

// ─── Utilità ─────────────────────────────────────────────────────────────────

function valutaRobustezza(password: string): RobustezzaPassword {
  const haMaiuscola = /[A-Z]/.test(password);
  const haNumero = /\d/.test(password);
  const haSpeciale = /[^A-Za-z0-9]/.test(password);

  if (password.length >= 8 && haMaiuscola && haNumero && haSpeciale) return "Forte";
  if (password.length >= 6 && (haMaiuscola || haNumero)) return "Media";
  return "Debole";
}

const COLORI_ROBUSTEZZA: Record<RobustezzaPassword, string> = {
  Debole: "#e06060",
  Media: "#d4a03c",
  Forte: "#4a9e4a",
};

const PERCENTUALE_ROBUSTEZZA: Record<RobustezzaPassword, string> = {
  Debole: "33%",
  Media: "66%",
  Forte: "100%",
};

// ─── Stili condivisi ─────────────────────────────────────────────────────────

const stileCampoBase: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 3rem 0.7rem 2.6rem",
  fontSize: "0.9375rem",
  fontFamily: "var(--font-body)",
  color: "var(--color-text-primary)",
  backgroundColor: "var(--color-cream-50)",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  outline: "none",
  boxSizing: "border-box" as const,
  transition:
    "border-color var(--transition-fast), box-shadow var(--transition-fast)",
};

const stileCampoErrore: React.CSSProperties = {
  borderColor: "var(--color-accent-500)",
  backgroundColor: "rgba(224, 96, 96, 0.03)",
};

const stileEtichetta: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "var(--color-text-primary)",
  marginBottom: "0.4rem",
  fontFamily: "var(--font-display)",
};

const stileIconaSinistra: React.CSSProperties = {
  position: "absolute",
  left: "0.875rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--color-text-muted)",
  pointerEvents: "none",
  display: "flex",
};

const stilePulsanteOcchio: React.CSSProperties = {
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
};

// ─── Sotto-componente campo password ─────────────────────────────────────────

function CampoPassword({
  id,
  valore,
  onChange,
  placeholder,
  autoComplete,
  visibile,
  onToggleVisibilita,
  haErrore,
  onFocus,
  onBlur,
}: {
  id: string;
  valore: string;
  onChange: (valore: string) => void;
  placeholder: string;
  autoComplete: string;
  visibile: boolean;
  onToggleVisibilita: () => void;
  haErrore?: boolean;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <span aria-hidden="true" style={stileIconaSinistra}>
        <IconaLucchetto />
      </span>
      <input
        id={id}
        type={visibile ? "text" : "password"}
        value={valore}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        style={{
          ...stileCampoBase,
          ...(haErrore ? stileCampoErrore : {}),
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <button
        type="button"
        onClick={onToggleVisibilita}
        aria-label={visibile ? "Nascondi password" : "Mostra password"}
        style={stilePulsanteOcchio}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--color-primary-600)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--color-text-muted)";
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
          {visibile ? <IconaOcchioChiuso /> : <IconaOcchioAperto />}
        </svg>
      </button>
    </div>
  );
}

// ─── Componente principale ───────────────────────────────────────────────────

export default function FormCambioPassword() {
  // Stato form
  const [stato, setStato] = useState<StatoForm>("idle");
  const [messaggioErroreBanner, setMessaggioErroreBanner] = useState("");
  const [descrizioneErroreBanner, setDescrizioneErroreBanner] = useState("");

  // Valori campi
  const [passwordAttuale, setPasswordAttuale] = useState("");
  const [nuovaPassword, setNuovaPassword] = useState("");
  const [confermaPassword, setConfermaPassword] = useState("");

  // Visibilità toggle
  const [visibileAttuale, setVisibileAttuale] = useState(false);
  const [visibileNuova, setVisibileNuova] = useState(false);
  const [visibileConferma, setVisibileConferma] = useState(false);

  // Errori campo
  const [erroreNuovaPassword, setErroreNuovaPassword] = useState("");
  const [erroreConfermaPassword, setErroreConfermaPassword] = useState("");

  // Toast successo
  const [mostraToastSuccesso, setMostraToastSuccesso] = useState(false);

  // ID accessibilità
  const idPasswordAttuale = useId();
  const idNuovaPassword = useId();
  const idConfermaPassword = useId();

  const staInviando = stato === "submitting";

  // ─── Robustezza password ────────────────────────────────────────────────────

  const robustezza = nuovaPassword ? valutaRobustezza(nuovaPassword) : null;

  // ─── Validazione e submit ───────────────────────────────────────────────────

  async function gestisciSubmit(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    // Reset errori
    setErroreNuovaPassword("");
    setErroreConfermaPassword("");
    setMessaggioErroreBanner("");
    setDescrizioneErroreBanner("");

    // Validazione client-side
    let haErrori = false;

    if (nuovaPassword.length < 8) {
      setErroreNuovaPassword("La password deve avere almeno 8 caratteri");
      haErrori = true;
    }

    if (nuovaPassword !== confermaPassword) {
      setErroreConfermaPassword("Le password non coincidono");
      haErrori = true;
    }

    if (haErrori) {
      setStato("error");
      return;
    }

    setStato("submitting");

    try {
      const risposta = await fetch("/api/auth/cambio-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordAttuale, nuovaPassword, confermaPassword }),
      });

      if (risposta.ok) {
        setStato("success");
        setMostraToastSuccesso(true);
        setPasswordAttuale("");
        setNuovaPassword("");
        setConfermaPassword("");

        // Nascondi il toast dopo qualche secondo
        setTimeout(() => setMostraToastSuccesso(false), 4000);
        // Torna a idle dopo il toast
        setTimeout(() => setStato("idle"), 4000);
        return;
      }

      const corpo = await risposta.json().catch(() => ({}));

      if (risposta.status === 401) {
        setMessaggioErroreBanner("Password attuale errata");
        setDescrizioneErroreBanner(
          "Verifica di aver inserito correttamente la tua password attuale e riprova."
        );
      } else if (risposta.status === 400) {
        setMessaggioErroreBanner(corpo?.errore ?? "Errore di validazione");
        setDescrizioneErroreBanner(corpo?.descrizione ?? "");
      } else {
        setMessaggioErroreBanner("Si è verificato un errore");
        setDescrizioneErroreBanner("Riprova tra qualche istante.");
      }

      setStato("error");
    } catch {
      setMessaggioErroreBanner("Impossibile connettersi al server");
      setDescrizioneErroreBanner("Controlla la tua connessione e riprova.");
      setStato("error");
    }
  }

  // ─── Focus/blur handlers ────────────────────────────────────────────────────

  function gestisciFocus(evento: React.FocusEvent<HTMLInputElement>) {
    evento.currentTarget.style.borderColor = "var(--color-primary-400)";
    evento.currentTarget.style.boxShadow = "0 0 0 3px rgba(106, 158, 106, 0.12)";
  }

  function gestisciBlur(evento: React.FocusEvent<HTMLInputElement>) {
    evento.currentTarget.style.borderColor = "var(--color-border)";
    evento.currentTarget.style.boxShadow = "none";
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: "relative" }}>
      {/* ── Toast successo ── */}
      {mostraToastSuccesso && (
        <div
          role="status"
          aria-live="polite"
          style={{
            backgroundColor: "rgba(74, 158, 74, 0.08)",
            border: "1px solid rgba(74, 158, 74, 0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "0.875rem 1rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            animation: "fadeIn 0.3s ease both",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: "36px",
              height: "36px",
              borderRadius: "999px",
              backgroundColor: "rgba(74, 158, 74, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4a9e4a",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ width: "1.125rem", height: "1.125rem" }}
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                fontSize: "0.875rem",
                color: "#3a7a3a",
                marginBottom: "0.25rem",
              }}
            >
              Password aggiornata!
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              La tua nuova password è attiva da adesso.
            </div>
          </div>
        </div>
      )}

      {/* ── Banner errore ── */}
      {stato === "error" && messaggioErroreBanner && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            backgroundColor: "rgba(224, 96, 96, 0.07)",
            border: "1.5px solid rgba(224, 96, 96, 0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "0.875rem 1rem",
            marginBottom: "1.5rem",
            animation: "fadeIn 0.25s ease both",
          }}
        >
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
              {messaggioErroreBanner}
            </div>
            {descrizioneErroreBanner && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {descrizioneErroreBanner}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={gestisciSubmit} noValidate>
        {/* Campo password attuale */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label htmlFor={idPasswordAttuale} style={stileEtichetta}>
            Password attuale
          </label>
          <CampoPassword
            id={idPasswordAttuale}
            valore={passwordAttuale}
            onChange={(v) => {
              setPasswordAttuale(v);
              if (stato === "error") {
                setMessaggioErroreBanner("");
                setDescrizioneErroreBanner("");
              }
            }}
            placeholder="Inserisci la password attuale"
            autoComplete="current-password"
            visibile={visibileAttuale}
            onToggleVisibilita={() => setVisibileAttuale((v) => !v)}
            onFocus={gestisciFocus}
            onBlur={gestisciBlur}
          />
        </div>

        {/* Divisore sezione */}
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--color-border-light)",
            margin: "1.5rem 0",
          }}
        />

        {/* Campo nuova password */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label htmlFor={idNuovaPassword} style={stileEtichetta}>
            Nuova password
          </label>
          <CampoPassword
            id={idNuovaPassword}
            valore={nuovaPassword}
            onChange={(v) => {
              setNuovaPassword(v);
              if (erroreNuovaPassword) setErroreNuovaPassword("");
            }}
            placeholder="Scegli una nuova password"
            autoComplete="new-password"
            visibile={visibileNuova}
            onToggleVisibilita={() => setVisibileNuova((v) => !v)}
            haErrore={!!erroreNuovaPassword}
            onFocus={gestisciFocus}
            onBlur={gestisciBlur}
          />

          {/* Errore campo nuova password */}
          {erroreNuovaPassword && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                marginTop: "0.375rem",
                fontSize: "0.8125rem",
                color: "var(--color-accent-500)",
              }}
            >
              <IconaAvviso />
              {erroreNuovaPassword}
            </div>
          )}

          {/* Indicatore robustezza password */}
          {robustezza && (
            <div style={{ marginTop: "0.5rem" }}>
              <div
                style={{
                  height: "4px",
                  backgroundColor: "var(--color-border-light)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: PERCENTUALE_ROBUSTEZZA[robustezza],
                    backgroundColor: COLORI_ROBUSTEZZA[robustezza],
                    borderRadius: "999px",
                    transition: "width var(--transition-base), background-color var(--transition-base)",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: COLORI_ROBUSTEZZA[robustezza],
                  marginTop: "0.25rem",
                  fontFamily: "var(--font-display)",
                }}
              >
                {robustezza}
              </div>
            </div>
          )}
        </div>

        {/* Campo conferma nuova password */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor={idConfermaPassword} style={stileEtichetta}>
            Conferma nuova password
          </label>
          <CampoPassword
            id={idConfermaPassword}
            valore={confermaPassword}
            onChange={(v) => {
              setConfermaPassword(v);
              if (erroreConfermaPassword) setErroreConfermaPassword("");
            }}
            placeholder="Ripeti la nuova password"
            autoComplete="new-password"
            visibile={visibileConferma}
            onToggleVisibilita={() => setVisibileConferma((v) => !v)}
            haErrore={!!erroreConfermaPassword}
            onFocus={gestisciFocus}
            onBlur={gestisciBlur}
          />

          {/* Errore campo conferma */}
          {erroreConfermaPassword && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                marginTop: "0.375rem",
                fontSize: "0.8125rem",
                color: "var(--color-accent-500)",
              }}
            >
              <IconaAvviso />
              {erroreConfermaPassword}
            </div>
          )}
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
              <span className="sr-only">Aggiornamento in corso…</span>
            </>
          ) : (
            <>
              <IconaLucchetto />
              Aggiorna password
            </>
          )}
        </button>
      </form>
    </div>
  );
}
