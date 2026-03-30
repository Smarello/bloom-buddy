import { test, expect, type Page } from "@playwright/test";

const NOME_COLLEZIONE = "Le mie tropicali";

interface DatiSeed {
  utenteId: string;
  collezioneId: string;
  nomeCollezione: string;
  analisiIds: string[];
}

/**
 * Chiama l'endpoint di seed per creare dati di test nel database
 * e autenticare l'utente nella sessione del browser.
 */
async function seminaDatiTest(
  page: Page,
  azione: "crea-collezione-con-analisi" | "crea-collezione-vuota"
): Promise<DatiSeed> {
  // Naviga prima a una pagina qualsiasi per poter fare fetch con i cookie del dominio
  const rispostaSeed = await page.request.post("/api/test-seed", {
    data: { azione },
  });

  expect(rispostaSeed.ok()).toBeTruthy();
  const dati = await rispostaSeed.json();

  // Salva i cookie della sessione dal response nel contesto del browser
  const intestazioniSetCookie = rispostaSeed.headers()["set-cookie"];
  if (intestazioniSetCookie) {
    // Parsa i cookie e impostali nel contesto del browser
    const cookies = intestazioniSetCookie.split(/,(?=\s*\w+=)/).map((c) => {
      const [coppiaNomeValore] = c.trim().split(";");
      const [nome, ...restoValore] = coppiaNomeValore.split("=");
      return {
        name: nome.trim(),
        value: restoValore.join("=").trim(),
        domain: "localhost",
        path: "/",
      };
    });
    await page.context().addCookies(cookies);
  }

  return dati;
}

/**
 * Pulisce i dati di test dal database.
 */
async function pulisciDatiTest(page: Page): Promise<void> {
  await page.request.post("/api/test-seed", {
    data: { azione: "pulizia" },
  });
}

/**
 * Intercetta le richieste di immagini fittizie usate nei dati di seed
 * per evitare errori next/image con host non raggiungibili.
 */
async function mockImmaginiTest(page: Page): Promise<void> {
  // Immagine 1x1 pixel PNG trasparente
  const PIXEL_PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  await page.route("**/*.public.blob.vercel-storage.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/png",
      body: PIXEL_PNG,
    })
  );
}

test.describe.configure({ mode: "serial" });

test.describe("US-041: Eliminazione analisi e collezione", () => {
  test.afterEach(async ({ page }) => {
    await pulisciDatiTest(page);
  });

  test("eliminazione singola analisi: conferma rimuove la card e aggiorna il contatore", async ({
    page,
  }) => {
    const dati = await seminaDatiTest(page, "crea-collezione-con-analisi");
    await mockImmaginiTest(page);

    // Naviga alla pagina della collezione
    await page.goto(`/collezione/${dati.collezioneId}`);

    // Attendi che le card analisi siano visibili
    const cardsAnalisi = page.getByLabel(/Apri analisi del/);
    await expect(cardsAnalisi.first()).toBeVisible({ timeout: 15000 });
    const conteggioIniziale = await cardsAnalisi.count();
    expect(conteggioIniziale).toBeGreaterThanOrEqual(2);

    // Verifica il contatore iniziale (usa exact per evitare ambiguita con altri testi simili)
    await expect(page.getByText(`${conteggioIniziale} analisi`, { exact: true })).toBeVisible();

    // Hover sulla prima card per far apparire il pulsante elimina
    await cardsAnalisi.first().hover();

    // Clicca il pulsante "Elimina analisi" sulla prima card
    const pulsanteEliminaAnalisi = page.getByLabel("Elimina analisi").first();
    await pulsanteEliminaAnalisi.click();

    // Verifica che il dialogo di conferma appaia
    const dialogo = page.locator("dialog[open]");
    await expect(dialogo).toBeVisible();
    await expect(
      dialogo.getByText("Eliminare questa analisi?")
    ).toBeVisible();

    // Conferma l'eliminazione
    await dialogo.getByRole("button", { name: "Elimina" }).click();

    // Verifica che il dialogo si chiuda dopo l'eliminazione
    await expect(dialogo).toBeHidden({ timeout: 5000 });

    // Verifica che la card eliminata sia sparita (attende il re-render del componente server)
    await expect(cardsAnalisi).toHaveCount(conteggioIniziale - 1, { timeout: 5000 });
  });

  test("annullamento eliminazione analisi: cliccando Annulla nulla cambia", async ({
    page,
  }) => {
    const dati = await seminaDatiTest(page, "crea-collezione-con-analisi");
    await mockImmaginiTest(page);

    await page.goto(`/collezione/${dati.collezioneId}`);

    // Attendi card
    const cardsAnalisi = page.getByLabel(/Apri analisi del/);
    await expect(cardsAnalisi.first()).toBeVisible({ timeout: 15000 });
    const conteggioIniziale = await cardsAnalisi.count();

    // Hover + click elimina sulla prima card
    await cardsAnalisi.first().hover();
    await page.getByLabel("Elimina analisi").first().click();

    // Verifica dialogo visibile
    const dialogo = page.locator("dialog[open]");
    await expect(dialogo).toBeVisible();

    // Clicca Annulla
    await dialogo.getByRole("button", { name: "Annulla" }).click();

    // Verifica che il dialogo si chiuda
    await expect(dialogo).toBeHidden();

    // Verifica che il conteggio card non sia cambiato
    await expect(cardsAnalisi).toHaveCount(conteggioIniziale);
  });

  test("eliminazione collezione con doppio passaggio: digitare il nome per confermare", async ({
    page,
  }) => {
    const dati = await seminaDatiTest(page, "crea-collezione-con-analisi");
    await mockImmaginiTest(page);

    await page.goto(`/collezione/${dati.collezioneId}`);

    // Attendi che la pagina sia caricata
    await expect(
      page.getByLabel("Elimina collezione")
    ).toBeVisible({ timeout: 15000 });

    // Clicca il pulsante "Elimina collezione"
    await page.getByLabel("Elimina collezione").click();

    // Verifica che il dialogo si apra con intestazione corretta
    const dialogo = page.locator("dialog[open]");
    await expect(dialogo).toBeVisible();
    await expect(
      dialogo.getByRole("heading", { name: "Elimina collezione" })
    ).toBeVisible();

    // Verifica che il pulsante "Elimina" sia disabilitato (serve digitare il nome)
    const pulsanteElimina = dialogo.getByRole("button", { name: "Elimina" });
    await expect(pulsanteElimina).toBeDisabled();

    // Digita il nome della collezione nell'input di conferma
    const inputConferma = dialogo.locator("#input-conferma-nome-collezione");
    await inputConferma.fill(NOME_COLLEZIONE);

    // Ora il pulsante Elimina deve essere abilitato
    await expect(pulsanteElimina).toBeEnabled();

    // Conferma l'eliminazione
    await pulsanteElimina.click();

    // Verifica redirect alla pagina lista collezioni
    await page.waitForURL("**/collezione", { timeout: 10000 });
    expect(page.url()).toMatch(/\/collezione\/?$/);
  });

  test("eliminazione collezione vuota: conferma senza digitare il nome", async ({
    page,
  }) => {
    const dati = await seminaDatiTest(page, "crea-collezione-vuota");
    await mockImmaginiTest(page);

    await page.goto(`/collezione/${dati.collezioneId}`);

    // Attendi che la pagina sia caricata
    await expect(
      page.getByLabel("Elimina collezione")
    ).toBeVisible({ timeout: 15000 });

    // Clicca il pulsante "Elimina collezione"
    await page.getByLabel("Elimina collezione").click();

    // Verifica che il dialogo si apra
    const dialogo = page.locator("dialog[open]");
    await expect(dialogo).toBeVisible();

    // Per collezione vuota, il messaggio deve indicare che e vuota
    await expect(
      dialogo.getByText("La collezione è vuota e verrà rimossa.")
    ).toBeVisible();

    // Il pulsante Elimina deve essere gia abilitato (non serve digitare il nome)
    const pulsanteElimina = dialogo.getByRole("button", { name: "Elimina" });
    await expect(pulsanteElimina).toBeEnabled();

    // Conferma l'eliminazione
    await pulsanteElimina.click();

    // Verifica redirect alla pagina lista collezioni
    await page.waitForURL("**/collezione", { timeout: 10000 });
    expect(page.url()).toMatch(/\/collezione\/?$/);
  });
});
