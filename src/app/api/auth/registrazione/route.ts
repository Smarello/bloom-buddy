import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";
import { Prisma } from "@/generated/prisma/client";

const SALT_ROUNDS = 12;

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

  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!REGEX_EMAIL.test(email.trim())) {
    return NextResponse.json(
      { errore: "Inserisci un indirizzo email valido." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { errore: "La password deve essere di almeno 8 caratteri." },
      { status: 400 },
    );
  }

  const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

  let nuovoUtente: { id: string; email: string };

  try {
    nuovoUtente = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash: hashPassword,
      },
      select: { id: true, email: true },
    });
  } catch (errore) {
    if (
      errore instanceof Prisma.PrismaClientKnownRequestError &&
      errore.code === "P2002"
    ) {
      return NextResponse.json(
        { errore: "Questa email è già registrata. Prova ad accedere." },
        { status: 409 },
      );
    }
    throw errore;
  }

  const risposta = NextResponse.json({ successo: true });
  const sessione = await ottieniSessione(request, risposta);
  sessione.utenteId = nuovoUtente.id;
  sessione.email = nuovoUtente.email;
  await sessione.save();

  return risposta;
}
