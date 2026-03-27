import type { PlantAnalysis } from "@/types/analysis";

export function isPlantAnalysis(valore: unknown): valore is PlantAnalysis {
  return (
    typeof valore === "object" &&
    valore !== null &&
    typeof (valore as PlantAnalysis).nomeComune === "string" &&
    typeof (valore as PlantAnalysis).statoSalute === "string"
  );
}
