import { describe, it, expect } from "vitest";
import { ottieniHeaderSicurezza } from "@/lib/sicurezza/header-sicurezza";

describe("ottieniHeaderSicurezza", () => {
  it("restituisce un array non vuoto di header", () => {
    const headers = ottieniHeaderSicurezza();
    expect(headers).toBeInstanceOf(Array);
    expect(headers.length).toBeGreaterThan(0);
  });

  describe("Content-Security-Policy", () => {
    it("include l'header Content-Security-Policy", () => {
      const headers = ottieniHeaderSicurezza();
      const headerCsp = headers.find((h) => h.key === "Content-Security-Policy");
      expect(headerCsp).toBeDefined();
    });

    it("la CSP consente i font da fonts.googleapis.com", () => {
      const headers = ottieniHeaderSicurezza();
      const headerCsp = headers.find((h) => h.key === "Content-Security-Policy");
      expect(headerCsp?.value).toContain("fonts.googleapis.com");
    });

    it("la CSP consente i font da fonts.gstatic.com", () => {
      const headers = ottieniHeaderSicurezza();
      const headerCsp = headers.find((h) => h.key === "Content-Security-Policy");
      expect(headerCsp?.value).toContain("fonts.gstatic.com");
    });

    it("la CSP include la direttiva default-src 'self'", () => {
      const headers = ottieniHeaderSicurezza();
      const headerCsp = headers.find((h) => h.key === "Content-Security-Policy");
      expect(headerCsp?.value).toContain("default-src 'self'");
    });

    it("la CSP impedisce il caricamento in frame tramite frame-ancestors 'none'", () => {
      const headers = ottieniHeaderSicurezza();
      const headerCsp = headers.find((h) => h.key === "Content-Security-Policy");
      expect(headerCsp?.value).toContain("frame-ancestors 'none'");
    });

    it("la CSP consente data URI per le anteprime immagine", () => {
      const headers = ottieniHeaderSicurezza();
      const headerCsp = headers.find((h) => h.key === "Content-Security-Policy");
      expect(headerCsp?.value).toContain("data:");
    });
  });

  describe("X-Frame-Options", () => {
    it("include l'header X-Frame-Options con valore DENY", () => {
      const headers = ottieniHeaderSicurezza();
      const headerFrameOptions = headers.find((h) => h.key === "X-Frame-Options");
      expect(headerFrameOptions).toBeDefined();
      expect(headerFrameOptions?.value).toBe("DENY");
    });
  });

  describe("X-Content-Type-Options", () => {
    it("include l'header X-Content-Type-Options con valore nosniff", () => {
      const headers = ottieniHeaderSicurezza();
      const headerContentTypeOptions = headers.find(
        (h) => h.key === "X-Content-Type-Options",
      );
      expect(headerContentTypeOptions).toBeDefined();
      expect(headerContentTypeOptions?.value).toBe("nosniff");
    });
  });

  describe("Referrer-Policy", () => {
    it("include l'header Referrer-Policy", () => {
      const headers = ottieniHeaderSicurezza();
      const headerReferrerPolicy = headers.find((h) => h.key === "Referrer-Policy");
      expect(headerReferrerPolicy).toBeDefined();
      expect(headerReferrerPolicy?.value).toBeTruthy();
    });
  });

  describe("Permissions-Policy", () => {
    it("include l'header Permissions-Policy", () => {
      const headers = ottieniHeaderSicurezza();
      const headerPermissionsPolicy = headers.find(
        (h) => h.key === "Permissions-Policy",
      );
      expect(headerPermissionsPolicy).toBeDefined();
    });

    it("la Permissions-Policy consente l'accesso alla fotocamera dal proprio dominio", () => {
      const headers = ottieniHeaderSicurezza();
      const headerPermissionsPolicy = headers.find(
        (h) => h.key === "Permissions-Policy",
      );
      expect(headerPermissionsPolicy?.value).toContain("camera=(self)");
    });

    it("la Permissions-Policy disabilita l'accesso al microfono", () => {
      const headers = ottieniHeaderSicurezza();
      const headerPermissionsPolicy = headers.find(
        (h) => h.key === "Permissions-Policy",
      );
      expect(headerPermissionsPolicy?.value).toContain("microphone=()");
    });

    it("la Permissions-Policy disabilita la geolocalizzazione", () => {
      const headers = ottieniHeaderSicurezza();
      const headerPermissionsPolicy = headers.find(
        (h) => h.key === "Permissions-Policy",
      );
      expect(headerPermissionsPolicy?.value).toContain("geolocation=()");
    });
  });

  describe("copertura header", () => {
    it("restituisce esattamente 5 header di sicurezza", () => {
      const headers = ottieniHeaderSicurezza();
      expect(headers).toHaveLength(5);
    });

    it("ogni header ha una chiave e un valore non vuoti", () => {
      const headers = ottieniHeaderSicurezza();
      for (const header of headers) {
        expect(header.key).toBeTruthy();
        expect(header.value).toBeTruthy();
      }
    });
  });
});
