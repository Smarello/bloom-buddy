import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { PlantAnalysis } from "@/types/analysis";

// ─── Mock next/navigation ────────────────────────────────────────────────────

const redirectMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectMock(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));

// ─── Mock next/link ──────────────────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// ─── Mock next/image ─────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// ─── Mock sessione server ─────────────────────────────────────────────────────

const ottieniSessioneServerMock = vi.fn();

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessioneServer: () => ottieniSessioneServerMock(),
}));

// ─── Mock prisma ─────────────────────────────────────────────────────────────

const findManyMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    analisi: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

// ─── Import del componente (dopo i mock) ─────────────────────────────────────

import PaginaCollezione from "@/app/collezione/page";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function creaAnalisiTest(override: Partial<PlantAnalysis> = {}): PlantAnalysis {
  return {
    nomeComune: "Pothos dorato",
    nomeScientifico: "Epipremnum aureum",
    descrizione: "Una pianta tropicale molto resistente.",
    livelloConfidenza: 0.92,
    statoSalute: "good",
    descrizioneSalute: "La pianta è in buone condizioni.",
    consigliCura: [
      {
        titolo: "Annaffia regolarmente",
        descrizione: "Ogni 7-10 giorni.",
        priorita: "media",
      },
    ],
    informazioniGenerali: {
      annaffiatura: "Ogni 7-10 giorni",
      luce: "Luce indiretta brillante",
      temperatura: "15-30 °C",
      umidita: "Media (40-60%)",
    },
    informazioniRapide: {
      annaffiatura: "Moderata",
      luce: "Indiretta",
      temperatura: "18-25 °C",
      umidita: "Media",
    },
    ...override,
  };
}

function creaRecordAnalisi(
  id: string,
  datiAnalisi: PlantAnalysis,
  dataSalvataggio: Date = new Date("2024-06-15"),
) {
  return {
    id,
    utenteId: "utente-123",
    urlFoto: `https://esempio.it/foto/${id}.jpg`,
    datiAnalisi,
    createdAt: dataSalvataggio,
    hashFoto: `hash-${id}`,
  };
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

// ─── Suite principale ─────────────────────────────────────────────────────────

describe("PaginaCollezione", () => {
  // ── 1. Redirect per utente non autenticato ────────────────────────────────

  it("reindirizza a /accesso quando l'utente non è autenticato", async () => {
    ottieniSessioneServerMock.mockResolvedValue({});

    await expect(PaginaCollezione()).rejects.toThrow("NEXT_REDIRECT:/accesso");
    expect(redirectMock).toHaveBeenCalledWith("/accesso");
    expect(findManyMock).not.toHaveBeenCalled();
  });

  // ── 2. Rendering lista piante salvate ────────────────────────────────────

  it("mostra la lista delle piante salvate con thumbnail, nomi e data", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123", email: "giulia@esempio.it" });

    const dataSalvataggio = new Date("2024-06-15");
    findManyMock.mockResolvedValue([
      creaRecordAnalisi("analisi-1", creaAnalisiTest({
        nomeComune: "Pothos dorato",
        nomeScientifico: "Epipremnum aureum",
        statoSalute: "good",
      }), dataSalvataggio),
      creaRecordAnalisi("analisi-2", creaAnalisiTest({
        nomeComune: "Ficus elastica",
        nomeScientifico: "Ficus elastica",
        statoSalute: "excellent",
      }), dataSalvataggio),
    ]);

    render(await PaginaCollezione());

    // Nomi comuni (h2)
    expect(screen.getByRole("heading", { name: "Pothos dorato" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ficus elastica" })).toBeInTheDocument();

    // Nomi scientifici
    expect(screen.getByText("Epipremnum aureum")).toBeInTheDocument();
    expect(screen.getAllByText("Ficus elastica").length).toBeGreaterThanOrEqual(1);

    // Thumbnail (img con alt = nomeComune)
    expect(screen.getByAltText("Pothos dorato")).toBeInTheDocument();
    expect(screen.getByAltText("Ficus elastica")).toBeInTheDocument();

    // Data formattata in italiano (15 giugno 2024)
    const dateElements = screen.getAllByText(/giugno 2024/i);
    expect(dateElements.length).toBeGreaterThanOrEqual(2);

    // Badge stato salute
    expect(screen.getByText("Buona")).toBeInTheDocument();
    expect(screen.getByText("Ottima")).toBeInTheDocument();
  });

  // ── 3. Stato vuoto quando non ci sono analisi ────────────────────────────

  it("mostra il messaggio e il CTA quando la collezione è vuota", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123", email: "giulia@esempio.it" });
    findManyMock.mockResolvedValue([]);

    render(await PaginaCollezione());

    expect(screen.getByText("La tua collezione è ancora vuota")).toBeInTheDocument();
    expect(
      screen.getByText(/analizza una pianta e salvala per iniziare/i),
    ).toBeInTheDocument();

    const linkAnalizza = screen.getByRole("link", { name: /analizza la tua prima pianta/i });
    expect(linkAnalizza).toBeInTheDocument();
    expect(linkAnalizza).toHaveAttribute("href", "/");
  });
});
