"use client";

import { useState } from "react";
import DialogoEliminaCollezione from "@/components/dialogo-elimina-collezione";
import { IconaCestinoContorno } from "@/components/icone-eliminazione";

interface PropsPulsanteEliminaCollezione {
  idCollezione: string;
  nomeCollezione: string;
  numeroAnalisi: number;
}

export default function PulsanteEliminaCollezione({
  idCollezione,
  nomeCollezione,
  numeroAnalisi,
}: PropsPulsanteEliminaCollezione) {
  const [dialogoAperto, setDialogoAperto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogoAperto(true)}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-border-light)] text-[var(--color-text-muted)] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0"
        aria-label="Elimina collezione"
      >
        <IconaCestinoContorno />
      </button>

      <DialogoEliminaCollezione
        idCollezione={idCollezione}
        nomeCollezione={nomeCollezione}
        numeroAnalisi={numeroAnalisi}
        aperto={dialogoAperto}
        onChiudi={() => setDialogoAperto(false)}
      />
    </>
  );
}
