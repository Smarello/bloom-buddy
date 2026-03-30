"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PlantAnalysis, HealthStatus } from "@/types/analysis";
import { isPlantAnalysis } from "@/lib/collezione/validazione";
import { PulsanteEliminaAnalisi } from "@/components/pulsante-elimina-analisi";

const COLORI_SALUTE: Record<HealthStatus, { bg: string; testo: string; etichetta: string }> = {
  excellent: { bg: "bg-[var(--color-primary-50)]", testo: "text-[var(--color-primary-700)]", etichetta: "Ottima" },
  good: { bg: "bg-[var(--color-primary-50)]", testo: "text-[var(--color-primary-600)]", etichetta: "Buona" },
  fair: { bg: "bg-amber-100", testo: "text-amber-700", etichetta: "Discreta" },
  poor: { bg: "bg-red-100", testo: "text-red-700", etichetta: "Critica" },
};

interface AnalisiSerializzata {
  id: string;
  urlFoto: string;
  datiAnalisi: unknown;
  createdAt: string;
}

interface PropsGrigliaAnalisiCollezione {
  analisiIniziali: AnalisiSerializzata[];
}

export default function GrigliaAnalisiCollezione({
  analisiIniziali,
}: PropsGrigliaAnalisiCollezione) {
  const router = useRouter();
  const [listaAnalisi, setListaAnalisi] = useState(analisiIniziali);

  function rimuoviAnalisi(idAnalisi: string) {
    setListaAnalisi((precedente) =>
      precedente.filter((analisi) => analisi.id !== idAnalisi),
    );
    router.refresh();
  }

  if (listaAnalisi.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
        <p className="font-[family-name:var(--font-display)] font-semibold text-lg text-[var(--color-text)]">
          Nessuna analisi in questa collezione
        </p>
        <p className="text-[var(--color-text-muted)] max-w-sm mx-auto">
          Questa collezione non ha ancora analisi salvate.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {listaAnalisi.map((analisi) => {
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
            <article className="group relative rounded-2xl border border-[rgba(218,232,218,0.5)] bg-white/70 backdrop-blur-sm overflow-hidden transition-shadow hover:shadow-lg hover:shadow-[var(--color-primary-100)]/40">
              {/* Pulsante elimina analisi */}
              <PulsanteEliminaAnalisi
                idAnalisi={analisi.id}
                onEliminata={() => rimuoviAnalisi(analisi.id)}
              />

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
  );
}
