import { GoogleGenerativeAI } from "@google/generative-ai";

export const NOME_MODELLO =
  process.env.GOOGLE_GEMINI_MODEL_NAME ?? "gemini-2.5-flash";

let _clienteGemini: GoogleGenerativeAI | null = null;

/**
 * Restituisce il client Gemini, creandolo al primo utilizzo (lazy initialization).
 * La validazione della chiave avviene a runtime durante la prima chiamata API,
 * non al momento del build — questo evita crash di Vercel se la variabile
 * d'ambiente non è configurata nell'ambiente di build.
 */
export function ottieniClienteGemini(): GoogleGenerativeAI {
  if (_clienteGemini) return _clienteGemini;

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GOOGLE_GEMINI_API_KEY non configurata. Aggiungi la chiave in .env.local.",
    );
  }

  _clienteGemini = new GoogleGenerativeAI(apiKey);
  return _clienteGemini;
}
