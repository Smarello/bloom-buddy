import { NextRequest, NextResponse } from "next/server";
import { ottieniSessione } from "@/lib/auth/sessione";

export async function POST(request: NextRequest) {
  const risposta = NextResponse.redirect(new URL("/", request.url), 302);

  const sessione = await ottieniSessione(request, risposta);
  sessione.destroy();

  return risposta;
}
