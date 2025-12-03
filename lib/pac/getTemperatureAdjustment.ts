/**
 * Calcule le coefficient d'ajustement selon la température de départ
 * Plus la température est élevée, plus le COP diminue
 *
 * ⚠️ Ne s'applique QUE aux PAC avec circuit d'eau (Air/Eau, Eau/Eau)
 * Les PAC Air/Air n'ont pas de circuit d'eau donc ce facteur = 1.0
 *
 * Référence : Courbes de performance des PAC air/eau
 * - 35°C (plancher chauffant) : référence (1.0)
 * - 45°C (radiateurs BT) : -15%
 * - 55°C (radiateurs MT) : -25%
 * - 65°C (radiateurs HT) : -35%
 */
export const getTemperatureAdjustment = (temperatureDepart: number): number => {
  if (temperatureDepart <= 35) return 1.0      // Conditions optimales
  if (temperatureDepart <= 40) return 0.95     // Plancher + radiateurs BT
  if (temperatureDepart <= 45) return 0.85     // Radiateurs basse température
  if (temperatureDepart <= 50) return 0.80     // Radiateurs moyenne température (début)
  if (temperatureDepart <= 55) return 0.75     // Radiateurs moyenne température
  if (temperatureDepart <= 60) return 0.70     // Radiateurs haute température (début)
  return 0.65                                  // Radiateurs haute température
}
