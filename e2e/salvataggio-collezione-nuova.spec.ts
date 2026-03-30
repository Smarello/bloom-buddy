import { test, expect, type Page } from "@playwright/test";

/**
 * Dati di analisi fittizi da iniettare in sessionStorage per simulare
 * il completamento di un'analisi pianta. Rispecchiano il tipo PlantAnalysis.
 */
const DATI_ANALISI_FITTIZI = {
  analisi: {
    nomeComune: "Pothos dorato",
    nomeScientifico: "Epipremnum aureum",
    livelloConfidenza: 0.92,
    statoSalute: "good" as const,
    descrizioneSalute: "La pianta è in buone condizioni generali.",
    consigliCura: [
      {
        titolo: "Annaffia regolarmente",
        descrizione: "Ogni 7-10 giorni, lasciando asciugare il terriccio tra un'annaffiatura e l'altra.",
        priorita: "media",
      },
    ],
    descrizione: "Pianta tropicale rampicante molto resistente e adattabile.",
    informazioniGenerali: {
      annaffiatura: "Ogni 7-10 giorni",
      luce: "Luce indiretta brillante",
      temperatura: "15-30 °C",
      umidita: "Media (40-60%)",
    },
    informazioniRapide: {
      annaffiatura: "Moderata",
      luce: "Indiretta",
      temperatura: "18-25 °C",
      umidita: "Media",
    },
  },
  // Immagine 1x1 pixel JPEG in base64 (valida per la conversione in File)
  urlAnteprima:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AKwA//9k=",
};

const ID_COLLEZIONE_CREATA = "col-test-abc123";
const CHIAVE_SESSION_STORAGE = "bloombuddy-analisi-corrente";

/**
 * Prepara la pagina iniettando i dati analisi in sessionStorage
 * e mockando le API necessarie per il flusso di salvataggio.
 */
async function preparaPaginaAnalisi(
  page: Page,
  opzioni: {
    nomeCollezioneAtteso?: string;
  } = {}
) {
  // Mock API autenticazione - utente loggato
  await page.route("**/api/auth/sessione", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ autenticato: true, utente: { id: "utente-test-1", nome: "Mario Rossi" } }),
    })
  );

  // Mock API lista collezioni - nessuna collezione esistente
  await page.route("**/api/collezione/lista", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ collezioni: [] }),
    })
  );

  // Mock API salvataggio collezione
  await page.route("**/api/collezione", (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          messaggio: "Analisi salvata nella tua collezione!",
          analisi: { id: "analisi-test-1", urlFoto: "https://example.com/foto.jpg", createdAt: new Date().toISOString() },
          collezioneId: ID_COLLEZIONE_CREATA,
        }),
      });
    }
    return route.continue();
  });

  // Inietta dati in sessionStorage prima di navigare
  await page.addInitScript((datiSerializzati: string) => {
    sessionStorage.setItem("bloombuddy-analisi-corrente", datiSerializzati);
  }, JSON.stringify(DATI_ANALISI_FITTIZI));

  // Naviga alla pagina analisi
  await page.goto("/analysis");

  // Attendi che il risultato analisi sia visibile
  await expect(page.getByRole("heading", { name: DATI_ANALISI_FITTIZI.analisi.nomeComune, exact: true })).toBeVisible({ timeout: 10000 });
}

test.describe("US-028: Salvataggio analisi in nuova collezione", () => {
  test("flusso completo con nome personalizzato: analisi completata → salva → crea nuova collezione → modifica nome → conferma → redirect", async ({ page }) => {
    await preparaPaginaAnalisi(page);

    // 1. Clicca "Salva nella collezione"
    const pulsanteSalva = page.getByRole("button", { name: "Salva nella collezione" });
    await expect(pulsanteSalva).toBeVisible();
    await pulsanteSalva.click();

    // 2. Il modale si apre - verifica intestazione
    const dialogoCollezione = page.getByRole("dialog");
    await expect(dialogoCollezione).toBeVisible();
    await expect(dialogoCollezione.getByText("Salva nella collezione")).toBeVisible();

    // 3. Clicca "Crea nuova collezione"
    const pulsanteCreaNuova = dialogoCollezione.getByText("Crea nuova collezione");
    await expect(pulsanteCreaNuova).toBeVisible();
    await pulsanteCreaNuova.click();

    // 4. Il pannello creazione si apre - verifica che l'input sia pre-compilato col nome della pianta
    const inputNomeCollezione = dialogoCollezione.getByLabel("Nome collezione");
    await expect(inputNomeCollezione).toBeVisible();
    await expect(inputNomeCollezione).toHaveValue(DATI_ANALISI_FITTIZI.analisi.nomeComune);

    // 5. Modifica il nome con un nome personalizzato
    const nomePersonalizzato = "Le mie piante tropicali";
    await inputNomeCollezione.clear();
    await inputNomeCollezione.fill(nomePersonalizzato);
    await expect(inputNomeCollezione).toHaveValue(nomePersonalizzato);

    // 6. Clicca "Conferma"
    const pulsanteConferma = dialogoCollezione.getByRole("button", { name: "Conferma" });
    await expect(pulsanteConferma).toBeEnabled();
    await pulsanteConferma.click();

    // 7. Verifica redirect alla collezione creata
    await page.waitForURL(`**/collezione/${ID_COLLEZIONE_CREATA}`, { timeout: 10000 });
    expect(page.url()).toContain(`/collezione/${ID_COLLEZIONE_CREATA}`);
  });

  test("flusso con nome pre-compilato non modificato: l'utente conferma direttamente il nome suggerito dalla pianta", async ({ page }) => {
    await preparaPaginaAnalisi(page);

    // 1. Clicca "Salva nella collezione"
    const pulsanteSalva = page.getByRole("button", { name: "Salva nella collezione" });
    await pulsanteSalva.click();

    // 2. Il modale si apre
    const dialogoCollezione = page.getByRole("dialog");
    await expect(dialogoCollezione).toBeVisible();

    // 3. Clicca "Crea nuova collezione"
    await dialogoCollezione.getByText("Crea nuova collezione").click();

    // 4. Verifica che l'input sia pre-compilato col nome della pianta
    const inputNomeCollezione = dialogoCollezione.getByLabel("Nome collezione");
    await expect(inputNomeCollezione).toBeVisible();
    await expect(inputNomeCollezione).toHaveValue(DATI_ANALISI_FITTIZI.analisi.nomeComune);

    // 5. NON modifica il nome - conferma direttamente
    const pulsanteConferma = dialogoCollezione.getByRole("button", { name: "Conferma" });
    await expect(pulsanteConferma).toBeEnabled();
    await pulsanteConferma.click();

    // 6. Verifica redirect alla collezione creata
    await page.waitForURL(`**/collezione/${ID_COLLEZIONE_CREATA}`, { timeout: 10000 });
    expect(page.url()).toContain(`/collezione/${ID_COLLEZIONE_CREATA}`);
  });

  test("verifica che il nome della pianta appaia nel suggerimento del pulsante crea nuova collezione", async ({ page }) => {
    await preparaPaginaAnalisi(page);

    // Apri il modale
    await page.getByRole("button", { name: "Salva nella collezione" }).click();
    const dialogoCollezione = page.getByRole("dialog");
    await expect(dialogoCollezione).toBeVisible();

    // Verifica che il nome della pianta sia visibile come suggerimento sotto il pulsante
    const suggerimentoNomePianta = dialogoCollezione.getByText(`\u201c${DATI_ANALISI_FITTIZI.analisi.nomeComune}\u201d`);
    await expect(suggerimentoNomePianta).toBeVisible();
  });

  test("il pulsante conferma è disabilitato se il nome viene svuotato", async ({ page }) => {
    await preparaPaginaAnalisi(page);

    // Apri modale e pannello creazione
    await page.getByRole("button", { name: "Salva nella collezione" }).click();
    const dialogoCollezione = page.getByRole("dialog");
    await dialogoCollezione.getByText("Crea nuova collezione").click();

    // Svuota l'input
    const inputNomeCollezione = dialogoCollezione.getByLabel("Nome collezione");
    await inputNomeCollezione.clear();

    // Verifica che il pulsante conferma sia disabilitato
    const pulsanteConferma = dialogoCollezione.getByRole("button", { name: "Conferma" });
    await expect(pulsanteConferma).toBeDisabled();
  });

  test("il pulsante annulla riporta alla lista collezioni senza salvare", async ({ page }) => {
    await preparaPaginaAnalisi(page);

    // Apri modale e pannello creazione
    await page.getByRole("button", { name: "Salva nella collezione" }).click();
    const dialogoCollezione = page.getByRole("dialog");
    await dialogoCollezione.getByText("Crea nuova collezione").click();

    // Verifica che siamo nel pannello creazione
    await expect(dialogoCollezione.getByText("Nuova collezione")).toBeVisible();

    // Clicca annulla
    await dialogoCollezione.getByRole("button", { name: "Annulla" }).click();

    // Verifica di essere tornati alla lista (l'intestazione torna a "Salva nella collezione")
    await expect(dialogoCollezione.getByText("Salva nella collezione")).toBeVisible();
    await expect(dialogoCollezione.getByText("Crea nuova collezione")).toBeVisible();
  });
});
