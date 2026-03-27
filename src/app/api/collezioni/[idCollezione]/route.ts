import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ idCollezione: string }> },
) {
  const risposta = NextResponse.json({});
  const sessione = await ottieniSessione(request, risposta);

  if (!sessione.utenteId) {
    return NextResponse.json(
      { errore: "Devi effettuare l'accesso per modificare una collezione." },
      { status: 401 },
    );
  }

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json(
      { errore: "Richiesta non valida. Assicurati di inviare i dati correttamente." },
      { status: 400 },
    );
  }

  const { nome } = corpo as { nome: unknown };

  if (typeof nome !== "string" || !nome.trim()) {
    return NextResponse.json(
      { errore: "Il nome della collezione è obbligatorio." },
      { status: 400 },
    );
  }

  const nomePulito = nome.trim();

  if (nomePulito.length > 100) {
    return NextResponse.json(
      { errore: "Il nome della collezione non può superare i 100 caratteri." },
      { status: 400 },
    );
  }

  const { idCollezione } = await params;

  const collezione = await prisma.collezione.findUnique({
    where: { id: idCollezione },
    select: { id: true, utenteId: true },
  });

  if (!collezione) {
    return NextResponse.json(
      { errore: "Collezione non trovata." },
      { status: 404 },
    );
  }

  if (collezione.utenteId !== sessione.utenteId) {
    return NextResponse.json(
      { errore: "Non sei autorizzato a modificare questa collezione." },
      { status: 403 },
    );
  }

  const collezioneAggiornata = await prisma.collezione.update({
    where: { id: idCollezione },
    data: { nome: nomePulito },
    select: { nome: true },
  });

  return NextResponse.json(
    { nome: collezioneAggiornata.nome },
    { status: 200 },
  );
}
