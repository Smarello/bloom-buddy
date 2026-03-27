import { redirect, notFound } from "next/navigation";
import { ottieniSessioneServer } from "@/lib/auth/sessione";
import { prisma } from "@/lib/db/client";
import type { PlantAnalysis, HealthStatus } from "@/types/analysis";
import Link from "next/link";
import Image from "next/image";
import { isPlantAnalysis } from "@/lib/collezione/validazione";

const COLORI_SALUTE: Record<HealthStatus, { bg: string; testo: string; etichetta: string }> = {
  excellent: { bg: "bg-[var(--color-primary-50)]", testo: "text-[var(--color-primary-700)]", etichetta: "Ottima" },
  good: { bg: "bg-[var(--color-primary-50)]", testo: "text-[var(--color-primary-600)]", etichetta: "Buona" },
  fair: { bg: "bg-amber-100", testo: "text-amber-700", etichetta: "Discreta" },
  poor: { bg: "bg-red-100", testo: "text-red-700", etichetta: "Critica" },
};

export default async function PaginaDettaglioCollezione({
  params,
}: {
  params: Promise<{ idCollezione: string }>;
}) {
  const sessione = await ottieniSessioneServer();

  if (!sessione.utenteId) {
    redirect("/accesso");
  }

  const { idCollezione } = await params;

  const collezione = await prisma.collezione.findUnique({
    where: { id: idCollezione },
    include: {
      analisi: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!collezione || collezione.utenteId !== sessione.utenteId) {
    notFound();
  }

  const etichettaTotaleAnalisi =
    collezione.analisi.length === 1 ? "1 analisi" : `${collezione.analisi.length} analisi`;

  return (
    <section className="py-8 pb-20">
      <div
        className="mx-auto px-6 max-md:px-4"
        style={{ maxWidth: "var(--container-max, 1100px)" }}
      >
        {/* Link di ritorno alla collezione */}
        <Link
          href="/collezione"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-600)] transition-colors mb-6"
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
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          La mia collezione
        </Link>

        {/* Intestazione pagina */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] font-bold text-2xl text-[var(--color-text)] leading-tight mb-1">
              {collezione.nome}
            </h1>
            {collezione.nomeScientifico && (
              <p className="text-base text-[var(--color-text-muted)] italic mb-3">
                {collezione.nomeScientifico}
              </p>
            )}
            <span className="text-sm font-medium text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-3 py-1 rounded-full">
              {etichettaTotaleAnalisi}
            </span>
          </div>
          <Link
            href={`/?collezioneId=${idCollezione}`}
            className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] font-semibold text-sm text-white bg-[var(--color-primary-600)] px-6 py-3 rounded-full transition-colors hover:bg-[var(--color-primary-500)] shrink-0"
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
            Nuova analisi
          </Link>
        </div>

        {collezione.analisi.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
            <p className="font-[family-name:var(--font-display)] font-semibold text-lg text-[var(--color-text)]">
              Nessuna analisi in questa collezione
            </p>
            <p className="text-[var(--color-text-muted)] max-w-sm mx-auto">
              Questa collezione non ha ancora analisi salvate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {collezione.analisi.map((analisi) => {
              if (!isPlantAnalysis(analisi.datiAnalisi)) return null;

              const datiValidati: PlantAnalysis = analisi.datiAnalisi;
              const salute = COLORI_SALUTE[datiValidati.statoSalute] ?? COLORI_SALUTE.good;
              const dataFormattata = new Date(analisi.createdAt).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <Link
                  key={analisi.id}
                  href={`/analysis?id=${analisi.id}`}
                  aria-label={`Apri analisi del ${dataFormattata}`}
                >
                  <article className="group rounded-2xl border border-[rgba(218,232,218,0.5)] bg-white/70 backdrop-blur-sm overflow-hidden transition-shadow hover:shadow-lg hover:shadow-[var(--color-primary-100)]/40">
                    {/* Foto con badge stato salute */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-primary-50)]">
                      <Image
                        src={analisi.urlFoto}
                        alt={datiValidati.nomeComune}
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

                    {/* Data analisi */}
                    <div className="p-4">
                      <time
                        dateTime={new Date(analisi.createdAt).toISOString()}
                        className="text-sm text-[var(--color-text-secondary)]"
                      >
                        {dataFormattata}
                      </time>
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
