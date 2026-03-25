import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export interface DatiSessione {
  utenteId?: string;
  email?: string;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error(
    "Variabile d'ambiente SESSION_SECRET mancante. Aggiungila al file .env (vedi .env.example).",
  );
}

const OPZIONI_SESSIONE: SessionOptions = {
  cookieName: "bloom_buddy_sessione",
  password: sessionSecret,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function ottieniSessione(
  request: NextRequest,
  response: NextResponse,
): Promise<IronSession<DatiSessione>> {
  return getIronSession<DatiSessione>(request, response, OPZIONI_SESSIONE);
}
