import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { CareInfoGrid } from "@/components/care-info-grid";
import type { CareInfo, GuidaAnnaffiaturaAccessibile, GuidaLuceAccessibile, GuidaUmiditaAccessibile, GuidaTemperaturaAccessibile } from "@/types/analysis";

const INFORMAZIONI_BASE: CareInfo = {
  annaffiatura: "Ogni 7-10 giorni, lasciando asciugare il terreno tra una annaffiatura e l'altra.",
  luce: "Luce indiretta brillante, evitare il sole diretto.",
  temperatura: "Temperatura ideale tra 15 e 30 gradi centigradi.",
  umidita: "Umidità media, tra il 40 e il 60 percento.",
};

const GUIDA_ANNAFFIATURA: GuidaAnnaffiaturaAccessibile = {
  metodoVerifica: "Infila il dito nel terreno fino alla seconda nocca: se è asciutto, è il momento di annaffiare.",
  frequenzaGiorni: "7",
  segnaliTroppaAcqua: "foglie gialle e molli, terreno sempre bagnato",
  segnaliPocaAcqua: "foglie che si accartocciano, terreno molto secco e duro",
};

const GUIDA_LUCE: GuidaLuceAccessibile = {
  oreEsposizioneGiornaliere: "6-8 ore",
  orientamentoFinestra: "finestra a est o sud",
  segniLuceTroppa: "foglie con macchie brune o bordi secchi",
  segniLucePoca: "steli lunghi e sottili, foglie piccole e pallide",
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

    it("mostra i segnali di troppa acqua nella card annaffiatura", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(screen.getByText(GUIDA_ANNAFFIATURA.segnaliTroppaAcqua)).toBeInTheDocument();
    });

    it("mostra i segnali di poca acqua nella card annaffiatura", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(screen.getByText(GUIDA_ANNAFFIATURA.segnaliPocaAcqua)).toBeInTheDocument();
    });

    it("mostra tutti e quattro i blocchi della guida annaffiatura insieme", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaAnnaffiaturaAccessibile={GUIDA_ANNAFFIATURA}
        />
      );

      expect(screen.getByText(GUIDA_ANNAFFIATURA.metodoVerifica)).toBeInTheDocument();
      expect(screen.getByText(`Controlla ogni ${GUIDA_ANNAFFIATURA.frequenzaGiorni} giorni`)).toBeInTheDocument();
      expect(screen.getByText(GUIDA_ANNAFFIATURA.segnaliTroppaAcqua)).toBeInTheDocument();
      expect(screen.getByText(GUIDA_ANNAFFIATURA.segnaliPocaAcqua)).toBeInTheDocument();
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

  describe("con guidaLuceAccessibile valorizzata", () => {
    it("mostra le ore di esposizione giornaliere nella card luce", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaLuceAccessibile={GUIDA_LUCE}
        />
      );

      expect(screen.getByText(GUIDA_LUCE.oreEsposizioneGiornaliere)).toBeInTheDocument();
    });

    it("mostra l'orientamento della finestra nella card luce", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaLuceAccessibile={GUIDA_LUCE}
        />
      );

      expect(screen.getByText(GUIDA_LUCE.orientamentoFinestra)).toBeInTheDocument();
    });

    it("mostra i segni di troppa luce nella card luce", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaLuceAccessibile={GUIDA_LUCE}
        />
      );

      expect(screen.getByText(GUIDA_LUCE.segniLuceTroppa)).toBeInTheDocument();
    });

    it("mostra i segni di poca luce nella card luce", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaLuceAccessibile={GUIDA_LUCE}
        />
      );

      expect(screen.getByText(GUIDA_LUCE.segniLucePoca)).toBeInTheDocument();
    });

    it("mostra tutti e quattro i campi della guida luce insieme", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaLuceAccessibile={GUIDA_LUCE}
        />
      );

      expect(screen.getByText(GUIDA_LUCE.oreEsposizioneGiornaliere)).toBeInTheDocument();
      expect(screen.getByText(GUIDA_LUCE.orientamentoFinestra)).toBeInTheDocument();
      expect(screen.getByText(GUIDA_LUCE.segniLuceTroppa)).toBeInTheDocument();
      expect(screen.getByText(GUIDA_LUCE.segniLucePoca)).toBeInTheDocument();
    });

  });

  describe("senza guidaLuceAccessibile", () => {
    it("non mostra i blocchi della guida luce quando la prop è undefined", () => {
      render(<CareInfoGrid informazioni={INFORMAZIONI_BASE} />);

      expect(screen.queryByText(GUIDA_LUCE.oreEsposizioneGiornaliere)).not.toBeInTheDocument();
      expect(screen.queryByText(GUIDA_LUCE.orientamentoFinestra)).not.toBeInTheDocument();
      expect(screen.queryByText(GUIDA_LUCE.segniLuceTroppa)).not.toBeInTheDocument();
      expect(screen.queryByText(GUIDA_LUCE.segniLucePoca)).not.toBeInTheDocument();
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
        segnaliTroppaAcqua: "foglie gialle e molli",
        segnaliPocaAcqua: "foglie che avvizziscono",
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

    it("la guida luce usa etichette in linguaggio quotidiano e mostra i dati nel DOM", () => {
      const guidaLuceQuotidiana: GuidaLuceAccessibile = {
        oreEsposizioneGiornaliere: "4-6 ore al giorno",
        orientamentoFinestra: "finestra a sud o ovest",
        segniLuceTroppa: "foglie che ingialliscono e cadono",
        segniLucePoca: "pianta che si allunga verso la finestra",
      };

      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaLuceAccessibile={guidaLuceQuotidiana}
        />
      );

      expect(screen.getByText(/Esposizione:/)).toBeInTheDocument();
      expect(screen.getByText(/Finestra:/)).toBeInTheDocument();
      expect(screen.getByText(/Troppa luce:/)).toBeInTheDocument();
      expect(screen.getByText(/Poca luce:/)).toBeInTheDocument();

      expect(screen.getByText(guidaLuceQuotidiana.oreEsposizioneGiornaliere)).toBeInTheDocument();
      expect(screen.getByText(guidaLuceQuotidiana.orientamentoFinestra)).toBeInTheDocument();
      expect(screen.getByText(guidaLuceQuotidiana.segniLuceTroppa)).toBeInTheDocument();
      expect(screen.getByText(guidaLuceQuotidiana.segniLucePoca)).toBeInTheDocument();
    });

    it("la guida umidità usa etichette in linguaggio quotidiano e mostra i dati nel DOM", () => {
      const guidaUmiditaQuotidiana: GuidaUmiditaAccessibile = {
        segnaliAriaSecca: "Punte delle foglie che imbruniscono e si seccano",
        metodoPratico: "Spruzza le foglie con acqua tiepida ogni 2 giorni",
        livelloPratico: "Come l'aria di un bagno dopo la doccia",
      };

      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaUmiditaAccessibile={guidaUmiditaQuotidiana}
        />
      );

      expect(screen.getByText(/Segnali di allarme:/)).toBeInTheDocument();
      expect(screen.getByText(/Come aumentarla:/)).toBeInTheDocument();
      expect(screen.getByText(/Livello ideale:/)).toBeInTheDocument();

      expect(screen.getByText(guidaUmiditaQuotidiana.segnaliAriaSecca)).toBeInTheDocument();
      expect(screen.getByText(guidaUmiditaQuotidiana.metodoPratico)).toBeInTheDocument();
      expect(screen.getByText(guidaUmiditaQuotidiana.livelloPratico)).toBeInTheDocument();
    });
  });

  describe("con guidaUmiditaAccessibile valorizzata", () => {
    const GUIDA_UMIDITA: GuidaUmiditaAccessibile = {
      segnaliAriaSecca: "Punte delle foglie che diventano marroni e secche",
      metodoPratico: "Spruzza le foglie con acqua a temperatura ambiente ogni 2-3 giorni",
      livelloPratico: "Simile all'umidità di un bagno dopo la doccia",
    };

    it("mostra i segnali di aria secca in evidenza nella card umidità", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaUmiditaAccessibile={GUIDA_UMIDITA}
        />
      );

      expect(screen.getByText(GUIDA_UMIDITA.segnaliAriaSecca)).toBeInTheDocument();
    });

    it("mostra il metodo pratico in evidenza nella card umidità", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaUmiditaAccessibile={GUIDA_UMIDITA}
        />
      );

      expect(screen.getByText(GUIDA_UMIDITA.metodoPratico)).toBeInTheDocument();
    });

    it("mostra il livello pratico in evidenza nella card umidità", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaUmiditaAccessibile={GUIDA_UMIDITA}
        />
      );

      expect(screen.getByText(GUIDA_UMIDITA.livelloPratico)).toBeInTheDocument();
    });

    it("mostra tutti e tre i campi della guida umidità insieme", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaUmiditaAccessibile={GUIDA_UMIDITA}
        />
      );

      expect(screen.getByText(GUIDA_UMIDITA.segnaliAriaSecca)).toBeInTheDocument();
      expect(screen.getByText(GUIDA_UMIDITA.metodoPratico)).toBeInTheDocument();
      expect(screen.getByText(GUIDA_UMIDITA.livelloPratico)).toBeInTheDocument();
    });

  });

  describe("senza guidaUmiditaAccessibile", () => {
    const GUIDA_UMIDITA: GuidaUmiditaAccessibile = {
      segnaliAriaSecca: "Punte delle foglie che diventano marroni e secche",
      metodoPratico: "Spruzza le foglie con acqua a temperatura ambiente ogni 2-3 giorni",
      livelloPratico: "Simile all'umidità di un bagno dopo la doccia",
    };

    it("non mostra i blocchi della guida umidità quando la prop è undefined", () => {
      render(<CareInfoGrid informazioni={INFORMAZIONI_BASE} />);

      expect(screen.queryByText(GUIDA_UMIDITA.segnaliAriaSecca)).not.toBeInTheDocument();
      expect(screen.queryByText(GUIDA_UMIDITA.metodoPratico)).not.toBeInTheDocument();
      expect(screen.queryByText(GUIDA_UMIDITA.livelloPratico)).not.toBeInTheDocument();
    });
  });

  describe("con guidaTemperaturaAccessibile valorizzata", () => {
    const GUIDA_TEMPERATURA: GuidaTemperaturaAccessibile = {
      rangeConRiferimentoDomestico: "tra 18°C e 24°C — la temperatura normale di un appartamento",
      situazioniDaEvitare: ["non vicino a porte esterne in inverno", "non sopra un termosifone"],
      segniStressDaTemperatura: "foglie che cadono all'improvviso in inverno",
    };

    it("mostra il range con riferimento domestico nella card temperatura", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaTemperaturaAccessibile={GUIDA_TEMPERATURA}
        />
      );

      expect(screen.getByText(GUIDA_TEMPERATURA.rangeConRiferimentoDomestico)).toBeInTheDocument();
    });

    it("mostra tutte le situazioni da evitare nella card temperatura", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaTemperaturaAccessibile={GUIDA_TEMPERATURA}
        />
      );

      for (const situazione of GUIDA_TEMPERATURA.situazioniDaEvitare) {
        expect(screen.getByText(situazione)).toBeInTheDocument();
      }
    });

    it("mostra i segni di stress da temperatura nella card temperatura", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaTemperaturaAccessibile={GUIDA_TEMPERATURA}
        />
      );

      expect(screen.getByText(GUIDA_TEMPERATURA.segniStressDaTemperatura)).toBeInTheDocument();
    });

    it("il blocco guida temperatura appare solo nella card temperatura e non nelle altre card", () => {
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaTemperaturaAccessibile={GUIDA_TEMPERATURA}
        />
      );

      expect(screen.getByText(GUIDA_TEMPERATURA.rangeConRiferimentoDomestico)).toBeInTheDocument();
      expect(screen.queryByText("Tienila così:")).toBeInTheDocument();
    });

    it("non compaiono termini tecnici nella guida temperatura", () => {
      const guidaConTerminiGenerici: GuidaTemperaturaAccessibile = {
        rangeConRiferimentoDomestico: "tra 15°C e 25°C — una temperatura confortevole per la maggior parte delle piante da appartamento",
        situazioniDaEvitare: ["non vicino a porte esterne in inverno", "non sopra o vicino a un termosifone"],
        segniStressDaTemperatura: "foglie che cadono o ingialliscono improvvisamente, specialmente in inverno o in estate",
      };
      render(
        <CareInfoGrid
          informazioni={INFORMAZIONI_BASE}
          guidaTemperaturaAccessibile={guidaConTerminiGenerici}
        />
      );

      expect(screen.queryByText(/dormienza/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/fitotossicità/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/stress termico/i)).not.toBeInTheDocument();
    });
  });

  describe("senza guidaTemperaturaAccessibile", () => {
    const GUIDA_TEMPERATURA: GuidaTemperaturaAccessibile = {
      rangeConRiferimentoDomestico: "tra 18°C e 24°C — la temperatura normale di un appartamento",
      situazioniDaEvitare: ["non vicino a porte esterne in inverno", "non sopra un termosifone"],
      segniStressDaTemperatura: "foglie che cadono all'improvviso in inverno",
    };

    it("non mostra i blocchi della guida temperatura quando la prop è undefined", () => {
      render(<CareInfoGrid informazioni={INFORMAZIONI_BASE} />);

      expect(screen.queryByText(GUIDA_TEMPERATURA.rangeConRiferimentoDomestico)).not.toBeInTheDocument();
      expect(screen.queryByText(GUIDA_TEMPERATURA.segniStressDaTemperatura)).not.toBeInTheDocument();
    });
  });
});
