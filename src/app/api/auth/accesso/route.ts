import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";

export async function POST(request: NextRequest) {
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
    typeof (body as Record<string, unknown>).email !== "string" ||
    typeof (body as Record<string, unknown>).password !== "string"
  ) {
    return NextResponse.json(
      { errore: "Email e password sono obbligatori." },
      { status: 400 },
    );
  }

  const { email, password } = body as { email: string; password: string };

  const utenteTrovato = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, passwordHash: true },
  });

  const MESSAGGIO_CREDENZIALI_ERRATE =
    "Email o password non corrispondono. Nessun problema, riprova con calma!";

  // Hash dummy per uniformare i tempi di risposta quando l'utente non esiste
  // (previene timing attack per user enumeration)
  const HASH_DUMMY =
    "$2b$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012";

  const passwordCorrispondente = await bcrypt.compare(
    password,
    utenteTrovato?.passwordHash ?? HASH_DUMMY,
  );

  if (!utenteTrovato || !passwordCorrispondente) {
    return NextResponse.json(
      { errore: MESSAGGIO_CREDENZIALI_ERRATE },
      { status: 401 },
    );
  }

  const risposta = NextResponse.json({ successo: true });
  const sessione = await ottieniSessione(request, risposta);
  sessione.utenteId = utenteTrovato.id;
  sessione.email = utenteTrovato.email;
  await sessione.save();

  return risposta;
}
