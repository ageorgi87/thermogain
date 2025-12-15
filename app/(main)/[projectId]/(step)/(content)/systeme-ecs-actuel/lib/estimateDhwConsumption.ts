import { ECS_ESTIMATION } from "@/config/constants"

/**
 * Estime la consommation annuelle d'ECS basée sur le nombre d'occupants
 *
 * Formule : 800 kWh par personne et par an
 * Source : ADEME (Agence de la transition écologique)
 *
 * Cette estimation correspond au besoin en énergie pour chauffer l'eau
 * de 15°C à 60°C pour un usage domestique moyen.
 *
 * @param nombreOccupants - Nombre de personnes dans le logement
 * @returns Consommation estimée en kWh/an
 */
export const estimateDhwConsumption = (nombreOccupants: number): number => {
  return nombreOccupants * ECS_ESTIMATION.KWH_PER_PERSON_PER_YEAR
}
