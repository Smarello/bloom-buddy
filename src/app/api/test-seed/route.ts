import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";

/**
 * Endpoint di seed per i test e2e.
 * Disponibile solo in ambiente di sviluppo.
 *
 * POST /api/test-seed
 * Body: { azione: "crea-collezione-con-analisi" | "crea-collezione-vuota" | "pulizia" }
 *
 * - Crea un utente di test (se non esiste) e lo autentica
 * - Crea una collezione con o senza analisi
 * - Restituisce gli ID creati
 */
export async function POST(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_TEST_SEED !== "true"
  ) {
    return NextResponse.json(
      {
        errore:
          "Endpoint non disponibile. Richiede NODE_ENV !== 'production' e ENABLE_TEST_SEED=true.",
      },
      { status: 403 },
    );
  }

  let corpo: { azione: string };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json(
      { errore: "Body JSON non valido." },
      { status: 400 },
    );
  }

  const EMAIL_UTENTE_TEST = "e2e-test-eliminazione@bloom-buddy.test";
  const PASSWORD_UTENTE_TEST = "TestPassword123!";
  const NOME_COLLEZIONE = "Le mie tropicali";

  const datiAnalisi = {
    nomeComune: "Pothos dorato",
    nomeScientifico: "Epipremnum aureum",
    livelloConfidenza: 0.92,
    statoSalute: "good",
    descrizioneSalute: "La pianta è in buone condizioni generali.",
    consigliCura: [
      {
        titolo: "Annaffia regolarmente",
        descrizione: "Ogni 7-10 giorni.",
        priorita: "media",
      },
    ],
    descrizione: "Pianta tropicale rampicante molto resistente.",
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
  };

  if (corpo.azione === "pulizia") {
    // Elimina tutto il dato di test
    const utente = await prisma.user.findUnique({
      where: { email: EMAIL_UTENTE_TEST },
      select: { id: true },
    });

    if (utente) {
      await prisma.analisi.deleteMany({ where: { utenteId: utente.id } });
      await prisma.collezione.deleteMany({ where: { utenteId: utente.id } });
      await prisma.user.delete({ where: { id: utente.id } });
    }

    return NextResponse.json({ messaggio: "Pulizia completata." });
  }

  // Crea o trova utente di test
  let utente = await prisma.user.findUnique({
    where: { email: EMAIL_UTENTE_TEST },
    select: { id: true, email: true },
  });

  if (!utente) {
    const hashPassword = await bcrypt.hash(PASSWORD_UTENTE_TEST, 4); // Pochi round per velocita nei test
    utente = await prisma.user.create({
      data: {
        email: EMAIL_UTENTE_TEST,
        passwordHash: hashPassword,
      },
      select: { id: true, email: true },
    });
  }

  // Pulisci dati precedenti dell'utente di test
  await prisma.analisi.deleteMany({ where: { utenteId: utente.id } });
  await prisma.collezione.deleteMany({ where: { utenteId: utente.id } });

  // Autentica l'utente di test nella sessione
  const risposta = NextResponse.json({});
  const sessione = await ottieniSessione(request, risposta);
  sessione.utenteId = utente.id;
  sessione.email = utente.email;
  await sessione.save();

  if (corpo.azione === "crea-collezione-con-analisi") {
    const collezione = await prisma.collezione.create({
      data: {
        nome: NOME_COLLEZIONE,
        nomeScientifico: "Epipremnum aureum",
        utenteId: utente.id,
      },
      select: { id: true },
    });

    // URL che corrisponde al pattern remotePatterns di next.config (*.public.blob.vercel-storage.com)
    const urlFotoFittizia = "https://test.public.blob.vercel-storage.com/test-pianta.jpg";

    const analisi1 = await prisma.analisi.create({
      data: {
        urlFoto: urlFotoFittizia,
        datiAnalisi: datiAnalisi as object,
        hashFoto: "hash-test-analisi-1-" + Date.now(),
        utenteId: utente.id,
        collezioneId: collezione.id,
      },
      select: { id: true },
    });

    const analisi2 = await prisma.analisi.create({
      data: {
        urlFoto: urlFotoFittizia,
        datiAnalisi: datiAnalisi as object,
        hashFoto: "hash-test-analisi-2-" + Date.now(),
        utenteId: utente.id,
        collezioneId: collezione.id,
      },
      select: { id: true },
    });

    return NextResponse.json(
      {
        utenteId: utente.id,
        collezioneId: collezione.id,
        nomeCollezione: NOME_COLLEZIONE,
        analisiIds: [analisi1.id, analisi2.id],
      },
      {
        status: 201,
        headers: risposta.headers,
      },
    );
  }

  if (corpo.azione === "crea-collezione-vuota") {
    const collezione = await prisma.collezione.create({
      data: {
        nome: NOME_COLLEZIONE,
        nomeScientifico: "Epipremnum aureum",
        utenteId: utente.id,
      },
      select: { id: true },
    });

    return NextResponse.json(
      {
        utenteId: utente.id,
        collezioneId: collezione.id,
        nomeCollezione: NOME_COLLEZIONE,
        analisiIds: [],
      },
      {
        status: 201,
        headers: risposta.headers,
      },
    );
  }

  return NextResponse.json(
    { errore: "Azione non riconosciuta." },
    { status: 400 },
  );
}
