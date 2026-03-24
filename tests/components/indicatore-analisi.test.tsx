import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { IndicatoreAnalisi } from "@/components/indicatore-analisi";
import {
  MESSAGGI_CARICAMENTO_ANALISI,
  INTERVALLO_ROTAZIONE_MS,
} from "@/lib/analisi/messaggi-caricamento";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("IndicatoreAnalisi", () => {
  it("renderizza il primo messaggio al mount", () => {
    render(<IndicatoreAnalisi />);

    expect(
      screen.getByText(MESSAGGI_CARICAMENTO_ANALISI[0]),
    ).toBeInTheDocument();
  });

  it("mostra il secondo messaggio dopo un intervallo", () => {
    render(<IndicatoreAnalisi />);

    act(() => {
      vi.advanceTimersByTime(INTERVALLO_ROTAZIONE_MS);
    });

    expect(
      screen.getByText(MESSAGGI_CARICAMENTO_ANALISI[1]),
    ).toBeInTheDocument();
  });

  it("il messaggio torna al primo dopo aver percorso tutti i messaggi", () => {
    render(<IndicatoreAnalisi />);

    act(() => {
      vi.advanceTimersByTime(
        INTERVALLO_ROTAZIONE_MS * MESSAGGI_CARICAMENTO_ANALISI.length,
      );
    });

    expect(
      screen.getByText(MESSAGGI_CARICAMENTO_ANALISI[0]),
    ).toBeInTheDocument();
  });

  it("la regione aria-live='polite' è presente sul contenitore del messaggio", () => {
    render(<IndicatoreAnalisi />);

    const contenitore = document.querySelector("[aria-live='polite']");
    expect(contenitore).not.toBeNull();
    expect(contenitore).toHaveAttribute("aria-live", "polite");
    expect(contenitore).toHaveAttribute("aria-atomic", "true");
  });

  it("ha aria-busy='true' sul contenitore principale", () => {
    render(<IndicatoreAnalisi />);

    const indicatore = screen.getByTestId("indicatore-analisi");
    expect(indicatore).toHaveAttribute("aria-busy", "true");
  });

  it("pulisce il timer al dismount senza errori", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");

    const { unmount } = render(<IndicatoreAnalisi />);
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
