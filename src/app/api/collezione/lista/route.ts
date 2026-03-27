import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";

export async function GET(request: NextRequest) {
  const risposta = NextResponse.json({});
  const sessione = await ottieniSessione(request, risposta);

  if (!sessione.utenteId) {
    return NextResponse.json(
      { errore: "Devi effettuare l'accesso." },
      { status: 401 },
    );
  }

  const collezioni = await prisma.collezione.findMany({
    where: { utenteId: sessione.utenteId },
    select: {
      id: true,
      nome: true,
      nomeScientifico: true,
      _count: { select: { analisi: true } },
      analisi: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { urlFoto: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const risultato = collezioni.map((c) => ({
    id: c.id,
    nome: c.nome,
    nomeScientifico: c.nomeScientifico,
    numeroAnalisi: c._count.analisi,
    anteprimaUrl: c.analisi[0]?.urlFoto ?? null,
  }));

  return NextResponse.json({ collezioni: risultato });
}
