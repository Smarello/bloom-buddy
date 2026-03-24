import type { NextRequest } from "next/server";
import { ottieniClienteGemini, NOME_MODELLO } from "@/lib/ai/client";
import { generaPromptAnalisiPianta } from "@/lib/ai/prompts";
import { parseRispostaGemini, ErroreAnalisi } from "@/lib/ai/parse-response";
import {
  validaFormatoImmagine,
  validaDimensioneImmagine,
  FORMATI_IMMAGINE_ACCETTATI,
} from "@/lib/image/costanti-validazione";
import { verificaRateLimit } from "@/lib/sicurezza/rate-limiter";
import { estraiIpCliente } from "@/lib/sicurezza/estrai-ip-cliente";

export async function POST(request: NextRequest) {
  // Rate limiting per IP
  const ipCliente = estraiIpCliente(request);
  const risultatoRateLimit = verificaRateLimit(ipCliente);

  if (!risultatoRateLimit.consentito) {
    return Response.json(
      {
        errore: `Hai effettuato troppe richieste. Riprova tra ${risultatoRateLimit.secondiRimanenti} secondi.`,
        tipo: "rate-limit-superato",
        secondiRimanenti: risultatoRateLimit.secondiRimanenti,
      },
      { status: 429 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { errore: "Richiesta non valida. Assicurati di inviare l'immagine correttamente." },
      { status: 400 },
    );
  }

  const file = formData.get("immagine");

  if (!(file instanceof File)) {
    return Response.json(
      { errore: "Nessuna immagine ricevuta. Carica una foto della tua pianta." },
      { status: 400 },
    );
  }

  // Validazione server-side formato
  const validazioneFormato = validaFormatoImmagine(file.type);
  if (!validazioneFormato.valido) {
    return Response.json(
      { errore: validazioneFormato.errore },
      { status: 400 },
    );
  }

  // Validazione server-side dimensione
  const validazioneDimensione = validaDimensioneImmagine(file.size);
  if (!validazioneDimensione.valido) {
    return Response.json(
      { errore: validazioneDimensione.errore },
      { status: 400 },
    );
  }

  // Conversione in base64 per Gemini
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const tipoMime = file.type as (typeof FORMATI_IMMAGINE_ACCETTATI)[number];

  try {
    const modello = ottieniClienteGemini().getGenerativeModel({ model: NOME_MODELLO });

    const risultato = await modello.generateContent([
      generaPromptAnalisiPianta(),
      {
        inlineData: {
          mimeType: tipoMime,
          data: base64,
        },
      },
    ]);

    const testoRisposta = risultato.response.text();
    const analisi = parseRispostaGemini(testoRisposta);

    return Response.json(analisi);
  } catch (errore) {
    if (errore instanceof ErroreAnalisi) {
      const statusCode =
        errore.tipo === "pianta-non-riconosciuta" || errore.tipo === "confidenza-bassa"
          ? 422
          : 500;
      return Response.json({ errore: errore.message, tipo: errore.tipo }, { status: statusCode });
    }

    // Quota Gemini esaurita (429)
    if (
      errore instanceof Error &&
      "status" in errore &&
      (errore as { status: number }).status === 429
    ) {
      return Response.json(
        {
          errore:
            "Quota API Gemini esaurita. Il servizio ha raggiunto il limite giornaliero di richieste. Riprova domani o verifica il piano di fatturazione su ai.dev/rate-limit.",
          tipo: "quota-esaurita",
        },
        { status: 429 },
      );
    }

    console.error("Errore API Gemini:", errore);

    return Response.json(
      {
        errore:
          "Il servizio di analisi non è disponibile al momento. Riprova tra qualche minuto.",
        tipo: "errore-api",
      },
      { status: 500 },
    );
  }
}
