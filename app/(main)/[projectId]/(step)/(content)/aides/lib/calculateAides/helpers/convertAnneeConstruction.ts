/**
 * Convertit l'année de construction en période Publicodes
 *
 * @param annee - Année de construction du logement
 * @returns Période au format attendu par l'API Mes Aides Réno
 *
 * Valeurs possibles:
 * - "moins de 2 ans"
 * - "de 2 à 10 ans"
 * - "de 10 à 15 ans"
 * - "au moins 15 ans"
 */
export const convertAnneeConstruction = (annee?: number): string => {
  if (!annee) return "au moins 15 ans";

  const age = new Date().getFullYear() - annee;

  if (age < 2) return "moins de 2 ans";
  if (age < 10) return "de 2 à 10 ans";
  if (age < 15) return "de 10 à 15 ans";

  return "au moins 15 ans";
};
