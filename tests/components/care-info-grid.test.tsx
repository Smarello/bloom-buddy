import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { CareInfoGrid } from "@/components/care-info-grid";
import type { CareInfo, GuidaAnnaffiaturaAccessibile } from "@/types/analysis";

const INFORMAZIONI_BASE: CareInfo = {
  annaffiatura: "Ogni 7-10 giorni, lasciando asciugare il terreno tra una annaffiatura e l'altra.",
  luce: "Luce indiretta brillante, evitare il sole diretto.",
  temperatura: "Temperatura ideale tra 15 e 30 gradi centigradi.",
  umidita: "Umidità media, tra il 40 e il 60 percento.",
};

const GUIDA_ANNAFFIATURA: GuidaAnnaffiaturaAccessibile = {
  metodoVerifica: "Infila il dito nel terreno fino alla seconda nocca: se è asciutto, è il momento di annaffiare.",
  frequenzaGiorni: "7",
};

describe("CareInfoGrid", () => {
  afterEach(() => cleanup());

  describe("con guidaAnnaffiaturaAccessibile valorizzata", () => {
    it("mostra il metodo di verifica in evidenza nella card annaffiatura", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(
        screen.getByText(GUIDA_ANNAFFIATURA.metodoVerifica)
      ).toBeInTheDocument();
    });

    it("mostra la frequenza in giorni in evidenza nella card annaffiatura", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(
        screen.getByText(`Controlla ogni ${GUIDA_ANNAFFIATURA.frequenzaGiorni} giorni`)
      ).toBeInTheDocument();
    });

    it("mostra sia il metodo di verifica che la frequenza insieme", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(screen.getByText(GUIDA_ANNAFFIATURA.metodoVerifica)).toBeInTheDocument();
      expect(screen.getByText(`Controlla ogni ${GUIDA_ANNAFFIATURA.frequenzaGiorni} giorni`)).toBeInTheDocument();
    });

    it("mostra anche il testo plain dell'annaffiatura accanto alla guida", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(screen.getByText(INFORMAZIONI_BASE.annaffiatura)).toBeInTheDocument();
    });

    it("il blocco 'Controlla così:' appare esattamente una volta — non nelle card di luce, temperatura e umidità", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(screen.getAllByText(/Controlla così:/).length).toBe(1);
    });
  });

  describe("senza guidaAnnaffiaturaAccessibile", () => {
    it("mostra il testo plain dell'annaffiatura senza errori", () => {
      render(<CareInfoGrid informazioni={INFORMAZIONI_BASE} />);

      expect(screen.getByText(INFORMAZIONI_BASE.annaffiatura)).toBeInTheDocument();
    });

    it("non mostra il blocco di verifica del terreno", () => {
      render(<CareInfoGrid informazioni={INFORMAZIONI_BASE} />);

      expect(screen.queryByText(/Controlla così:/)).not.toBeInTheDocument();
    });

    it("non mostra il blocco con la frequenza in giorni", () => {
      render(<CareInfoGrid informazioni={INFORMAZIONI_BASE} />);

      expect(screen.queryByText(/Controlla ogni/)).not.toBeInTheDocument();
    });

    it("renderizza tutte e quattro le card di cura senza crash", () => {
      render(<CareInfoGrid informazioni={INFORMAZIONI_BASE} />);

      expect(screen.getByText("Annaffiatura")).toBeInTheDocument();
      expect(screen.getByText("Luce")).toBeInTheDocument();
      expect(screen.getByText("Temperatura")).toBeInTheDocument();
      expect(screen.getByText("Umidità")).toBeInTheDocument();
    });
  });

  describe("tono accessibile — assenza di termini tecnici nel testo mostrato", () => {
    it("non mostra la parola 'substrato' nel contenuto renderizzato", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(screen.queryByText(/substrato/i)).not.toBeInTheDocument();
    });

    it("non mostra la parola 'irrigazione' nel contenuto renderizzato", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(screen.queryByText(/irrigazione/i)).not.toBeInTheDocument();
    });

    it("non mostra la parola 'idratazione' nel contenuto renderizzato", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(screen.queryByText(/idratazione/i)).not.toBeInTheDocument();
    });

    it("il metodo di verifica usa linguaggio diretto alla seconda persona", () => {
      const guidaConLinguaggioAccessibile: GuidaAnnaffiaturaAccessibile = {
        metodoVerifica: "Premi il terreno con un dito: se è umido aspetta ancora.",
        frequenzaGiorni: "5",
      };

      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={guidaConLinguaggioAccessibile}
        />
      );

      expect(screen.getByText(guidaConLinguaggioAccessibile.metodoVerifica)).toBeInTheDocument();
      expect(screen.queryByText(/substrato/i)).not.toBeInTheDocument();
    });
  });
});
