import type { ProjectData } from "@/types/projectData";

/**
 * Calcule le coût VARIABLE annuel du chauffage actuel (énergie uniquement, sans coûts fixes)
 * @param data Données du projet
 * @returns Coût variable annuel en euros
 */
export const calculateCurrentVariableCost = (data: ProjectData): number => {
  switch (data.type_chauffage) {
    case "Fioul":
      return (data.conso_fioul_litres || 0) * (data.prix_fioul_litre || 0);

    case "Gaz":
      return (data.conso_gaz_kwh || 0) * (data.prix_gaz_kwh || 0);

    case "GPL":
      return (data.conso_gpl_kg || 0) * (data.prix_gpl_kg || 0);

    case "Pellets":
      return (data.conso_pellets_kg || 0) * (data.prix_pellets_kg || 0);

    case "Bois":
      return (data.conso_bois_steres || 0) * (data.prix_bois_stere || 0);

    case "Electrique":
      return (data.conso_elec_kwh || 0) * (data.prix_elec_kwh || 0);

    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return (data.conso_pac_kwh || 0) * (data.prix_elec_kwh || 0);

    default:
      return 0;
  }
}
