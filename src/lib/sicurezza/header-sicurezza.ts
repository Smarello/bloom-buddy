/**
 * Definisce gli header HTTP di sicurezza applicati a tutte le risposte dell'applicazione.
 *
 * Gli header vengono configurati tramite la funzione `headers()` in `next.config.ts`
 * e vengono esportati come funzione pura per poterli testare in isolamento.
 */

interface HeaderHttp {
  key: string;
  value: string;
}

/**
 * Restituisce l'array di header HTTP di sicurezza da applicare a tutte le route.
 *
 * Origini consentite nella CSP:
 * - `fonts.googleapis.com` e `fonts.gstatic.com`: Google Fonts (Quicksand, Nunito) caricati in layout.tsx
 * - `'self'`: risorse servite dallo stesso dominio (script, stili, immagini)
 * - `'unsafe-inline'`: necessario per gli stili inline iniettati da Next.js e Tailwind CSS 4
 * - `data:`: necessario per le anteprime immagine codificate come data URI nel client
 *
 * Le chiamate API a Google Gemini avvengono esclusivamente server-side e non
 * richiedono direttive `connect-src` nel browser.
 */
export function ottieniHeaderSicurezza(): HeaderHttp[] {
  return [
    {
      key: "Content-Security-Policy",
      value: [
        // Sorgenti script: solo il proprio dominio e script inline di Next.js
        "default-src 'self'",
        // Stili: proprio dominio, Google Fonts e inline (richiesto da Tailwind/Next.js)
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        // Font: proprio dominio e Google Fonts CDN
        "font-src 'self' https://fonts.gstatic.com",
        // Script: proprio dominio e inline (richiesto da Next.js per hydration)
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        // Immagini: proprio dominio e data URI (anteprime immagine client-side)
        "img-src 'self' data: blob:",
        // Connessioni di rete: solo il proprio dominio
        "connect-src 'self'",
        // Frame: disabilitati (vedi anche X-Frame-Options)
        "frame-ancestors 'none'",
        // Form action: solo il proprio dominio
        "form-action 'self'",
        // Web Worker: stesso dominio e blob URL (usati da alcune librerie per worker inline)
        "worker-src 'self' blob:",
        // Risorse base: solo il proprio dominio
        "base-uri 'self'",
      ].join("; "),
    },
    {
      // Previene il clickjacking impedendo all'app di essere incorporata in iframe
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      // Previene il MIME sniffing: il browser rispetta il Content-Type dichiarato
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      // Limita le informazioni sull'origine inviate nelle richieste cross-origin
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      // Disabilita le funzionalità browser non necessarie per l'app
      key: "Permissions-Policy",
      value: [
        "camera=()",         // Nessun accesso alla fotocamera (l'upload avviene tramite file input)
        "microphone=()",     // Nessun accesso al microfono
        "geolocation=()",    // Nessun accesso alla geolocalizzazione
        "payment=()",        // Nessun accesso alle API di pagamento
      ].join(", "),
    },
  ];
}
