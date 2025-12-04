import type { ProjectData } from "@/types/projectData";
import { ENERGY_CONVERSION_FACTORS } from "@/config/constants";

/**
 * Calcule la consommation énergétique annuelle actuelle en kWh
 * Convertit toutes les énergies en kWh pour le calcul PAC
 * @param data Données du projet
 * @returns Consommation en kWh
 */
const calculateCurrentConsumptionKwh = (data: ProjectData): number => {
  switch (data.type_chauffage) {
    case "Fioul":
      // 1 litre de fioul = 9.96 kWh PCI (Pouvoir Calorifique Inférieur)
      // Source: Standards européens, ADEME
      return (
        (data.conso_fioul_litres || 0) *
        ENERGY_CONVERSION_FACTORS.FIOUL_KWH_PER_LITRE
      );

    case "Gaz":
      return data.conso_gaz_kwh || 0;

    case "GPL":
      // 1 kg de GPL (propane) = 12.8 kWh PCI
      // Source: Standards européens
      return (
        (data.conso_gpl_kg || 0) * ENERGY_CONVERSION_FACTORS.GPL_KWH_PER_KG
      );

    case "Pellets":
      // 1 kg de pellets = 4.6 kWh PCI (avec taux humidité < 10%)
      // Source: Standards européens, ADEME
      return (
        (data.conso_pellets_kg || 0) *
        ENERGY_CONVERSION_FACTORS.PELLETS_KWH_PER_KG
      );

    case "Bois":
      // 1 stère de bois sec (20-25% humidité) = 1800 kWh
      // Note: Valeur variable selon essence et humidité
      return (
        (data.conso_bois_steres || 0) *
        ENERGY_CONVERSION_FACTORS.BOIS_KWH_PER_STERE
      );

    case "Electrique":
      return data.conso_elec_kwh || 0;

    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      // Si déjà une PAC, on utilise la consommation actuelle * COP actuel pour retrouver les besoins
      return (data.conso_pac_kwh || 0) * (data.cop_actuel || 1);

    default:
      return 0;
  }
}

/**
 * Calcule la consommation électrique annuelle de la PAC
 * Formule: Consommation PAC = Besoins énergétiques / COP ajusté
 * @param data Données du projet (avec cop_ajuste déjà calculé)
 * @returns Consommation PAC en kWh
 */
export const calculatePacConsumptionKwh = (data: ProjectData): number => {
  const currentConsumptionKwh = calculateCurrentConsumptionKwh(data);
  return currentConsumptionKwh / data.cop_ajuste;
}
