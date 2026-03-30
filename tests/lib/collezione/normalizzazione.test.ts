import { describe, it, expect } from "vitest";
import { normalizzaNome } from "@/lib/collezione/normalizzazione";

describe("normalizzaNome", () => {
  it("converte in minuscolo i nomi con maiuscole", () => {
    expect(normalizzaNome("Epipremnum Aureum")).toBe("epipremnum aureum");
  });

  it("rimuove gli spazi iniziali e finali", () => {
    expect(normalizzaNome("  pothos  ")).toBe("pothos");
  });

  it("gestisce una stringa vuota", () => {
    expect(normalizzaNome("")).toBe("");
  });

  it("applica sia lowercase che trim insieme", () => {
    expect(normalizzaNome("  Monstera Deliciosa  ")).toBe("monstera deliciosa");
  });
});
