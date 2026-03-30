import { redirect, notFound } from "next/navigation";
import { ottieniSessioneServer } from "@/lib/auth/sessione";
import { prisma } from "@/lib/db/client";
import Link from "next/link";
import IntestazioneCollezione from "@/components/intestazione-collezione";
import GrigliaAnalisiCollezione from "@/components/griglia-analisi-collezione";
import PulsanteEliminaCollezione from "@/components/pulsante-elimina-collezione";

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
            <IntestazioneCollezione
              idCollezione={idCollezione}
              nome={collezione.nome}
              nomeScientifico={collezione.nomeScientifico}
            />
            <span className="text-sm font-medium text-[var(--color-primary-600)] bg-[var(--color-primary-50)] px-3 py-1 rounded-full">
              {etichettaTotaleAnalisi}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/?collezioneId=${idCollezione}`}
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
              Nuova analisi
            </Link>
            <PulsanteEliminaCollezione
              idCollezione={idCollezione}
              nomeCollezione={collezione.nome}
              numeroAnalisi={collezione.analisi.length}
            />
          </div>
        </div>

        <GrigliaAnalisiCollezione
          analisiIniziali={collezione.analisi.map((analisi) => ({
            id: analisi.id,
            urlFoto: analisi.urlFoto,
            datiAnalisi: analisi.datiAnalisi,
            createdAt: analisi.createdAt.toISOString(),
          }))}
        />
      </div>
    </section>
  );
}
