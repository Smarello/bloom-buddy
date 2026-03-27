/**
 * Test suite per la protezione della pagina /profilo
 *
 * Verifica che un utente non autenticato venga reindirizzato a /accesso
 * e che un utente autenticato possa accedere normalmente.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Factory dei mock — nessun riferimento a variabili esterne
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth/sessione", () => ({
  ottieniSessioneServer: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/components/form-cambio-password", () => ({
  default: () => null,
}));

// ---------------------------------------------------------------------------
// Import della pagina e dei moduli mockati (DOPO i vi.mock)
// ---------------------------------------------------------------------------

import PaginaProfilo from "@/app/profilo/page";
import { ottieniSessioneServer } from "@/lib/auth/sessione";
import { redirect } from "next/navigation";

const mockOttieniSessioneServer = vi.mocked(ottieniSessioneServer);
const mockRedirect = vi.mocked(redirect);

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("Pagina /profilo — protezione accesso", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  describe("utente non autenticato", () => {
    it("deve chiamare redirect verso /accesso", async () => {
      mockOttieniSessioneServer.mockResolvedValue({
        utenteId: undefined,
        email: undefined,
      } as never);

      await PaginaProfilo();

      expect(mockRedirect).toHaveBeenCalledWith("/accesso");
    });
  });

  // -------------------------------------------------------------------------
  describe("utente autenticato", () => {
    it("non deve chiamare redirect", async () => {
      mockOttieniSessioneServer.mockResolvedValue({
        utenteId: "id-utente-abc123",
        email: "utente@esempio.it",
      } as never);

      await PaginaProfilo();

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
