import { describe, it, expect } from "vitest";

import { filtraCollezioni } from "@/components/selettore-collezione";

interface CollezioneListItem {
  id: string;
  nome: string;
  nomeScientifico: string | null;
  numeroAnalisi: number;
  anteprimaUrl: string | null;
}

function creaCollezione(
  overrides: Partial<CollezioneListItem> & { nome: string }
): CollezioneListItem {
  return {
    id: crypto.randomUUID(),
    nomeScientifico: null,
    numeroAnalisi: 0,
    anteprimaUrl: null,
    ...overrides,
  };
}

const collezioniDiTest: CollezioneListItem[] = [
  creaCollezione({
    id: "1",
    nome: "Rose del giardino",
    nomeScientifico: "Rosa gallica",
    numeroAnalisi: 3,
  }),
  creaCollezione({
    id: "2",
    nome: "Basilico balcone",
    nomeScientifico: "Ocimum basilicum",
    numeroAnalisi: 1,
  }),
  creaCollezione({
    id: "3",
    nome: "Orchidee rare",
    nomeScientifico: null,
    numeroAnalisi: 5,
  }),
  creaCollezione({
    id: "4",
    nome: "Piante grasse",
    nomeScientifico: "Cactaceae",
    numeroAnalisi: 2,
  }),
];

describe("filtraCollezioni", () => {
  it("restituisce tutte le collezioni quando il termine di ricerca e' vuoto", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "");
    expect(risultato).toEqual(collezioniDiTest);
  });

  it("restituisce tutte le collezioni quando il termine contiene solo spazi", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "   ");
    expect(risultato).toEqual(collezioniDiTest);
  });

  it("trova collezioni per corrispondenza sul nome", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "rose");
    expect(risultato).toHaveLength(1);
    expect(risultato[0].nome).toBe("Rose del giardino");
  });

  it("trova collezioni per corrispondenza sul nome scientifico", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "ocimum");
    expect(risultato).toHaveLength(1);
    expect(risultato[0].nome).toBe("Basilico balcone");
  });

  it("ignora maiuscole e minuscole nel nome", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "ORCHIDEE");
    expect(risultato).toHaveLength(1);
    expect(risultato[0].nome).toBe("Orchidee rare");
  });

  it("ignora maiuscole e minuscole nel nome scientifico", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "ROSA GALLICA");
    expect(risultato).toHaveLength(1);
    expect(risultato[0].nomeScientifico).toBe("Rosa gallica");
  });

  it("trova risultati con corrispondenza parziale sul nome", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "bal");
    expect(risultato).toHaveLength(1);
    expect(risultato[0].nome).toBe("Basilico balcone");
  });

  it("trova risultati con corrispondenza parziale sul nome scientifico", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "basil");
    expect(risultato).toHaveLength(1);
    expect(risultato[0].nomeScientifico).toBe("Ocimum basilicum");
  });

  it("restituisce un array vuoto quando nessuna collezione corrisponde", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "tulipano");
    expect(risultato).toEqual([]);
  });

  it("gestisce collezioni senza nome scientifico senza errori", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "rare");
    expect(risultato).toHaveLength(1);
    expect(risultato[0].nome).toBe("Orchidee rare");
    expect(risultato[0].nomeScientifico).toBeNull();
  });

  it("restituisce piu' collezioni quando il termine corrisponde a diverse voci", () => {
    // "e" appare in "Rose del giardino", "Orchidee rare", "Piante grasse"
    const risultato = filtraCollezioni(collezioniDiTest, "e");
    expect(risultato.length).toBeGreaterThan(1);
  });

  it("ignora spazi iniziali e finali nel termine di ricerca", () => {
    const risultato = filtraCollezioni(collezioniDiTest, "  rose  ");
    expect(risultato).toHaveLength(1);
    expect(risultato[0].nome).toBe("Rose del giardino");
  });

  it("restituisce un array vuoto quando la lista di collezioni e' vuota", () => {
    const risultato = filtraCollezioni([], "qualcosa");
    expect(risultato).toEqual([]);
  });
});
