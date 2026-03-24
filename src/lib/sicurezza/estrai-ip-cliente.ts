import type { NextRequest } from "next/server";

const IP_FALLBACK = "127.0.0.1";

/**
 * Estrae l'indirizzo IP del client dalla request.
 * Su Vercel l'IP reale si trova nell'header `x-forwarded-for`.
 * Se il header contiene una catena di IP (proxy), restituisce il primo (IP originale del client).
 * Se il header è assente, restituisce il fallback "127.0.0.1" (ambiente locale).
 */
export function estraiIpCliente(request: NextRequest): string {
  const headerForwardedFor = request.headers.get("x-forwarded-for");

  if (!headerForwardedFor) {
    return IP_FALLBACK;
  }

  // La catena può essere "IP1, IP2, IP3" — il primo è l'IP originale del client
  const primoIp = headerForwardedFor.split(",")[0].trim();
  return primoIp || IP_FALLBACK;
}
