import { prisma } from "@/lib/db/client";
import type { PlantAnalysis } from "@/types/analysis";

export function isPlantAnalysis(valore: unknown): valore is PlantAnalysis {
  return (
    typeof valore === "object" &&
    valore !== null &&
    typeof (valore as PlantAnalysis).nomeComune === "string" &&
    typeof (valore as PlantAnalysis).statoSalute === "string"
  );
}

export async function recuperaAnalisiPerPianta(utenteId: string, nomePianta: string) {
  const tutteLeAnalisi = await prisma.analisi.findMany({
    where: { utenteId },
    orderBy: { createdAt: "desc" },
  });

  return tutteLeAnalisi.filter(
    (analisi) => {
      if (!isPlantAnalysis(analisi.datiAnalisi)) return false;
      return analisi.datiAnalisi.nomeComune.toLowerCase() === nomePianta.toLowerCase();
    }
  );
}
