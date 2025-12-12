import type { ProjectData } from "@/types/projectData";
import { ClasseDPE } from "@/types/dpe";
import { DPE_ENERGY_CONSUMPTION_KWH_M2, ECS_ESTIMATION } from "@/config/constants";
import { getCurrentConsumptionKwh } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/energyDataExtractors";

/**
 * Interface pour les détails du calcul des besoins énergétiques
 */
export interface EnergyNeedsDetails {
  /** Consommation réelle déclarée (convertie en kWh) */
  actualConsumptionKwh: number;
  /** Besoins théoriques selon DPE (kWh) */
  dpeTheoreticalNeedsKwh: number;
  /** Besoins finaux retenus (moyenne des deux) */
  finalEnergyNeedsKwh: number;
  /** Classe DPE utilisée */
  dpeClass: string | null;
  /** Surface utilisée pour le calcul */
  surfaceM2: number | null;
}

/**
 * Calcule les besoins énergétiques en combinant consommation réelle et DPE théorique
 *
 * Méthode: Moyenne (50/50) entre consommation réelle et besoins DPE
 *
 * Cette approche équilibrée:
 * - Tient compte de l'usage réel actuel du client
 * - Anticipe un confort optimal après installation PAC
 * - Évite les projections trop optimistes (sous-estimation) ou pessimistes (surestimation)
 *
 * @param data - Données du projet
 * @param dpeClass - Classe DPE du logement
 * @param surfaceM2 - Surface habitable en m²
 * @returns Objet détaillé avec tous les calculs
 *
 * Exemples:
 *
 * 1. Client chauffe peu (précarité énergétique):
 *    - Conso réelle: 15 000 kWh
 *    - DPE E (100m²): 29 000 kWh
 *    - Moyenne: 22 000 kWh ← Anticipe amélioration confort avec PAC
 *
 * 2. Client chauffe normalement:
 *    - Conso réelle: 25 000 kWh
 *    - DPE E (100m²): 29 000 kWh
 *    - Moyenne: 27 000 kWh ← Légère hausse pour confort optimal
 *
 * 3. DPE manquant ou surface inconnue:
 *    - Fallback: Utilise uniquement la consommation réelle
 */
export const calculateEnergyNeedsWithDPE = (
  data: ProjectData,
  dpeClass: ClasseDPE | string | null | undefined,
  surfaceM2: number | null | undefined
): EnergyNeedsDetails => {
  // 1. Calculer la consommation réelle (convertie en kWh)
  let actualConsumptionKwh = getCurrentConsumptionKwh(data, true);

  // 2. Si ECS séparée, ajouter l'ECS à la consommation réelle pour cohérence avec DPE
  // Le DPE inclut TOUJOURS chauffage + ECS + tout
  // Donc si la conso déclarée n'inclut PAS l'ECS, on doit l'ajouter avant la moyenne
  if (!data.ecs_integrated) {
    // Utiliser la consommation ECS déclarée si disponible, sinon estimation ADEME
    const nombreOccupants = data.nombre_occupants || 4;
    const ecsKwh = data.conso_ecs_kwh || (nombreOccupants * ECS_ESTIMATION.KWH_PER_PERSON_PER_YEAR);
    actualConsumptionKwh += ecsKwh;
  }

  // 3. Calculer les besoins théoriques DPE (si données disponibles)
  let dpeTheoreticalNeedsKwh: number | null = null;
  let finalEnergyNeedsKwh: number;

  if (dpeClass && surfaceM2) {
    // Données DPE complètes : calculer les besoins théoriques
    // Formule: Besoins (kWh/an) = Surface (m²) × Consommation DPE (kWh/m²/an)
    const consumption = DPE_ENERGY_CONSUMPTION_KWH_M2[dpeClass as ClasseDPE];
    dpeTheoreticalNeedsKwh = surfaceM2 * consumption;

    // 4. Moyenne 50/50 entre consommation réelle (+ ECS si séparée) et besoins DPE
    // Maintenant on compare bien des "pommes avec des pommes" (chauffage+ECS des deux côtés)
    finalEnergyNeedsKwh = (actualConsumptionKwh + dpeTheoreticalNeedsKwh) / 2;
  } else {
    // 4. Fallback: Utiliser uniquement la consommation réelle (+ ECS si séparée)
    finalEnergyNeedsKwh = actualConsumptionKwh;
  }

  return {
    actualConsumptionKwh: Math.round(actualConsumptionKwh),
    dpeTheoreticalNeedsKwh: dpeTheoreticalNeedsKwh !== null ? Math.round(dpeTheoreticalNeedsKwh) : 0,
    finalEnergyNeedsKwh: Math.round(finalEnergyNeedsKwh),
    dpeClass: dpeClass || null,
    surfaceM2: surfaceM2 || null,
  };
};
