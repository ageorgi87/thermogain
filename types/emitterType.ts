/**
 * Types d'émetteurs de chaleur pour les pompes à chaleur hydrauliques
 *
 * Les valeurs sont slugifiées pour faciliter le stockage en base de données
 * et la manipulation dans le code.
 */
export enum EmitterType {
  PLANCHER_CHAUFFANT = "plancher-chauffant",
  VENTILO_CONVECTEURS = "ventilo-convecteurs",
  RADIATEURS_BASSE_TEMP = "radiateurs-basse-temperature",
  RADIATEURS_MOYENNE_TEMP = "radiateurs-moyenne-temperature",
  RADIATEURS_HAUTE_TEMP = "radiateurs-haute-temperature",
}
