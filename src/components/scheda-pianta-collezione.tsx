import Image from "next/image";
import type { PlantAnalysis, HealthStatus } from "@/types/analysis";

interface PropsSchedaPiantaCollezione {
  urlFoto: string;
  datiAnalisi: PlantAnalysis;
  dataSalvataggio: Date;
}

const COLORI_SALUTE: Record<HealthStatus, { bg: string; testo: string; etichetta: string }> = {
  excellent: { bg: "bg-[var(--color-primary-50)]", testo: "text-[var(--color-primary-700)]", etichetta: "Ottima" },
  good: { bg: "bg-[var(--color-primary-50)]", testo: "text-[var(--color-primary-600)]", etichetta: "Buona" },
  fair: { bg: "bg-amber-100", testo: "text-amber-700", etichetta: "Discreta" },
  poor: { bg: "bg-red-100", testo: "text-red-700", etichetta: "Critica" },
};

export function SchedaPiantaCollezione({
  urlFoto,
  datiAnalisi,
  dataSalvataggio,
}: PropsSchedaPiantaCollezione) {
  const salute = COLORI_SALUTE[datiAnalisi.statoSalute] ?? COLORI_SALUTE.good;
  const dataFormattata = new Date(dataSalvataggio).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="group rounded-2xl border border-[rgba(218,232,218,0.5)] bg-white/70 backdrop-blur-sm overflow-hidden transition-shadow hover:shadow-lg hover:shadow-[var(--color-primary-100)]/40">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-primary-50)]">
        <Image
          src={urlFoto}
          alt={datiAnalisi.nomeComune}
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
          {datiAnalisi.nomeComune}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] italic mb-3">
          {datiAnalisi.nomeScientifico}
        </p>
        <time
          dateTime={new Date(dataSalvataggio).toISOString()}
          className="text-xs text-[var(--color-text-secondary)]"
        >
          {dataFormattata}
        </time>
      </div>
    </article>
  );
}
