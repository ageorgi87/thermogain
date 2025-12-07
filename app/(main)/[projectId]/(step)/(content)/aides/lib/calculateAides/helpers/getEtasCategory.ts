/**
 * Convertit le COP en catégorie Etas pour l'API Mes Aides Réno
 *
 * L'Etas (Efficacité énergétique saisonnière) est calculé à partir du COP nominal.
 * Formule : Etas (%) = COP × 40
 *
 * @param cop_estime - COP nominal du fabricant
 * @returns Catégorie Etas au format attendu par l'API Publicodes
 *
 * Catégories :
 * - COP < 2.78  → Etas < 111%  → Non éligible CEE (erreur)
 * - COP 2.78-3.15 → Etas 111-126% → "'entre 111 et 126 %'"
 * - COP 3.15-5.0  → Etas 126-200% → "'entre 126 et 200 %'"
 * - COP > 5.0     → Etas > 200%   → "'supérieur à 200 %'"
 */
export const getEtasCategory = (cop_estime: number): string => {
  // Calcul Etas (%) = COP × 40
  const etas = cop_estime * 40;

  // Déterminer la catégorie
  if (etas < 111) {
    // Retourner la catégorie la plus basse si en dessous du seuil
    // L'API déterminera l'inéligibilité
    return "'entre 111 et 126 %'";
  } else if (etas >= 111 && etas < 126) {
    return "'entre 111 et 126 %'";
  } else if (etas >= 126 && etas < 200) {
    return "'entre 126 et 200 %'";
  } else {
    // etas >= 200
    return "'supérieur à 200 %'";
  }
};
