import { redirect } from "next/navigation";
import { ottieniSessioneServer } from "@/lib/auth/sessione";
import { prisma } from "@/lib/db/client";
import { SchedaPiantaCollezione } from "@/components/scheda-pianta-collezione";
import type { PlantAnalysis } from "@/types/analysis";
import Link from "next/link";

function isPlantAnalysis(valore: unknown): valore is PlantAnalysis {
  return (
    typeof valore === "object" &&
    valore !== null &&
    typeof (valore as PlantAnalysis).nomeComune === "string" &&
    typeof (valore as PlantAnalysis).statoSalute === "string"
  );
}

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
            {analisiSalvate.map((analisi) => {
              if (!isPlantAnalysis(analisi.datiAnalisi)) return null;
              const datiValidati: PlantAnalysis = analisi.datiAnalisi;
              return (
                <SchedaPiantaCollezione
                  key={analisi.id}
                  urlFoto={analisi.urlFoto}
                  datiAnalisi={datiValidati}
                  dataSalvataggio={analisi.createdAt}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
