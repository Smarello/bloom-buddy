const LIMITE_RICHIESTE_PER_MINUTO = 10;
const DURATA_FINESTRA_MS = 60_000;

interface VoceRateLimit {
  contatore: number;
  scadenzaMs: number;
}

const storeRateLimit = new Map<string, VoceRateLimit>();

export interface RisultatoRateLimit {
  consentito: boolean;
  secondiRimanenti: number;
}

/**
 * Verifica se l'IP fornito ha superato il limite di richieste per minuto.
 * Aggiorna il contatore e rimuove lazy le voci scadute.
 */
export function verificaRateLimit(ip: string): RisultatoRateLimit {
  const adesso = Date.now();

  const voceEsistente = storeRateLimit.get(ip);

  if (!voceEsistente || adesso >= voceEsistente.scadenzaMs) {
    // Prima richiesta o finestra scaduta: inizia nuova finestra
    storeRateLimit.set(ip, {
      contatore: 1,
      scadenzaMs: adesso + DURATA_FINESTRA_MS,
    });
    return { consentito: true, secondiRimanenti: 0 };
  }

  if (voceEsistente.contatore >= LIMITE_RICHIESTE_PER_MINUTO) {
    const secondiRimanenti = Math.ceil((voceEsistente.scadenzaMs - adesso) / 1000);
    return { consentito: false, secondiRimanenti };
  }

  voceEsistente.contatore += 1;
  return { consentito: true, secondiRimanenti: 0 };
}

/**
 * Resetta lo store del rate limiter.
 * Da usare esclusivamente nei test per garantire l'isolamento tra test.
 */
export function resetRateLimiter(): void {
  storeRateLimit.clear();
}
