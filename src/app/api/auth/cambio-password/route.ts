import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";

const SALT_ROUNDS = 12;

// Hash dummy per uniformare i tempi di risposta quando l'utente non esiste
// (previene timing attack per user enumeration)
const HASH_DUMMY =
  "$2b$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012";

export async function POST(request: NextRequest) {
  const risposta = NextResponse.json({});
  const sessione = await ottieniSessione(request, risposta);

  if (!sessione.utenteId) {
    return NextResponse.json(
      { errore: "Devi effettuare l'accesso." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errore: "Richiesta non valida." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).passwordAttuale !== "string" ||
    typeof (body as Record<string, unknown>).nuovaPassword !== "string" ||
    typeof (body as Record<string, unknown>).confermaPassword !== "string"
  ) {
    return NextResponse.json(
      { errore: "Tutti i campi sono obbligatori." },
      { status: 400 },
    );
  }

  const { passwordAttuale, nuovaPassword, confermaPassword } = body as {
    passwordAttuale: string;
    nuovaPassword: string;
    confermaPassword: string;
  };

  if (nuovaPassword.length < 8) {
    return NextResponse.json(
      { errore: "La nuova password deve essere di almeno 8 caratteri." },
      { status: 400 },
    );
  }

  if (nuovaPassword !== confermaPassword) {
    return NextResponse.json(
      { errore: "La nuova password e la conferma non coincidono." },
      { status: 400 },
    );
  }

  const utente = await prisma.user.findUnique({
    where: { id: sessione.utenteId },
    select: { passwordHash: true },
  });

  const passwordCorrispondente = await bcrypt.compare(
    passwordAttuale,
    utente?.passwordHash ?? HASH_DUMMY,
  );

  if (!utente || !passwordCorrispondente) {
    return NextResponse.json(
      { errore: "La password attuale non è corretta." },
      { status: 401 },
    );
  }

  const nuovoHash = await bcrypt.hash(nuovaPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: sessione.utenteId },
    data: { passwordHash: nuovoHash },
  });

  return new NextResponse(JSON.stringify({ successo: true }), {
    status: 200,
    headers: risposta.headers,
  });
}
