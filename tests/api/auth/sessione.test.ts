import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessione: vi.fn(),
}));

import { ottieniSessione } from "@/lib/auth/sessione";
import { GET } from "@/app/api/auth/sessione/route";

const ottieniSessioneMock = vi.mocked(ottieniSessione);

describe("GET /api/auth/sessione", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ritorna autenticato: true con email quando la sessione ha utenteId", async () => {
    ottieniSessioneMock.mockResolvedValue({
      utenteId: "utente-123",
      email: "mario@example.com",
    } as any);

    const richiesta = new NextRequest("http://localhost/api/auth/sessione");
    const risposta = await GET(richiesta);
    const corpo = await risposta.json();

    expect(corpo).toEqual({ autenticato: true, email: "mario@example.com" });
  });

  it("ritorna autenticato: false quando la sessione non ha utenteId", async () => {
    ottieniSessioneMock.mockResolvedValue({} as any);

    const richiesta = new NextRequest("http://localhost/api/auth/sessione");
    const risposta = await GET(richiesta);
    const corpo = await risposta.json();

    expect(corpo).toEqual({ autenticato: false });
  });
});
