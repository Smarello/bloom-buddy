/**
 * Test suite per POST /api/auth/logout
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Factory dei mock
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessione: vi.fn(),
  ottieniSessioneServer: vi.fn(),
  OPZIONI_SESSIONE: {},
}));

// ---------------------------------------------------------------------------
// Import dell'handler e dei moduli mockati (DOPO i vi.mock)
// ---------------------------------------------------------------------------

import { POST } from "@/app/api/auth/logout/route";
import { ottieniSessione } from "@/lib/auth/sessione";

const mockOttieniSessione = vi.mocked(ottieniSessione);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function creaSessioneFinta() {
  return {
    destroy: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("POST /api/auth/logout", () => {
  let sessioneFinta: ReturnType<typeof creaSessioneFinta>;

  beforeEach(() => {
    vi.clearAllMocks();
    sessioneFinta = creaSessioneFinta();
    mockOttieniSessione.mockResolvedValue(sessioneFinta as never);
  });

  it("distrugge la sessione e reindirizza a / con status 302", async () => {
    const richiesta = new NextRequest("http://localhost/api/auth/logout", {
      method: "POST",
    });

    const risposta = await POST(richiesta);

    expect(sessioneFinta.destroy).toHaveBeenCalledOnce();
    expect(risposta.status).toBe(302);

    const destinazione = new URL(risposta.headers.get("location")!);
    expect(destinazione.pathname).toBe("/");
  });
});
