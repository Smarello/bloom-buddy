import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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
