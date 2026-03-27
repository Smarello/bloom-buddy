import { redirect } from "next/navigation";
import { ottieniSessioneServer } from "@/lib/auth/sessione";
import { prisma } from "@/lib/db/client";
import type { PlantAnalysis, HealthStatus } from "@/types/analysis";
import Link from "next/link";
import Image from "next/image";
import { isPlantAnalysis } from "@/lib/collezione/recuperaAnalisiPerPianta";

interface PiantaRaggruppata {
  nomeComune: string;
  analisiPiuRecente: { id: string; urlFoto: string; datiAnalisi: PlantAnalysis; createdAt: Date };
  totaleAnalisi: number;
}

const COLORI_SALUTE: Record<HealthStatus, { bg: string; testo: string; etichetta: string }> = {
  excellent: { bg: "bg-[var(--color-primary-50)]", testo: "text-[var(--color-primary-700)]", etichetta: "Ottima" },
  good: { bg: "bg-[var(--color-primary-50)]", testo: "text-[var(--color-primary-600)]", etichetta: "Buona" },
  fair: { bg: "bg-amber-100", testo: "text-amber-700", etichetta: "Discreta" },
  poor: { bg: "bg-red-100", testo: "text-red-700", etichetta: "Critica" },
};

export default async function PaginaCollezione() {
  const sessione = await ottieniSessioneServer();

  if (!sessione.utenteId) {
    redirect("/accesso");
  }

  let analisiSalvate: Awaited<ReturnType<typeof prisma.analisi.findMany>> = [];
  try {
    analisiSalvate = await prisma.analisi.findMany({
      where: { utenteId: sessione.utenteId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    analisiSalvate = [];
  }

  // Raggruppa le analisi valide per nomeComune (case-insensitive)
  const gruppiPerNome = new Map<string, PiantaRaggruppata>();

  for (const analisi of analisiSalvate) {
    if (!isPlantAnalysis(analisi.datiAnalisi)) continue;
    const datiValidati: PlantAnalysis = analisi.datiAnalisi;
    const chiave = datiValidati.nomeComune.toLowerCase();

    if (!gruppiPerNome.has(chiave)) {
      // Prima occorrenza: è già la più recente perché il fetch è ordinato desc
      gruppiPerNome.set(chiave, {
        nomeComune: datiValidati.nomeComune,
        analisiPiuRecente: {
          id: analisi.id,
          urlFoto: analisi.urlFoto,
          datiAnalisi: datiValidati,
          createdAt: analisi.createdAt,
        },
        totaleAnalisi: 1,
      });
    } else {
      const gruppo = gruppiPerNome.get(chiave)!;
      gruppo.totaleAnalisi += 1;
    }
  }

  // Ordina per data dell'analisi più recente (discendente)
  const piantaRaggruppate: PiantaRaggruppata[] = Array.from(gruppiPerNome.values()).sort(
    (a, b) =>
      new Date(b.analisiPiuRecente.createdAt).getTime() -
      new Date(a.analisiPiuRecente.createdAt).getTime()
  );

  return (
    <section className="py-8 pb-20">
      <div
        className="mx-auto px-6 max-md:px-4"
        style={{ maxWidth: "var(--container-max, 1100px)" }}
      >
        <h1 className="font-[family-name:var(--font-display)] font-bold text-2xl text-[var(--color-text)] mb-8">
          La mia collezione
        </h1>

        {analisiSalvate.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 gap-6">
            <div className="w-20 h-20 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                className="w-10 h-10"
                aria-hidden="true"
              >
                <path
                  d="M24 44c-2-4-16-14-16-24a10 10 0 0 1 16-8 10 10 0 0 1 16 8c0 10-14 20-16 24z"
                  stroke="var(--color-primary-300)"
                  strokeWidth="2.5"
                  fill="var(--color-primary-50)"
                />
                <path
                  d="M24 18v10M20 24h8"
                  stroke="var(--color-primary-400)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] font-semibold text-lg text-[var(--color-text)] mb-2">
                La tua collezione è ancora vuota
              </p>
              <p className="text-[var(--color-text-muted)] max-w-sm mx-auto">
                Analizza una pianta e salvala per iniziare a costruire il tuo giardino digitale!
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-semibold text-sm text-white bg-[var(--color-primary-600)] px-6 py-3 rounded-full transition-colors hover:bg-[var(--color-primary-500)]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Analizza la tua prima pianta
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {piantaRaggruppate.map((pianta) => {
              const { analisiPiuRecente, totaleAnalisi, nomeComune } = pianta;
              const salute =
                COLORI_SALUTE[analisiPiuRecente.datiAnalisi.statoSalute] ?? COLORI_SALUTE.good;
              const dataFormattata = new Date(analisiPiuRecente.createdAt).toLocaleDateString(
                "it-IT",
                { day: "numeric", month: "long", year: "numeric" }
              );
              const etichettaAnalisi =
                totaleAnalisi === 1 ? "1 analisi" : `${totaleAnalisi} analisi`;

              return (
                <Link
                  key={nomeComune.toLowerCase()}
                  href={`/collezione/${encodeURIComponent(nomeComune)}`}
                  aria-label={`Apri collezione di ${nomeComune}`}
                >
                  <article className="group rounded-2xl border border-[rgba(218,232,218,0.5)] bg-white/70 backdrop-blur-sm overflow-hidden transition-shadow hover:shadow-lg hover:shadow-[var(--color-primary-100)]/40">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-primary-50)]">
                      <Image
                        src={analisiPiuRecente.urlFoto}
                        alt={nomeComune}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${salute.bg} ${salute.testo}`}
                      >
                        {salute.etichetta}
                      </span>
                    </div>

                    <div className="p-4">
                      <h2 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-text)] leading-tight mb-0.5">
                        {nomeComune}
                      </h2>
                      <p className="text-sm text-[var(--color-text-muted)] italic mb-3">
                        {analisiPiuRecente.datiAnalisi.nomeScientifico}
                      </p>
                      <div className="flex items-center justify-between">
                        <time
                          dateTime={new Date(analisiPiuRecente.createdAt).toISOString()}
                          className="text-xs text-[var(--color-text-secondary)]"
                        >
                          {dataFormattata}
                        </time>
                        <span className="text-xs font-medium text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-2 py-0.5 rounded-full">
                          {etichettaAnalisi}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
