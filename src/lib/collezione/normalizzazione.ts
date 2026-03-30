/**
 * Normalizza un nome (comune o scientifico) per confronti case-insensitive.
 */
export function normalizzaNome(nome: string): string {
  return nome.toLowerCase().trim();
}
