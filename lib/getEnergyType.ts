import type { ProjectData } from "@/types/projectData";

/**
 * Retourne le type d'énergie pour l'API DIDO selon le type de chauffage
 * @param data Données du projet
 * @returns Type d'énergie ('gaz' | 'electricite' | 'fioul' | 'bois')
 */
export const getEnergyType = (
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
