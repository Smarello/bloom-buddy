import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { PlantAnalysis } from "@/types/analysis";

// ─── Mock next/navigation ─────────────────────────────────────────────────────

const redirectMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectMock(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
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

const findManyMock = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    analisi: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

// ─── Import del componente (dopo i mock) ──────────────────────────────────────

import PaginaAnalisiPianta from "@/app/collezione/[nomePianta]/page";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function creaParams(nomePianta: string): Promise<{ nomePianta: string }> {
  return Promise.resolve({ nomePianta });
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

// ─── Suite principale ─────────────────────────────────────────────────────────

describe("PaginaAnalisiPianta", () => {
  // ── 1. Redirect per utente non autenticato ───────────────────────────────

  it("reindirizza a /accesso quando l'utente non è autenticato", async () => {
    ottieniSessioneServerMock.mockResolvedValue({});

    await expect(
      PaginaAnalisiPianta({ params: creaParams("Pothos%20dorato") }),
    ).rejects.toThrow("NEXT_REDIRECT:/accesso");

    expect(redirectMock).toHaveBeenCalledWith("/accesso");
    expect(findManyMock).not.toHaveBeenCalled();
  });

  // ── 2. Indicatori di stato salute ────────────────────────────────────────

  it("mostra l'etichetta 'Ottima' per analisi con statoSalute excellent", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findManyMock.mockResolvedValue([
      creaRecordAnalisi("analisi-1", creaAnalisiTest({ nomeComune: "Pothos dorato", statoSalute: "excellent" })),
    ]);

    render(await PaginaAnalisiPianta({ params: creaParams("Pothos%20dorato") }));

    expect(screen.getByText("Ottima")).toBeInTheDocument();
  });

  it("mostra l'etichetta 'Buona' per analisi con statoSalute good", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findManyMock.mockResolvedValue([
      creaRecordAnalisi("analisi-1", creaAnalisiTest({ nomeComune: "Pothos dorato", statoSalute: "good" })),
    ]);

    render(await PaginaAnalisiPianta({ params: creaParams("Pothos%20dorato") }));

    expect(screen.getByText("Buona")).toBeInTheDocument();
  });

  it("mostra l'etichetta 'Discreta' per analisi con statoSalute fair", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findManyMock.mockResolvedValue([
      creaRecordAnalisi("analisi-1", creaAnalisiTest({ nomeComune: "Pothos dorato", statoSalute: "fair" })),
    ]);

    render(await PaginaAnalisiPianta({ params: creaParams("Pothos%20dorato") }));

    expect(screen.getByText("Discreta")).toBeInTheDocument();
  });

  it("mostra l'etichetta 'Critica' per analisi con statoSalute poor", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findManyMock.mockResolvedValue([
      creaRecordAnalisi("analisi-1", creaAnalisiTest({ nomeComune: "Pothos dorato", statoSalute: "poor" })),
    ]);

    render(await PaginaAnalisiPianta({ params: creaParams("Pothos%20dorato") }));

    expect(screen.getByText("Critica")).toBeInTheDocument();
  });

  it("mostra tutte le etichette di salute quando ci sono più analisi con stati diversi", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findManyMock.mockResolvedValue([
      creaRecordAnalisi("analisi-1", creaAnalisiTest({ nomeComune: "Pothos dorato", statoSalute: "excellent" }), new Date("2024-08-01")),
      creaRecordAnalisi("analisi-2", creaAnalisiTest({ nomeComune: "Pothos dorato", statoSalute: "good" }), new Date("2024-07-01")),
      creaRecordAnalisi("analisi-3", creaAnalisiTest({ nomeComune: "Pothos dorato", statoSalute: "fair" }), new Date("2024-06-01")),
      creaRecordAnalisi("analisi-4", creaAnalisiTest({ nomeComune: "Pothos dorato", statoSalute: "poor" }), new Date("2024-05-01")),
    ]);

    render(await PaginaAnalisiPianta({ params: creaParams("Pothos%20dorato") }));

    expect(screen.getByText("Ottima")).toBeInTheDocument();
    expect(screen.getByText("Buona")).toBeInTheDocument();
    expect(screen.getByText("Discreta")).toBeInTheDocument();
    expect(screen.getByText("Critica")).toBeInTheDocument();
  });

  // ── 3. Ordine delle analisi (più recente prima) ──────────────────────────

  it("mostra le analisi in ordine dalla più recente: la prima card ha la data più recente", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });

    // prisma restituisce già ordinato per desc, il componente non riordina
    findManyMock.mockResolvedValue([
      creaRecordAnalisi("analisi-recente", creaAnalisiTest({ nomeComune: "Pothos dorato" }), new Date("2024-09-10")),
      creaRecordAnalisi("analisi-vecchia", creaAnalisiTest({ nomeComune: "Pothos dorato" }), new Date("2024-03-05")),
    ]);

    render(await PaginaAnalisiPianta({ params: creaParams("Pothos%20dorato") }));

    const elementiData = screen.getAllByRole("time");
    expect(elementiData).toHaveLength(2);

    // La prima card corrisponde alla data più recente
    expect(elementiData[0]).toHaveAttribute("dateTime", new Date("2024-09-10").toISOString());
    expect(elementiData[1]).toHaveAttribute("dateTime", new Date("2024-03-05").toISOString());
  });

  // ── 4. Link a /analysis?id={id} per ogni analisi ────────────────────────

  it("ogni analisi è un link verso /analysis?id={id}", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    findManyMock.mockResolvedValue([
      creaRecordAnalisi("analisi-abc", creaAnalisiTest({ nomeComune: "Pothos dorato" }), new Date("2024-06-15")),
      creaRecordAnalisi("analisi-xyz", creaAnalisiTest({ nomeComune: "Pothos dorato" }), new Date("2024-05-10")),
    ]);

    render(await PaginaAnalisiPianta({ params: creaParams("Pothos%20dorato") }));

    const linkAnalisiAbc = screen.getByRole("link", { name: /15 giugno 2024/i });
    expect(linkAnalisiAbc).toHaveAttribute("href", "/analysis?id=analisi-abc");

    const linkAnalisiXyz = screen.getByRole("link", { name: /10 maggio 2024/i });
    expect(linkAnalisiXyz).toHaveAttribute("href", "/analysis?id=analisi-xyz");
  });

  // ── 5. Stato vuoto ───────────────────────────────────────────────────────

  it("mostra il messaggio di stato vuoto quando non ci sono analisi per la pianta", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    // Nessuna analisi nel database
    findManyMock.mockResolvedValue([]);

    render(await PaginaAnalisiPianta({ params: creaParams("Pothos%20dorato") }));

    expect(screen.getByText("Nessuna analisi trovata per questa pianta")).toBeInTheDocument();
    expect(screen.getByText(/Non sono state trovate analisi salvate per/)).toBeInTheDocument();
  });

  it("mostra il messaggio di stato vuoto quando le analisi nel DB non corrispondono al nome della pianta", async () => {
    ottieniSessioneServerMock.mockResolvedValue({ utenteId: "utente-123" });
    // Le analisi appartengono ad una pianta diversa
    findManyMock.mockResolvedValue([
      creaRecordAnalisi("analisi-1", creaAnalisiTest({ nomeComune: "Ficus elastica" })),
    ]);

    render(await PaginaAnalisiPianta({ params: creaParams("Pothos%20dorato") }));

    expect(screen.getByText("Nessuna analisi trovata per questa pianta")).toBeInTheDocument();
  });
});
