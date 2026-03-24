/**
 * Messaggi user-friendly per ciascun tipo di errore dell'analisi.
 * Nessun messaggio deve contenere dettagli tecnici (codici errore, nomi di API, stack trace).
 */

export interface ConfigurazioneMessaggioErrore {
  titolo: string;
  messaggio: string;
  suggerimento: string;
  testoBottone: string;
}

export const MESSAGGI_ERRORE_ANALISI: Record<
  "confidenza-bassa" | "pianta-non-riconosciuta" | "errore-api" | "risposta-malformata" | "rete" | "quota-esaurita",
  ConfigurazioneMessaggioErrore
> = {
  "confidenza-bassa": {
    titolo: "Foto non abbastanza chiara",
    messaggio:
      "Non riesco a identificare la pianta con sufficiente certezza da questa foto.",
    suggerimento:
      "Prova con una foto più nitida: avvicinati alla pianta, usa buona luce naturale e scegli uno sfondo semplice.",
    testoBottone: "Scatta un'altra foto",
  },
  "pianta-non-riconosciuta": {
    titolo: "Nessuna pianta rilevata",
    messaggio:
      "L'immagine non sembra contenere una pianta o la pianta non è visibile chiaramente.",
    suggerimento:
      "Assicurati che la foto mostri una pianta intera o una sua parte (foglie, fiori, stelo). Evita foto di paesaggi o oggetti.",
    testoBottone: "Carica un'altra foto",
  },
  "errore-api": {
    titolo: "Servizio temporaneamente non disponibile",
    messaggio:
      "Il servizio di analisi non è raggiungibile al momento.",
    suggerimento:
      "Riprova tra qualche minuto. Se il problema persiste, potrebbe esserci un'interruzione temporanea del servizio.",
    testoBottone: "Riprova",
  },
  "risposta-malformata": {
    titolo: "Errore durante l'analisi",
    messaggio:
      "Non è stato possibile elaborare il risultato dell'analisi.",
    suggerimento:
      "Riprova con la stessa foto o con un'immagine diversa della tua pianta.",
    testoBottone: "Riprova",
  },
  "rete": {
    titolo: "Connessione non disponibile",
    messaggio:
      "Non riesco a raggiungere il servizio di analisi.",
    suggerimento:
      "Verifica la tua connessione internet e riprova.",
    testoBottone: "Riprova",
  },
  "quota-esaurita": {
    titolo: "Limite giornaliero raggiunto",
    messaggio:
      "Il servizio di analisi ha esaurito il numero di richieste disponibili per oggi.",
    suggerimento:
      "Il limite si rinnova ogni giorno. Riprova domani oppure contatta il supporto se il problema persiste.",
    testoBottone: "Capito",
  },
} as const;

/**
 * Messaggio di fallback per tipi di errore non mappati.
 */
export const MESSAGGIO_ERRORE_GENERICO: ConfigurazioneMessaggioErrore = {
  titolo: "Qualcosa è andato storto",
  messaggio: "Si è verificato un errore imprevisto.",
  suggerimento: "Riprova tra qualche momento.",
  testoBottone: "Riprova",
};
