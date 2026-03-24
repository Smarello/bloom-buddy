import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PannelloErroreAnalisi } from "@/components/pannello-errore-analisi";
import { MESSAGGI_ERRORE_ANALISI, MESSAGGIO_ERRORE_GENERICO } from "@/lib/analisi/messaggi-errore";
import type { ErroreAnalisiHook } from "@/hooks/useAnalysis";

afterEach(() => {
  cleanup();
});

function renderPannello(
  tipo: ErroreAnalisiHook["tipo"],
  messaggio = "Messaggio di errore generico",
  onRiprova = vi.fn(),
) {
  return render(
    <PannelloErroreAnalisi
      errore={{ messaggio, tipo }}
      onRiprova={onRiprova}
    />,
  );
}

describe("PannelloErroreAnalisi", () => {
  describe("rendering per tipo di errore", () => {
    const tipiErrore: Array<ErroreAnalisiHook["tipo"]> = [
      "confidenza-bassa",
      "pianta-non-riconosciuta",
      "errore-api",
      "risposta-malformata",
      "rete",
    ];

    it.each(tipiErrore)(
      "mostra titolo e suggerimento corretti per tipo '%s'",
      (tipo) => {
        renderPannello(tipo);

        const configurazione = MESSAGGI_ERRORE_ANALISI[tipo as keyof typeof MESSAGGI_ERRORE_ANALISI];

        expect(screen.getByTestId("titolo-errore")).toHaveTextContent(configurazione.titolo);
        expect(screen.getByTestId("suggerimento-errore")).toHaveTextContent(configurazione.suggerimento);
      },
    );

    it.each(tipiErrore)(
      "il testo visibile per tipo '%s' non contiene dettagli tecnici",
      (tipo) => {
        renderPannello(tipo);

        const testIdNodi = ["titolo-errore", "messaggio-errore", "suggerimento-errore", "bottone-riprova"];
        const testoVisibile = testIdNodi
          .map((id) => screen.getByTestId(id).textContent ?? "")
          .join(" ");

        // Nessun codice HTTP, nome di API o dettaglio tecnico
        expect(testoVisibile).not.toMatch(/\b(500|422|400|HTTP|API|Gemini|fetch|network|quota|threshold)\b/i);
      },
    );

    it("mostra il messaggio di fallback per un tipo non mappato", () => {
      render(
        <PannelloErroreAnalisi
          errore={{ messaggio: "Errore sconosciuto", tipo: undefined }}
          onRiprova={vi.fn()}
        />,
      );

      expect(screen.getByTestId("titolo-errore")).toHaveTextContent(MESSAGGIO_ERRORE_GENERICO.titolo);
    });
  });

  describe("interazione", () => {
    it("chiama onRiprova al click del pulsante", async () => {
      const utente = userEvent.setup();
      const onRiprova = vi.fn();

      renderPannello("errore-api", "Servizio non disponibile", onRiprova);

      await utente.click(screen.getByTestId("bottone-riprova"));

      expect(onRiprova).toHaveBeenCalledTimes(1);
    });

    it("il testo del pulsante rispecchia il tipo di errore", () => {
      renderPannello("confidenza-bassa");

      expect(screen.getByTestId("bottone-riprova")).toHaveTextContent(
        MESSAGGI_ERRORE_ANALISI["confidenza-bassa"].testoBottone,
      );
    });

    it("il testo del pulsante per 'pianta-non-riconosciuta' invita a caricare altra foto", () => {
      renderPannello("pianta-non-riconosciuta");

      expect(screen.getByTestId("bottone-riprova")).toHaveTextContent(
        MESSAGGI_ERRORE_ANALISI["pianta-non-riconosciuta"].testoBottone,
      );
    });
  });

  describe("accessibilità", () => {
    it("ha role='alert' sul contenitore principale", () => {
      renderPannello("errore-api");

      expect(screen.getByTestId("pannello-errore-analisi")).toHaveAttribute("role", "alert");
    });

    it("ha aria-live='assertive' sul contenitore principale", () => {
      renderPannello("rete");

      expect(screen.getByTestId("pannello-errore-analisi")).toHaveAttribute("aria-live", "assertive");
    });
  });
});
