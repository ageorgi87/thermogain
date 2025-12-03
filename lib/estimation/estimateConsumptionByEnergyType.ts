import { estimateAnnualConsumption } from "./estimateAnnualConsumption"

interface HousingCharacteristics {
  surface_habitable: number
  annee_construction: number
  qualite_isolation: string
  nombre_occupants: number
  code_postal?: string
}

/**
 * Estime la consommation selon le type d'énergie (en unités spécifiques)
 */
export const estimateConsumptionByEnergyType = (
  housing: HousingCharacteristics,
  energyType: string
): { value: number; unit: string } => {
  const consommationKwh = estimateAnnualConsumption(housing)

  switch (energyType) {
    case "Fioul":
      // 1 litre de fioul ≈ 10 kWh
      return {
        value: Math.round(consommationKwh / 10),
        unit: "litres/an",
      }

    case "Gaz":
      // Le gaz est déjà en kWh
      return {
        value: Math.round(consommationKwh),
        unit: "kWh/an",
      }

    case "GPL":
      // 1 kg de GPL ≈ 12.8 kWh
      return {
        value: Math.round(consommationKwh / 12.8),
        unit: "kg/an",
      }

    case "Pellets":
      // 1 kg de pellets ≈ 4.8 kWh
      return {
        value: Math.round(consommationKwh / 4.8),
        unit: "kg/an",
      }

    case "Bois":
      // 1 stère ≈ 2000 kWh
      return {
        value: Math.round((consommationKwh / 2000) * 10) / 10, // Arrondi à 1 décimale
        unit: "stères/an",
      }

    case "Electrique":
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      // Pour les PAC existantes, on divise par le COP moyen (~2.5 pour anciennes PAC)
      if (energyType.startsWith("PAC")) {
        return {
          value: Math.round(consommationKwh / 2.5),
          unit: "kWh/an",
        }
      }
      // Électrique direct
      return {
        value: Math.round(consommationKwh),
        unit: "kWh/an",
      }

    default:
      return {
        value: Math.round(consommationKwh),
        unit: "kWh/an",
      }
  }
}
