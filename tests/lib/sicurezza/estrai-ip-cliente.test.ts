import { describe, it, expect } from "vitest";
import type { NextRequest } from "next/server";
import { estraiIpCliente } from "@/lib/sicurezza/estrai-ip-cliente";

function creaRequestConHeader(headers: Record<string, string>): NextRequest {
  return {
    headers: {
      get: (nome: string) => headers[nome] ?? null,
    },
  } as unknown as NextRequest;
}

describe("estraiIpCliente", () => {
  it("restituisce l'IP dal header x-forwarded-for quando è presente con un singolo IP", () => {
    const request = creaRequestConHeader({ "x-forwarded-for": "203.0.113.5" });

    expect(estraiIpCliente(request)).toBe("203.0.113.5");
  });

  it("restituisce il primo IP dalla catena quando x-forwarded-for contiene più IP", () => {
    const request = creaRequestConHeader({
      "x-forwarded-for": "203.0.113.5, 10.0.0.1, 172.16.0.2",
    });

    expect(estraiIpCliente(request)).toBe("203.0.113.5");
  });

  it("restituisce 127.0.0.1 come fallback quando il header x-forwarded-for è assente", () => {
    const request = creaRequestConHeader({});

    expect(estraiIpCliente(request)).toBe("127.0.0.1");
  });
});
