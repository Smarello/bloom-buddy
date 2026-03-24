/**
 * Messaggi incoraggianti mostrati durante l'analisi della pianta.
 * Ruotano a intervalli regolari per dare feedback visivo all'utente.
 */
export const MESSAGGI_CARICAMENTO_ANALISI = [
  "Sto osservando la tua pianta...",
  "Analizzo le foglie con attenzione...",
  "Identifico la specie...",
  "Valuto lo stato di salute...",
  "Preparo i consigli di cura personalizzati...",
  "Quasi pronto, ancora un momento...",
] as const;

/**
 * Intervallo in millisecondi tra un messaggio e il successivo.
 */
export const INTERVALLO_ROTAZIONE_MS = 2500;
