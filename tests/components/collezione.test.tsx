import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { PlantAnalysis } from "@/types/analysis";
import { creaAnalisiTest } from "../helpers/analisi";

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

const findManyCollezioneMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    collezione: {
      findMany: (...args: unknown[]) => findManyCollezioneMock(...args),
    },
  },
}));

// ─── Import del componente (dopo i mock) ─────────────────────────────────────

import PaginaCollezione from "@/app/collezione/page";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function creaCollezioneConAnalisi(
  id: string,
  nome: string,
  nomeScientifico: string,
  datiAnalisi: PlantAnalysis,
  dataSalvataggio: Date = new Date("2024-06-15"),
  totaleAnalisi = 1,
) {
  return {
    id,
    nome,
    nomeScientifico,
    utenteId: "utente-123",
    createdAt: dataSalvataggio,
    analisi: [
      {
        id: `analisi-${id}`,
        urlFoto: `https://esempio.it/foto/${id}.jpg`,
        datiAnalisi,
        createdAt: dataSalvataggio,
      },
    ],
    _count: { analisi: totaleAnalisi },
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
  it("reindirizza a /accesso quando l'utente non è autenticato", async () => {
    ottieniSessioneServerMock.mockResolvedValue({});

    await expect(PaginaCollezione()).rejects.toThrow("NEXT_REDIRECT:/accesso");
    expect(redirectMock).toHaveBeenCalledWith("/accesso");
    expect(findManyCollezioneMock).not.toHaveBeenCalled();
  });

  it("mostra la lista delle piante salvate con thumbnail, nomi e data", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123", email: "giulia@esempio.it" });

    const dataSalvataggio = new Date("2024-06-15");
    findManyCollezioneMock.mockResolvedValue([
      creaCollezioneConAnalisi(
        "col-1",
        "Pothos dorato",
        "Epipremnum aureum",
        creaAnalisiTest({ nomeComune: "Pothos dorato", nomeScientifico: "Epipremnum aureum", statoSalute: "good" }),
        dataSalvataggio,
      ),
      creaCollezioneConAnalisi(
        "col-2",
        "Ficus elastica",
        "Ficus elastica",
        creaAnalisiTest({ nomeComune: "Ficus elastica", nomeScientifico: "Ficus elastica", statoSalute: "excellent" }),
        dataSalvataggio,
      ),
    ]);

    render(await PaginaCollezione());

    // Nomi comuni (h2)
    expect(screen.getByRole("heading", { name: "Pothos dorato" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ficus elastica" })).toBeInTheDocument();

    // Nomi scientifici
    expect(screen.getByText("Epipremnum aureum")).toBeInTheDocument();
    expect(screen.getAllByText("Ficus elastica").length).toBeGreaterThanOrEqual(1);

    // Thumbnail (img con alt = nome collezione)
    expect(screen.getByAltText("Pothos dorato")).toBeInTheDocument();
    expect(screen.getByAltText("Ficus elastica")).toBeInTheDocument();

    // Data formattata in italiano (15 giugno 2024)
    const dateElements = screen.getAllByText(/giugno 2024/i);
    expect(dateElements.length).toBeGreaterThanOrEqual(2);

    // Badge stato salute
    expect(screen.getByText("Buona")).toBeInTheDocument();
    expect(screen.getByText("Ottima")).toBeInTheDocument();
  });

  it("mostra il messaggio e il CTA quando la collezione è vuota", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123", email: "giulia@esempio.it" });
    findManyCollezioneMock.mockResolvedValue([]);

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
