import { DEPARTMENT_TO_ZONE } from "@/app/(main)/[projectId]/lib/getClimateData/config/departmentToZone";
import type { ClimateZone } from "@/app/(main)/[projectId]/lib/getClimateData/types/climateZone";

/**
 * Détermine la zone climatique à partir du code postal
 *
 * @param codePostal - Code postal français (5 chiffres)
 * @returns La zone climatique correspondante ou H2a par défaut
 */
export const getClimateZoneFromPostalCode = (
  codePostal: string
): ClimateZone => {
  if (!codePostal || codePostal.length < 2) {
    console.warn(
      `Code postal invalide: ${codePostal}, utilisation de H2a par défaut`
    );
    return "H2a";
  }

  // Extraire le département (2 ou 3 premiers chiffres)
  let departement = codePostal.substring(0, 2);

  // Cas spéciaux Corse
  if (codePostal.startsWith("20")) {
    departement = parseInt(codePostal.substring(0, 3)) < 200 ? "2A" : "2B";
  }

  // DOM-TOM
  if (codePostal.startsWith("97") || codePostal.startsWith("98")) {
    departement = codePostal.substring(0, 3);
  }

  const zone = DEPARTMENT_TO_ZONE[departement];

  if (!zone) {
    console.warn(
      `Zone climatique non trouvée pour le département ${departement}, utilisation de H2a par défaut`
    );
    return "H2a";
  }

  return zone;
};
