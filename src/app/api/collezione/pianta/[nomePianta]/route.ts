import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ottieniSessione } from "@/lib/auth/sessione";
import { recuperaAnalisiPerPianta } from "@/lib/collezione/recuperaAnalisiPerPianta";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nomePianta: string }> },
) {
  const risposta = NextResponse.json({});
  const sessione = await ottieniSessione(request, risposta);

  if (!sessione.utenteId) {
    return NextResponse.json(
      { errore: "Devi effettuare l'accesso per visualizzare la collezione." },
      { status: 401 },
    );
  }

  const { nomePianta } = await params;
  const nomePiantaDecodificato = decodeURIComponent(nomePianta);

  const analisiPianta = await recuperaAnalisiPerPianta(sessione.utenteId, nomePiantaDecodificato);

  return NextResponse.json(
    {
      analisi: analisiPianta.map((analisi) => ({
        id: analisi.id,
        datiAnalisi: analisi.datiAnalisi,
        urlFoto: analisi.urlFoto,
        createdAt: analisi.createdAt,
      })),
    },
    { status: 200 },
  );
}
