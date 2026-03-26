import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mock next/navigation ────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// ─── Mock next/link ──────────────────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// ─── Import del componente (dopo i mock) ─────────────────────────────────────

import PaginaAccesso from "@/app/accesso/page";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function creaFetchMock(status: number, corpo: object) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(corpo),
  });
}

async function compilaForm(
  utente: ReturnType<typeof userEvent.setup>,
  email: string,
  password: string,
) {
  await utente.type(screen.getByLabelText(/^email$/i), email);
  await utente.type(screen.getByLabelText(/^password$/i), password);
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
});

// ─── Suite principale ─────────────────────────────────────────────────────────

describe("PaginaAccesso", () => {
  // ── 1. Rendering iniziale ──────────────────────────────────────────────────

  describe("rendering iniziale", () => {
    it("mostra i campi email, password e il pulsante 'Accedi'", () => {
      render(<PaginaAccesso />);

      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /accedi/i }),
      ).toBeInTheDocument();
    });

    it("mostra il link alla pagina di registrazione", () => {
      render(<PaginaAccesso />);

      expect(screen.getByText(/creane uno gratis/i)).toBeInTheDocument();
    });
  });

  // ── 2. Submit con credenziali valide (risposta 200) ───────────────────────

  describe("submit con credenziali valide", () => {
    it("chiama fetch e mostra l'overlay di successo con 'Bentornato!'", async () => {
      global.fetch = creaFetchMock(200, { successo: true });
      const utente = userEvent.setup();

      render(<PaginaAccesso />);

      await compilaForm(utente, "giulia@esempio.it", "Password123!");
      await utente.click(screen.getByRole("button", { name: /accedi/i }));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/accesso",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: JSON.stringify({ email: "giulia@esempio.it", password: "Password123!" }),
        }),
      );

      expect(await screen.findByText("Bentornato!")).toBeInTheDocument();
    });
  });

  // ── 3. Errore credenziali (risposta 401) ──────────────────────────────────

  describe("errore credenziali errate", () => {
    it("mostra il banner di errore con il messaggio del server", async () => {
      global.fetch = creaFetchMock(401, {
        errore: "Email o password non corrispondono. Nessun problema, riprova con calma!",
      });
      const utente = userEvent.setup();

      render(<PaginaAccesso />);

      await compilaForm(utente, "giulia@esempio.it", "PasswordSbagliata");
      await utente.click(screen.getByRole("button", { name: /accedi/i }));

      expect(
        await screen.findByText(/ops, qualcosa non torna/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/email o password non corrispondono/i),
      ).toBeInTheDocument();
    });
  });

  // ── 4. Stato disabilitato del button durante il submit ────────────────────

  describe("stato del pulsante durante il submit", () => {
    it("il pulsante è disabilitato mentre la richiesta fetch è in corso", async () => {
      let risolvi: (value: unknown) => void;
      const promessaPendente = new Promise((res) => {
        risolvi = res;
      });
      global.fetch = vi.fn().mockReturnValue(promessaPendente);

      const utente = userEvent.setup();

      render(<PaginaAccesso />);

      await compilaForm(utente, "giulia@esempio.it", "Password123!");

      const promessaClick = utente.click(
        screen.getByRole("button", { name: /accedi/i }),
      );

      const bottoneSubmit = await screen.findByRole("button", {
        name: /accesso in corso/i,
      });
      expect(bottoneSubmit).toBeDisabled();

      risolvi!({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ successo: true }),
      });
      await promessaClick;
    });
  });
});
