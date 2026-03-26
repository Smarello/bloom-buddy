import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ottieniSessione } from "@/lib/auth/sessione";

export async function GET(request: NextRequest) {
  const risposta = NextResponse.json({});
  const sessione = await ottieniSessione(request, risposta);

  if (sessione.utenteId) {
    return NextResponse.json({ autenticato: true, email: sessione.email });
  }

  return NextResponse.json({ autenticato: false });
}
