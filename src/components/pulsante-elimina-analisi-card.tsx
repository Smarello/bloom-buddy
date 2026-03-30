"use client";

import { PulsanteEliminaAnalisi } from "@/components/pulsante-elimina-analisi";

interface PropsPulsanteEliminaAnalisiCard {
  idAnalisi: string;
  onEliminata: () => void;
}

export default function PulsanteEliminaAnalisiCard({
  idAnalisi,
  onEliminata,
}: PropsPulsanteEliminaAnalisiCard) {
  return (
    <PulsanteEliminaAnalisi
      idAnalisi={idAnalisi}
      onEliminata={onEliminata}
      className="absolute top-2.5 left-2.5 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-black/30 text-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-red-600/80 hover:text-white hover:scale-110 focus-visible:bg-red-600/80 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
    />
  );
}
