import { describe, it, expect, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";

import { CardDiagnosiDettagliata } from "@/components/card-diagnosi-dettagliata";
import type { DiagnosiDettagliata } from "@/types/analysis";

function creaDiagnosiCritica(overrides?: Partial<DiagnosiDettagliata>): DiagnosiDettagliata {
  return {
    categoria: "critico",
    titolo: "Marciume radicale avanzato",
    cosaVedo: "Radici scure e molli, odore sgradevole dal terreno.",
    cosaSignifica: "Le radici non riescono più ad assorbire acqua e nutrienti.",
    cosaFare: "Rimuovi le radici marce con forbici sterilizzate\nRinvasa in terriccio asciutto e ben drenante\nSospendi le annaffiature per 5 giorni",
    cosaAspettarsi: "La pianta dovrebbe mostrare segni di ripresa in 3-4 settimane",
    ...overrides,
  };
}

function creaDiagnosiAttenzione(overrides?: Partial<DiagnosiDettagliata>): DiagnosiDettagliata {
  return {
    categoria: "attenzione",
    titolo: "Foglie ingiallite alla base",
    cosaVedo: "Le foglie inferiori diventano gialle e cadono.",
    cosaSignifica: "Possibile eccesso di annaffiatura o carenza di azoto.",
    cosaFare: "Riduci la frequenza di annaffiatura",
    cosaAspettarsi: "Miglioramento visibile entro 2 settimane",
    ...overrides,
  };
}

describe("CardDiagnosiDettagliata", () => {
  afterEach(() => cleanup());

  describe("categoria critico", () => {
    it("renderizza con data-categoria critico e badge CRITICO", () => {
      render(<CardDiagnosiDettagliata diagnosi={creaDiagnosiCritica()} />);

      const card = screen.getByTestId("card-diagnosi-dettagliata");
      expect(card).toHaveAttribute("data-categoria", "critico");

      const badge = screen.getByTestId("badge-categoria");
      expect(badge).toHaveTextContent("CRITICO");
    });
  });

  describe("categoria attenzione", () => {
    it("renderizza con data-categoria attenzione e badge ATTENZIONE", () => {
      render(<CardDiagnosiDettagliata diagnosi={creaDiagnosiAttenzione()} />);

      const card = screen.getByTestId("card-diagnosi-dettagliata");
      expect(card).toHaveAttribute("data-categoria", "attenzione");

      const badge = screen.getByTestId("badge-categoria");
      expect(badge).toHaveTextContent("ATTENZIONE");
    });
  });

  describe("sezioni", () => {
    it("mostra le 4 sezioni con i titoli corretti", () => {
      render(<CardDiagnosiDettagliata diagnosi={creaDiagnosiCritica()} />);

      const titoliAttesi = ["Cosa vedo", "Cosa significa", "Cosa fare", "Cosa aspettarsi"];

      for (const titolo of titoliAttesi) {
        expect(screen.getByText(titolo)).toBeInTheDocument();
      }

      expect(screen.getByTestId("sezione-cosaVedo")).toBeInTheDocument();
      expect(screen.getByTestId("sezione-cosaSignifica")).toBeInTheDocument();
      expect(screen.getByTestId("sezione-cosaFare")).toBeInTheDocument();
      expect(screen.getByTestId("sezione-cosaAspettarsi")).toBeInTheDocument();
    });
  });

  describe("cosaFare con newline", () => {
    it("splitta il testo in una lista di azioni", () => {
      const diagnosi = creaDiagnosiCritica({
        cosaFare: "Prima azione\nSeconda azione\nTerza azione",
      });
      render(<CardDiagnosiDettagliata diagnosi={diagnosi} />);

      const listaAzioni = screen.getByTestId("lista-azioni");
      const vociLista = within(listaAzioni).getAllByRole("listitem");

      expect(vociLista).toHaveLength(3);
      expect(vociLista[0]).toHaveTextContent("Prima azione");
      expect(vociLista[1]).toHaveTextContent("Seconda azione");
      expect(vociLista[2]).toHaveTextContent("Terza azione");
    });

    it("ignora righe vuote nel testo cosaFare", () => {
      const diagnosi = creaDiagnosiCritica({
        cosaFare: "Prima azione\n\nSeconda azione\n  \nTerza azione",
      });
      render(<CardDiagnosiDettagliata diagnosi={diagnosi} />);

      const listaAzioni = screen.getByTestId("lista-azioni");
      const vociLista = within(listaAzioni).getAllByRole("listitem");

      expect(vociLista).toHaveLength(3);
    });
  });

  describe("indicatore temporale", () => {
    it("mostra l'indicatore quando cosaAspettarsi contiene un pattern temporale", () => {
      const diagnosi = creaDiagnosiCritica({
        cosaAspettarsi: "La pianta dovrebbe riprendersi in 3-4 settimane",
      });
      render(<CardDiagnosiDettagliata diagnosi={diagnosi} />);

      const indicatore = screen.getByTestId("indicatore-temporale");
      expect(indicatore).toBeInTheDocument();
      expect(indicatore).toHaveTextContent("3-4 settimane");
    });

    it("non mostra l'indicatore quando non c'è un pattern temporale", () => {
      const diagnosi = creaDiagnosiCritica({
        cosaAspettarsi: "Monitora la pianta nei prossimi periodi.",
      });
      render(<CardDiagnosiDettagliata diagnosi={diagnosi} />);

      expect(screen.queryByTestId("indicatore-temporale")).not.toBeInTheDocument();
    });

    it("riconosce il pattern temporale con giorni", () => {
      const diagnosi = creaDiagnosiCritica({
        cosaAspettarsi: "I primi miglioramenti saranno visibili in 5 giorni",
      });
      render(<CardDiagnosiDettagliata diagnosi={diagnosi} />);

      const indicatore = screen.getByTestId("indicatore-temporale");
      expect(indicatore).toHaveTextContent("5 giorni");
    });

    it("riconosce il pattern temporale con mesi", () => {
      const diagnosi = creaDiagnosiCritica({
        cosaAspettarsi: "Il recupero completo richiederà circa 2 mesi",
      });
      render(<CardDiagnosiDettagliata diagnosi={diagnosi} />);

      const indicatore = screen.getByTestId("indicatore-temporale");
      expect(indicatore).toHaveTextContent("2 mesi");
    });
  });

  describe("griglia 2x2", () => {
    it("il contenitore sezioni ha la classe grid-cols-2", () => {
      render(<CardDiagnosiDettagliata diagnosi={creaDiagnosiCritica()} />);

      const griglia = screen.getByTestId("griglia-sezioni");
      expect(griglia.className).toContain("grid-cols-2");
    });
  });
});
