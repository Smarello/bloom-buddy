import type { CareTip } from "@/types/analysis";

interface PropsCareTipsList {
  consigli: CareTip[];
}

const COLORE_PRIORITA: Record<CareTip["priorita"], string> = {
  alta: "var(--color-health-poor)",
  media: "var(--color-secondary-400)",
  bassa: "var(--color-health-good)",
};

const OMBRA_PRIORITA: Record<CareTip["priorita"], string> = {
  alta: "0 0 0 3px rgba(224, 96, 96, 0.15)",
  media: "0 0 0 3px rgba(212, 134, 78, 0.15)",
  bassa: "0 0 0 3px rgba(124, 179, 66, 0.15)",
};

const ETICHETTA_PRIORITA: Record<CareTip["priorita"], string> = {
  alta: "priorità alta",
  media: "priorità media",
  bassa: "priorità bassa",
};

export function CareTipsList({ consigli }: PropsCareTipsList) {
  if (consigli.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] py-4">
        Nessun consiglio disponibile.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4" role="list">
      {consigli.map((consiglio, indice) => (
        <li key={indice} className="flex gap-4 items-start">
          {/* Dot priorità */}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 mt-[5px]"
            style={{
              backgroundColor: COLORE_PRIORITA[consiglio.priorita],
              boxShadow: OMBRA_PRIORITA[consiglio.priorita],
            }}
            aria-label={ETICHETTA_PRIORITA[consiglio.priorita]}
          />
          <div className="flex-1 min-w-0">
            <p className="font-[family-name:var(--font-display)] font-semibold text-sm text-[var(--color-text-primary)] mb-0.5">
              {consiglio.titolo}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {consiglio.descrizione}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
