import { EMITTER_WATER_TEMPERATURE } from "@/config/constants";

/**
 * Retourne la température de départ standard selon le type d'émetteur
 *
 * Cette fonction élimine la redondance entre "type d'émetteur" et "température de départ"
 * car ces deux valeurs sont fortement corrélées dans la pratique.
 *
 * Les températures sont définies dans config/constants.ts (source unique de vérité)
 *
 * @param typeEmetteurs - Type d'émetteur de chaleur installé
 * @returns Température de départ en °C
 */
export const getTemperatureFromEmitterType = (typeEmetteurs: string): number => {
  switch (typeEmetteurs) {
    case "Plancher chauffant":
      return EMITTER_WATER_TEMPERATURE.PLANCHER_CHAUFFANT;

    case "Radiateurs basse température":
      return EMITTER_WATER_TEMPERATURE.RADIATEURS_BASSE_TEMP;

    case "Ventilo-convecteurs":
      return EMITTER_WATER_TEMPERATURE.VENTILO_CONVECTEURS;

    case "Radiateurs moyenne température":
      return EMITTER_WATER_TEMPERATURE.RADIATEURS_MOYENNE_TEMP;

    case "Radiateurs haute température":
      return EMITTER_WATER_TEMPERATURE.RADIATEURS_HAUTE_TEMP;

    default:
      // Valeur par défaut conservatrice (radiateurs BT)
      // Correspond au cas d'usage le plus courant pour PAC neuves
      return EMITTER_WATER_TEMPERATURE.RADIATEURS_BASSE_TEMP;
  }
};
