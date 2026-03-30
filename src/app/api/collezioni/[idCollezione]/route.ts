import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ idCollezione: string }> },
) {
  const risposta = NextResponse.json({});
  const sessione = await ottieniSessione(request, risposta);

  if (!sessione.utenteId) {
    return NextResponse.json(
      { errore: "Devi effettuare l'accesso per eliminare una collezione." },
      { status: 401 },
    );
  }

  const { idCollezione } = await params;

  const collezione = await prisma.collezione.findUnique({
    where: { id: idCollezione },
    select: { id: true, utenteId: true, analisi: { select: { urlFoto: true } } },
  });

  if (!collezione) {
    return NextResponse.json(
      { errore: "Collezione non trovata." },
      { status: 404 },
    );
  }

  if (collezione.utenteId !== sessione.utenteId) {
    return NextResponse.json(
      { errore: "Non sei autorizzato a eliminare questa collezione." },
      { status: 403 },
    );
  }

  await prisma.$transaction([
    prisma.analisi.deleteMany({ where: { collezioneId: idCollezione } }),
    prisma.collezione.delete({ where: { id: idCollezione } }),
  ]);

  const urlFotoDaEliminare = collezione.analisi
    .map((analisi) => analisi.urlFoto)
    .filter(Boolean) as string[];

  if (urlFotoDaEliminare.length > 0) {
    const risultatiPulizia = await Promise.allSettled(
      urlFotoDaEliminare.map((url) => del(url)),
    );

    for (const risultato of risultatiPulizia) {
      if (risultato.status === "rejected") {
        console.error(
          "Errore durante la pulizia del blob:",
          risultato.reason,
        );
      }
    }
  }

  return NextResponse.json(
    { messaggio: "Collezione eliminata con successo." },
    { status: 200 },
  );
}
