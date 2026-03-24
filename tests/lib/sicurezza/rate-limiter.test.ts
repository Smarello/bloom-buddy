import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { verificaRateLimit, resetRateLimiter } from "@/lib/sicurezza/rate-limiter";

describe("verificaRateLimit", () => {
  beforeEach(() => {
    resetRateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("consente la prima richiesta da un IP", () => {
    const risultato = verificaRateLimit("192.168.1.1");

    expect(risultato.consentito).toBe(true);
    expect(risultato.secondiRimanenti).toBe(0);
  });

  it("consente la decima richiesta dallo stesso IP (ultimo dentro il limite)", () => {
    const ip = "10.0.0.1";

    for (let i = 0; i < 9; i++) {
      verificaRateLimit(ip);
    }

    const decimaRichiesta = verificaRateLimit(ip);
    expect(decimaRichiesta.consentito).toBe(true);
    expect(decimaRichiesta.secondiRimanenti).toBe(0);
  });

  it("blocca l'undicesima richiesta dallo stesso IP con secondiRimanenti > 0", () => {
    const ip = "10.0.0.2";

    for (let i = 0; i < 10; i++) {
      verificaRateLimit(ip);
    }

    const undicesima = verificaRateLimit(ip);
    expect(undicesima.consentito).toBe(false);
    expect(undicesima.secondiRimanenti).toBeGreaterThan(0);
    expect(undicesima.secondiRimanenti).toBeLessThanOrEqual(60);
  });

  it("IP diversi hanno contatori indipendenti", () => {
    const ip1 = "172.16.0.1";
    const ip2 = "172.16.0.2";

    for (let i = 0; i < 10; i++) {
      verificaRateLimit(ip1);
    }

    // ip1 è al limite, ma ip2 deve essere ancora consentito
    expect(verificaRateLimit(ip1).consentito).toBe(false);
    expect(verificaRateLimit(ip2).consentito).toBe(true);
  });

  it("resetta il contatore automaticamente dopo la scadenza della finestra", () => {
    const ip = "10.0.0.3";

    for (let i = 0; i < 10; i++) {
      verificaRateLimit(ip);
    }
    expect(verificaRateLimit(ip).consentito).toBe(false);

    // Avanza il tempo di 61 secondi (finestra scaduta)
    vi.advanceTimersByTime(61_000);

    const dopoScadenza = verificaRateLimit(ip);
    expect(dopoScadenza.consentito).toBe(true);
    expect(dopoScadenza.secondiRimanenti).toBe(0);
  });

  it("resetRateLimiter azzera lo stato e consente nuove richieste", () => {
    const ip = "10.0.0.4";

    for (let i = 0; i < 10; i++) {
      verificaRateLimit(ip);
    }
    expect(verificaRateLimit(ip).consentito).toBe(false);

    resetRateLimiter();

    expect(verificaRateLimit(ip).consentito).toBe(true);
  });
});
