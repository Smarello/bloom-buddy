import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/db/client";
import { ottieniSessione } from "@/lib/auth/sessione";

export async function POST(request: NextRequest) {
  const risposta = NextResponse.json({});
  const sessione = await ottieniSessione(request, risposta);

  if (!sessione.utenteId) {
    return NextResponse.json(
      { errore: "Devi effettuare l'accesso per salvare un'analisi nella collezione." },
      { status: 401 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { errore: "Richiesta non valida. Assicurati di inviare i dati correttamente." },
      { status: 400 },
    );
  }

  const foto = formData.get("foto");
  const datiAnalisiGrezzi = formData.get("datiAnalisi");
  const collezioneIdRicevuto = formData.get("collezioneId");
  const nomeCollezioneRicevuto = formData.get("nomeCollezione");

  if (!(foto instanceof File)) {
    return NextResponse.json(
      { errore: "Nessuna foto ricevuta. Carica l'immagine della pianta analizzata." },
      { status: 400 },
    );
  }

  if (typeof datiAnalisiGrezzi !== "string" || !datiAnalisiGrezzi.trim()) {
    return NextResponse.json(
      { errore: "I dati dell'analisi sono obbligatori." },
      { status: 400 },
    );
  }

  let datiAnalisi: unknown;
  try {
    datiAnalisi = JSON.parse(datiAnalisiGrezzi);
  } catch {
    return NextResponse.json(
      { errore: "I dati dell'analisi non sono in un formato valido." },
      { status: 400 },
    );
  }

  // Validazione campi obbligatori nei dati dell'analisi
  const datiAnalisiOggetto = datiAnalisi as Record<string, unknown>;
  const campiObbligatori = ["nomeComune", "nomeScientifico", "statoSalute"] as const;
  const campiMancanti = campiObbligatori.filter(
    (campo) => typeof datiAnalisiOggetto?.[campo] !== "string" || !(datiAnalisiOggetto[campo] as string).trim(),
  );
  if (campiMancanti.length > 0) {
    return NextResponse.json(
      { errore: `I dati dell'analisi sono incompleti. Campi mancanti: ${campiMancanti.join(", ")}.` },
      { status: 400 },
    );
  }

  // Limite dimensione payload JSON: 50 KB
  const LIMITE_DIMENSIONE_JSON_BYTES = 50 * 1024;
  if (new TextEncoder().encode(datiAnalisiGrezzi).byteLength > LIMITE_DIMENSIONE_JSON_BYTES) {
    return NextResponse.json(
      { errore: "I dati dell'analisi superano la dimensione massima consentita (50 KB)." },
      { status: 400 },
    );
  }

  // Limite dimensione foto: 10 MB
  const LIMITE_DIMENSIONE_FOTO_BYTES = 10 * 1024 * 1024;
  if (foto.size > LIMITE_DIMENSIONE_FOTO_BYTES) {
    return NextResponse.json(
      { errore: "La foto è troppo grande. La dimensione massima consentita è 10 MB." },
      { status: 400 },
    );
  }

  const bytesFoto = await foto.arrayBuffer();
  const bufferHash = await crypto.subtle.digest("SHA-256", bytesFoto);
  const hashFoto = Array.from(new Uint8Array(bufferHash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const utenteId = sessione.utenteId;

  const percorsoBlob = `collezione/${utenteId}/${hashFoto}.jpg`;
  const blobRisultato = await put(percorsoBlob, bytesFoto, { access: "public", addRandomSuffix: true });

  const nomeComune = (datiAnalisiOggetto.nomeComune as string).trim();
  const nomeScientifico = (datiAnalisiOggetto.nomeScientifico as string).trim();

  // Validazione collezioneId se fornito
  if (collezioneIdRicevuto !== null && typeof collezioneIdRicevuto === "string" && collezioneIdRicevuto.trim()) {
    const collezioneEsistente = await prisma.collezione.findUnique({
      where: { id: collezioneIdRicevuto.trim() },
      select: { id: true, utenteId: true },
    });

    if (!collezioneEsistente) {
      await del(blobRisultato.url).catch((erroreBlob) => {
        console.error("Blob orfano non rimosso:", blobRisultato.url, erroreBlob);
      });
      return NextResponse.json(
        { errore: "Collezione non trovata" },
        { status: 404 },
      );
    }

    if (collezioneEsistente.utenteId !== utenteId) {
      await del(blobRisultato.url).catch((erroreBlob) => {
        console.error("Blob orfano non rimosso:", blobRisultato.url, erroreBlob);
      });
      return NextResponse.json(
        { errore: "Non autorizzato" },
        { status: 403 },
      );
    }
  }

  const collezioneIdDaUsare = (typeof collezioneIdRicevuto === "string" && collezioneIdRicevuto.trim())
    ? collezioneIdRicevuto.trim()
    : null;

  const nomeCollezionePersonalizzato = (typeof nomeCollezioneRicevuto === "string" && nomeCollezioneRicevuto.trim().replace(/[\t\n\r]/g, ""))
    ? nomeCollezioneRicevuto.trim().replace(/[\t\n\r]/g, " ").replace(/\s+/g, " ").slice(0, 100)
    : null;

  let risultato: { analisi: { id: string; urlFoto: string; createdAt: Date }; collezioneId: string };
  try {
    risultato = await prisma.$transaction(async (tx) => {
      let collezioneId: string;

      if (collezioneIdDaUsare) {
        collezioneId = collezioneIdDaUsare;
      } else {
        const nuovaCollezione = await tx.collezione.create({
          data: {
            nome: nomeCollezionePersonalizzato ?? nomeComune,
            nomeScientifico,
            utenteId,
          },
          select: { id: true },
        });
        collezioneId = nuovaCollezione.id;
      }

      const analisiCreata = await tx.analisi.create({
        data: {
          urlFoto: blobRisultato.url,
          datiAnalisi: datiAnalisi as object,
          hashFoto,
          utenteId,
          collezioneId,
        },
        select: { id: true, urlFoto: true, createdAt: true },
      });

      return { analisi: analisiCreata, collezioneId };
    });
  } catch (errore) {
    // Pulizia blob orfano in caso di fallimento del salvataggio su DB
    await del(blobRisultato.url).catch((erroreBlob) => {
      console.error("Blob orfano non rimosso:", blobRisultato.url, erroreBlob);
    });

    if (
      errore instanceof Error &&
      "code" in errore
    ) {
      const codicePrisma = (errore as { code: string }).code;

      if (codicePrisma === "P2003") {
        return NextResponse.json(
          { errore: "Collezione non trovata" },
          { status: 404 },
        );
      }
    }

    throw errore;
  }

  return NextResponse.json(
    {
      messaggio: "Analisi salvata nella tua collezione!",
      analisi: risultato.analisi,
      collezioneId: risultato.collezioneId,
    },
    { status: 201 },
  );
}
