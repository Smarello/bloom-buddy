import { redirect } from "next/navigation";
import { ottieniSessioneServer } from "@/lib/auth/sessione";
import { prisma } from "@/lib/db/client";
import type { Prisma } from "@/generated/prisma/client";
import type { PlantAnalysis, HealthStatus } from "@/types/analysis";
import Link from "next/link";
import Image from "next/image";
import { isPlantAnalysis } from "@/lib/collezione/validazione";
import PulsanteEliminaCollezioneCard from "@/components/pulsante-elimina-collezione-card";

type CollezioneConAnalisi = Prisma.CollezioneGetPayload<{
  include: { analisi: true; _count: { select: { analisi: true } } };
}>;

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

  let collezioni: CollezioneConAnalisi[] = [];
  try {
    collezioni = await prisma.collezione.findMany({
      where: { utenteId: sessione.utenteId },
      include: {
        analisi: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { analisi: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (errore) {
    console.error("Errore nel caricamento delle collezioni:", errore);
    collezioni = [];
  }

  return (
    <section className="py-8 pb-20">
      <div
        className="mx-auto px-6 max-md:px-4"
        style={{ maxWidth: "var(--container-max, 1100px)" }}
      >
        <h1 className="font-[family-name:var(--font-display)] font-bold text-2xl text-[var(--color-text)] mb-8">
          La mia collezione
        </h1>

        {collezioni.length === 0 ? (
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
            {collezioni.map((collezione) => {
              const ultimaAnalisi = collezione.analisi[0];
              const datiAnalisi = ultimaAnalisi && isPlantAnalysis(ultimaAnalisi.datiAnalisi)
                ? ultimaAnalisi.datiAnalisi
                : null;
              const totaleAnalisi = collezione._count.analisi;
              const salute = datiAnalisi
                ? (COLORI_SALUTE[datiAnalisi.statoSalute] ?? COLORI_SALUTE.good)
                : COLORI_SALUTE.good;
              const dataFormattata = ultimaAnalisi
                ? new Date(ultimaAnalisi.createdAt).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "";
              const etichettaAnalisi =
                totaleAnalisi === 1 ? "1 analisi" : `${totaleAnalisi} analisi`;

              return (
                <div key={collezione.id} className="relative">
                  <Link
                    href={`/collezione/${collezione.id}`}
                    aria-label={`Apri collezione di ${collezione.nome}`}
                    className="block"
                  >
                    <article className="group rounded-2xl border border-[rgba(218,232,218,0.5)] bg-white/70 backdrop-blur-sm overflow-hidden transition-shadow hover:shadow-lg hover:shadow-[var(--color-primary-100)]/40">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-primary-50)]">
                        {ultimaAnalisi && (
                          <Image
                            src={ultimaAnalisi.urlFoto}
                            alt={collezione.nome}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
                        {datiAnalisi && (
                          <span
                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${salute.bg} ${salute.testo}`}
                          >
                            {salute.etichetta}
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h2 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--color-text)] leading-tight mb-0.5">
                          {collezione.nome}
                        </h2>
                        {collezione.nomeScientifico && (
                          <p className="text-sm text-[var(--color-text-muted)] italic mb-3">
                            {collezione.nomeScientifico}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          {ultimaAnalisi && (
                            <time
                              dateTime={new Date(ultimaAnalisi.createdAt).toISOString()}
                              className="text-xs text-[var(--color-text-secondary)]"
                            >
                              {dataFormattata}
                            </time>
                          )}
                          <span className="text-xs font-medium text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-2 py-0.5 rounded-full">
                            {etichettaAnalisi}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>

                  {/* Pulsante elimina collezione — fuori dal Link per evitare navigazione al click */}
                  <PulsanteEliminaCollezioneCard
                    idCollezione={collezione.id}
                    nomeCollezione={collezione.nome}
                    numeroAnalisi={totaleAnalisi}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
