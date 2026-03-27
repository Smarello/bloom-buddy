import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { PlantAnalysis } from "@/types/analysis";
import { creaAnalisiTest } from "../helpers/analisi";

// ─── Mock next/navigation ─────────────────────────────────────────────────────

const redirectMock = vi.fn();
const notFoundMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectMock(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  notFound: () => {
    notFoundMock();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// ─── Mock next/link ───────────────────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({ href, children, "aria-label": ariaLabel }: { href: string; children: React.ReactNode; "aria-label"?: string }) => (
    <a href={href} aria-label={ariaLabel}>{children}</a>
  ),
}));

// ─── Mock next/image ──────────────────────────────────────────────────────────

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

// ─── Mock prisma ──────────────────────────────────────────────────────────────

const findUniqueMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    collezione: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
    },
  },
}));

// ─── Import del componente (dopo i mock) ──────────────────────────────────────

import PaginaDettaglioCollezione from "@/app/collezione/[idCollezione]/page";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function creaCollezioneCompleta(analisi: Array<{ id: string; datiAnalisi: PlantAnalysis; createdAt: Date }>) {
  return {
    id: "col-123",
    nome: "Pothos dorato",
    nomeScientifico: "Epipremnum aureum",
    utenteId: "utente-123",
    createdAt: new Date("2024-06-15"),
    analisi: analisi.map((a) => ({
      ...a,
      urlFoto: `https://esempio.it/foto/${a.id}.jpg`,
      hashFoto: `hash-${a.id}`,
      utenteId: "utente-123",
      collezioneId: "col-123",
    })),
  };
}

function creaParams(idCollezione: string): Promise<{ idCollezione: string }> {
  return Promise.resolve({ idCollezione });
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

// ─── Suite principale ─────────────────────────────────────────────────────────

describe("PaginaDettaglioCollezione", () => {
  it("reindirizza a /accesso quando l'utente non è autenticato", async () => {
    ottieniSessioneServerMock.mockResolvedValue({});

    await expect(
      PaginaDettaglioCollezione({ params: creaParams("col-123") }),
    ).rejects.toThrow("NEXT_REDIRECT:/accesso");

    expect(redirectMock).toHaveBeenCalledWith("/accesso");
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("restituisce 404 quando la collezione non esiste", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findUniqueMock.mockResolvedValue(null);

    await expect(
      PaginaDettaglioCollezione({ params: creaParams("col-inesistente") }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalled();
  });

  it("restituisce 404 quando la collezione appartiene a un altro utente", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-diverso" });
    findUniqueMock.mockResolvedValue({
      id: "col-123",
      nome: "Pothos dorato",
      nomeScientifico: "Epipremnum aureum",
      utenteId: "utente-123",
      createdAt: new Date("2024-06-15"),
      analisi: [],
    });

    await expect(
      PaginaDettaglioCollezione({ params: creaParams("col-123") }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalled();
  });

  it("mostra le etichette di salute corrette per ogni stato", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findUniqueMock.mockResolvedValue(
      creaCollezioneCompleta([
        { id: "a1", datiAnalisi: creaAnalisiTest({ statoSalute: "excellent" }), createdAt: new Date("2024-08-01") },
        { id: "a2", datiAnalisi: creaAnalisiTest({ statoSalute: "good" }), createdAt: new Date("2024-07-01") },
        { id: "a3", datiAnalisi: creaAnalisiTest({ statoSalute: "fair" }), createdAt: new Date("2024-06-01") },
        { id: "a4", datiAnalisi: creaAnalisiTest({ statoSalute: "poor" }), createdAt: new Date("2024-05-01") },
      ]),
    );

    render(await PaginaDettaglioCollezione({ params: creaParams("col-123") }));

    expect(screen.getByText("Ottima")).toBeInTheDocument();
    expect(screen.getByText("Buona")).toBeInTheDocument();
    expect(screen.getByText("Discreta")).toBeInTheDocument();
    expect(screen.getByText("Critica")).toBeInTheDocument();
  });

  it("mostra le analisi in ordine dalla più recente", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findUniqueMock.mockResolvedValue(
      creaCollezioneCompleta([
        { id: "recente", datiAnalisi: creaAnalisiTest(), createdAt: new Date("2024-09-10") },
        { id: "vecchia", datiAnalisi: creaAnalisiTest(), createdAt: new Date("2024-03-05") },
      ]),
    );

    render(await PaginaDettaglioCollezione({ params: creaParams("col-123") }));

    const elementiData = screen.getAllByRole("time");
    expect(elementiData).toHaveLength(2);
    expect(elementiData[0]).toHaveAttribute("dateTime", new Date("2024-09-10").toISOString());
    expect(elementiData[1]).toHaveAttribute("dateTime", new Date("2024-03-05").toISOString());
  });

  it("ogni analisi è un link verso /analysis?id={id}", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findUniqueMock.mockResolvedValue(
      creaCollezioneCompleta([
        { id: "analisi-abc", datiAnalisi: creaAnalisiTest(), createdAt: new Date("2024-06-15") },
        { id: "analisi-xyz", datiAnalisi: creaAnalisiTest(), createdAt: new Date("2024-05-10") },
      ]),
    );

    render(await PaginaDettaglioCollezione({ params: creaParams("col-123") }));

    const linkAnalisiAbc = screen.getByRole("link", { name: /15 giugno 2024/i });
    expect(linkAnalisiAbc).toHaveAttribute("href", "/analysis?id=analisi-abc");

    const linkAnalisiXyz = screen.getByRole("link", { name: /10 maggio 2024/i });
    expect(linkAnalisiXyz).toHaveAttribute("href", "/analysis?id=analisi-xyz");
  });

  it("mostra il link 'Nuova analisi' che punta alla home con collezioneId", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findUniqueMock.mockResolvedValue(
      creaCollezioneCompleta([
        { id: "a1", datiAnalisi: creaAnalisiTest(), createdAt: new Date("2024-08-01") },
      ]),
    );

    render(await PaginaDettaglioCollezione({ params: creaParams("col-123") }));

    const linkNuovaAnalisi = screen.getByRole("link", { name: /nuova analisi/i });
    expect(linkNuovaAnalisi).toBeInTheDocument();
    expect(linkNuovaAnalisi).toHaveAttribute("href", "/?collezioneId=col-123");
  });

  it("mostra il messaggio di stato vuoto quando la collezione non ha analisi", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findUniqueMock.mockResolvedValue({
      id: "col-123",
      nome: "Pothos dorato",
      nomeScientifico: "Epipremnum aureum",
      utenteId: "utente-123",
      createdAt: new Date("2024-06-15"),
      analisi: [],
    });

    render(await PaginaDettaglioCollezione({ params: creaParams("col-123") }));

    expect(screen.getByText("Nessuna analisi in questa collezione")).toBeInTheDocument();
  });
});
