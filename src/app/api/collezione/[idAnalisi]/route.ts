import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idAnalisi: string }> },
) {
  const risposta = NextResponse.json({});
  const sessione = await ottieniSessione(request, risposta);

  if (!sessione.utenteId) {
    return NextResponse.json(
      { errore: "Devi effettuare l'accesso per visualizzare un'analisi." },
      { status: 401 },
    );
  }

  const { idAnalisi } = await params;

  const analisi = await prisma.analisi.findUnique({
    where: { id: idAnalisi },
  });

  if (!analisi || analisi.utenteId !== sessione.utenteId) {
    return NextResponse.json(
      { errore: "Analisi non trovata." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      datiAnalisi: analisi.datiAnalisi,
      urlFoto: analisi.urlFoto,
      createdAt: analisi.createdAt,
    },
    { status: 200 },
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ idAnalisi: string }> },
) {
  const risposta = NextResponse.json({});
  const sessione = await ottieniSessione(request, risposta);

  if (!sessione.utenteId) {
    return NextResponse.json(
      { errore: "Devi effettuare l'accesso per eliminare un'analisi." },
      { status: 401 },
    );
  }

  const { idAnalisi } = await params;

  const analisi = await prisma.analisi.findUnique({
    where: { id: idAnalisi },
    select: { id: true, utenteId: true, urlFoto: true },
  });

  if (!analisi || analisi.utenteId !== sessione.utenteId) {
    return NextResponse.json(
      { errore: "Analisi non trovata." },
      { status: 404 },
    );
  }

  await prisma.analisi.delete({ where: { id: analisi.id } });

  try {
    await del(analisi.urlFoto);
  } catch (errore) {
    console.error("Errore durante l'eliminazione della foto dal blob:", errore);
  }

  return NextResponse.json(
    { messaggio: "Analisi eliminata con successo." },
    { status: 200 },
  );
}
