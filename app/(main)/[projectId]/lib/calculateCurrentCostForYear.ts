import type { ProjectData } from "@/types/projectData";
import { calculateCurrentVariableCost } from "@/app/(main)/[projectId]/lib/calculateCurrentVariableCost";
import { calculateCurrentFixedCosts } from "@/app/(main)/[projectId]/lib/calculateCurrentFixedCosts";
import { getEnergyModelSync } from "@/app/(main)/[projectId]/lib/getEnergyModelSync";
import { calculateCostForYear } from "@/app/(main)/[projectId]/lib/calculateCostForYear";

interface CalculateCurrentCostForYearParams {
  data: ProjectData;
  year: number;
}

/**
 * Retourne le type d'énergie pour l'API DIDO selon le type de chauffage
 * @param data Données du projet
 * @returns Type d'énergie ('gaz' | 'electricite' | 'fioul' | 'bois')
 */
const getEnergyType = (
  data: ProjectData
): "gaz" | "electricite" | "fioul" | "bois" => {
  switch (data.type_chauffage) {
    case "Fioul":
    case "GPL":
      return "fioul";

    case "Gaz":
      return "gaz";

    case "Pellets":
    case "Bois":
      return "bois";

    case "Electrique":
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return "electricite";

    default:
      return "gaz"; // Fallback
  }
}

/**
 * Calcule le coût du chauffage actuel pour une année donnée
 *
 * NOUVEAU (Décembre 2024): Utilise le modèle Mean Reversion basé sur l'historique
 * complet de l'API DIDO-SDES (18-42 ans de données selon l'énergie) au lieu d'un
 * taux linéaire constant.
 *
 * Le modèle applique pour chaque type d'énergie:
 * - Gaz: Taux récent 8,7% → Équilibre 3,5% (transition 5 ans)
 * - Électricité: Taux récent 6,9% → Équilibre 2,5% (transition 5 ans)
 * - Fioul: Taux récent 7,2% → Équilibre 2,5% (transition 5 ans)
 * - Bois: Taux récent 3,4% → Équilibre 2,0% (transition 5 ans)
 *
 * IMPORTANT: Seuls les coûts VARIABLES (énergie) évoluent avec le temps.
 * Les coûts FIXES (abonnements, entretien) restent constants en euros constants.
 *
 * @param params.data Données du projet
 * @param params.year Année de projection (0 = année actuelle)
 * @returns Coût projeté en euros
 */
export const calculateCurrentCostForYear = async ({
  data,
  year,
}: CalculateCurrentCostForYearParams): Promise<number> => {
  // Coûts variables: évoluent avec le modèle Mean Reversion
  const variableCost = calculateCurrentVariableCost(data);
  const fixedCosts = calculateCurrentFixedCosts(data);

  // Récupérer le modèle Mean Reversion selon le type d'énergie depuis la DB
  const energyType = getEnergyType(data);
  const model = await getEnergyModelSync(energyType);

  // Utiliser la fonction de calcul qui applique le modèle Mean Reversion
  return calculateCostForYear(variableCost, fixedCosts.total, year, model);
};
