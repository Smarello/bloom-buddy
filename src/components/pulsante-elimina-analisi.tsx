"use client";

import { useState } from "react";
import DialogoEliminaAnalisi from "@/components/dialogo-elimina-analisi";
import { IconaCestino } from "@/components/icone-eliminazione";

interface PropsPulsanteEliminaAnalisi {
  idAnalisi: string;
  onEliminata: () => void;
  className?: string;
}

export function PulsanteEliminaAnalisi({
  idAnalisi,
  onEliminata,
  className,
}: PropsPulsanteEliminaAnalisi) {
  const [dialogoAperto, setDialogoAperto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDialogoAperto(true);
        }}
        className={className ?? "inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0"}
        aria-label="Elimina analisi"
      >
        <IconaCestino />
      </button>

      <DialogoEliminaAnalisi
        idAnalisi={idAnalisi}
        aperto={dialogoAperto}
        onChiudi={() => setDialogoAperto(false)}
        onEliminata={onEliminata}
      />
    </>
  );
}
