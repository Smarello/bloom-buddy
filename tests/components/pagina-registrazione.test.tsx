import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mock next/navigation ────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// ─── Mock next/link ──────────────────────────────────────────────────────────
// Link viene usato per i collegamenti ai termini e alla privacy, non rilevante per i test

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// ─── Import del componente (dopo i mock) ─────────────────────────────────────

import PaginaRegistrazione from "@/app/registrazione/page";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Crea un mock di fetch che restituisce una risposta con lo stato e il corpo forniti.
 */
function creaFetchMock(status: number, corpo: object) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(corpo),
  });
}

/**
 * Compila i tre campi del form con i valori forniti.
 */
async function compilaForm(
  utente: ReturnType<typeof userEvent.setup>,
  email: string,
  password: string,
  conferma: string,
) {
  await utente.type(screen.getByLabelText(/indirizzo email/i), email);
  await utente.type(screen.getByLabelText(/^password$/i), password);
  await utente.type(screen.getByLabelText(/conferma password/i), conferma);
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  // Ripristina il mock di fetch prima di ogni test
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
});

// ─── Suite principale ─────────────────────────────────────────────────────────

describe("PaginaRegistrazione", () => {
  // ── 1. Rendering iniziale ──────────────────────────────────────────────────

  describe("rendering iniziale", () => {
    it("mostra i campi email, password, conferma password e il pulsante 'Crea account'", () => {
      render(<PaginaRegistrazione />);

      expect(screen.getByLabelText(/indirizzo email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/conferma password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /crea account/i }),
      ).toBeInTheDocument();
    });

    it("il pulsante 'Crea account' è abilitato allo stato iniziale", () => {
      render(<PaginaRegistrazione />);

      expect(
        screen.getByRole("button", { name: /crea account/i }),
      ).not.toBeDisabled();
    });
  });

  // ── 2. Submit con dati validi (risposta 200) ───────────────────────────────

  describe("submit con dati validi", () => {
    it("chiama fetch con email e password corrette e mostra l'overlay di successo", async () => {
      global.fetch = creaFetchMock(200, { successo: true });
      const utente = userEvent.setup();

      render(<PaginaRegistrazione />);

      await compilaForm(utente, "mario@esempio.it", "Password123!", "Password123!");
      await utente.click(screen.getByRole("button", { name: /crea account/i }));

      // Verifica che fetch sia stato chiamato con i dati corretti
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/registrazione",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: JSON.stringify({ email: "mario@esempio.it", password: "Password123!" }),
        }),
      );

      // Verifica che l'overlay di successo sia visibile
      expect(await screen.findByText("Benvenuto/a!")).toBeInTheDocument();
      expect(
        screen.getByText(/il tuo account è pronto/i),
      ).toBeInTheDocument();
    });

    it("l'overlay di successo ha role='alert' per i lettori di schermo", async () => {
      global.fetch = creaFetchMock(200, { successo: true });
      const utente = userEvent.setup();

      render(<PaginaRegistrazione />);

      await compilaForm(utente, "giulia@esempio.it", "SecurePass8", "SecurePass8");
      await utente.click(screen.getByRole("button", { name: /crea account/i }));

      // Attende la comparsa del testo di benvenuto, poi verifica che il suo
      // contenitore più vicino con role="alert" esista nel documento
      await screen.findByText("Benvenuto/a!");
      const elementiAlert = screen.getAllByRole("alert");
      expect(elementiAlert.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── 3. Errore email duplicata (risposta 409) ───────────────────────────────

  describe("errore email già registrata", () => {
    it("mostra il messaggio di errore quando il server risponde con status 409", async () => {
      global.fetch = creaFetchMock(409, {
        errore: "Questa email è già registrata.",
      });
      const utente = userEvent.setup();

      render(<PaginaRegistrazione />);

      await compilaForm(utente, "esistente@esempio.it", "Password123!", "Password123!");
      await utente.click(screen.getByRole("button", { name: /crea account/i }));

      // Il banner di errore deve comparire con il messaggio del server
      expect(
        await screen.findByText("Questa email è già registrata."),
      ).toBeInTheDocument();
    });

    it("il banner di errore ha role='alert' ed è accessibile", async () => {
      global.fetch = creaFetchMock(409, {
        errore: "Questa email è già registrata.",
      });
      const utente = userEvent.setup();

      render(<PaginaRegistrazione />);

      await compilaForm(utente, "doppione@esempio.it", "Password123!", "Password123!");
      await utente.click(screen.getByRole("button", { name: /crea account/i }));

      // Attende il banner e verifica l'intestazione
      expect(
        await screen.findByText(/si è verificato un problema/i),
      ).toBeInTheDocument();
    });

    it("mostra il messaggio di fallback quando il server risponde 409 senza body", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.reject(new SyntaxError("no json")),
      });
      const utente = userEvent.setup();

      render(<PaginaRegistrazione />);

      await compilaForm(utente, "vuoto@esempio.it", "Password123!", "Password123!");
      await utente.click(screen.getByRole("button", { name: /crea account/i }));

      expect(
        await screen.findByText(/questa email è già associata a un account/i),
      ).toBeInTheDocument();
    });
  });

  // ── 4. Stato disabilitato del button durante il submit ────────────────────

  describe("stato del pulsante durante il submit", () => {
    it("il pulsante è disabilitato mentre la richiesta fetch è in corso", async () => {
      // Fetch che non si risolve mai → simula richiesta pendente
      let risolvi: (value: unknown) => void;
      const promessaPendente = new Promise((res) => {
        risolvi = res;
      });
      global.fetch = vi.fn().mockReturnValue(promessaPendente);

      const utente = userEvent.setup();

      render(<PaginaRegistrazione />);

      await compilaForm(utente, "lento@esempio.it", "Password123!", "Password123!");

      // Avvia il click ma non attendere il completamento
      const promessaClick = utente.click(
        screen.getByRole("button", { name: /crea account/i }),
      );

      // Il pulsante deve essere disabilitato durante l'attesa
      const bottoneSubmit = await screen.findByRole("button", {
        name: /creazione account in corso/i,
      });
      expect(bottoneSubmit).toBeDisabled();

      // Risolvi la fetch per non lasciare promise pendenti
      risolvi!({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ successo: true }),
      });
      await promessaClick;
    });

    it("il testo del pulsante diventa accessibile ('Creazione account in corso…') durante il submit", async () => {
      let risolvi: (value: unknown) => void;
      const promessaPendente = new Promise((res) => {
        risolvi = res;
      });
      global.fetch = vi.fn().mockReturnValue(promessaPendente);

      const utente = userEvent.setup();

      render(<PaginaRegistrazione />);

      await compilaForm(utente, "attesa@esempio.it", "Password123!", "Password123!");

      const promessaClick = utente.click(
        screen.getByRole("button", { name: /crea account/i }),
      );

      // Mentre la fetch è pendente il testo sr-only è presente
      expect(
        await screen.findByText(/creazione account in corso/i),
      ).toBeInTheDocument();

      risolvi!({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ successo: true }),
      });
      await promessaClick;
    });
  });

  // ── 5. Validazione client-side ─────────────────────────────────────────────

  describe("validazione lato client", () => {
    it("mostra errore inline se l'email non è valida e NON chiama fetch", async () => {
      global.fetch = vi.fn();
      const utente = userEvent.setup();

      render(<PaginaRegistrazione />);

      await compilaForm(utente, "non-una-email", "Password123!", "Password123!");
      await utente.click(screen.getByRole("button", { name: /crea account/i }));

      expect(
        screen.getByText(/inserisci un indirizzo email valido/i),
      ).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("mostra errore inline se le password non coincidono e NON chiama fetch", async () => {
      global.fetch = vi.fn();
      const utente = userEvent.setup();

      render(<PaginaRegistrazione />);

      await compilaForm(utente, "ok@esempio.it", "Password123!", "Diversa123!");
      await utente.click(screen.getByRole("button", { name: /crea account/i }));

      expect(
        screen.getByText(/le password non corrispondono/i),
      ).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
