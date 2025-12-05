import { ClasseDPE } from "@/types/dpe";
import { QualiteIsolation } from "@/types/isolation";

/**
 * Estime la classe DPE (Diagnostic de Performance Énergétique) d'un logement
 *
 * Utilise les données disponibles pour estimer la performance énergétique:
 * - Année de construction
 * - Qualité de l'isolation
 * - Surface habitable
 * - Consommation énergétique (si disponible)
 *
 * Barèmes DPE (kWh/m²/an - énergie primaire):
 * - A: ≤ 50
 * - B: 51 à 90
 * - C: 91 à 150
 * - D: 151 à 230
 * - E: 231 à 330
 * - F: 331 à 450
 * - G: > 450
 */

interface EstimateDPEParams {
  annee_construction: number;
  qualite_isolation: QualiteIsolation;
  surface_habitable: number;
  conso_annuelle_kwh?: number; // Consommation annuelle si connue
}

/**
 * Estime la classe DPE d'un logement
 */
export const estimateDPE = ({
  annee_construction,
  qualite_isolation,
  surface_habitable,
  conso_annuelle_kwh,
}: EstimateDPEParams): ClasseDPE => {
  // Si on a la consommation réelle, on calcule directement le DPE
  if (conso_annuelle_kwh !== undefined && conso_annuelle_kwh > 0) {
    const conso_m2 = conso_annuelle_kwh / surface_habitable;
    return getDPEFromConsumption(conso_m2);
  }

  // Sinon, on estime selon l'année de construction et l'isolation
  return estimateDPEFromCharacteristics(annee_construction, qualite_isolation);
};

/**
 * Détermine la classe DPE à partir de la consommation par m²
 */
const getDPEFromConsumption = (conso_kwh_m2: number): ClasseDPE => {
  if (conso_kwh_m2 <= 50) return ClasseDPE.A;
  if (conso_kwh_m2 <= 90) return ClasseDPE.B;
  if (conso_kwh_m2 <= 150) return ClasseDPE.C;
  if (conso_kwh_m2 <= 230) return ClasseDPE.D;
  if (conso_kwh_m2 <= 330) return ClasseDPE.E;
  if (conso_kwh_m2 <= 450) return ClasseDPE.F;
  return ClasseDPE.G;
};

/**
 * Estime le DPE à partir des caractéristiques du logement
 * Basé sur des statistiques moyennes françaises
 */
const estimateDPEFromCharacteristics = (
  annee_construction: number,
  qualite_isolation: QualiteIsolation
): ClasseDPE => {
  // Consommation moyenne estimée selon l'année de construction (kWh/m²/an)
  let conso_base: number;

  if (annee_construction >= 2013) {
    // RT 2012 et après
    conso_base = 60;
  } else if (annee_construction >= 2006) {
    // RT 2005
    conso_base = 120;
  } else if (annee_construction >= 2001) {
    // RT 2000
    conso_base = 180;
  } else if (annee_construction >= 1989) {
    // RT 1988
    conso_base = 250;
  } else if (annee_construction >= 1975) {
    // RT 1974 (premier choc pétrolier)
    conso_base = 320;
  } else {
    // Avant 1975 - pas de réglementation thermique
    conso_base = 400;
  }

  // Ajustement selon la qualité de l'isolation
  let facteur_isolation: number;
  switch (qualite_isolation) {
    case QualiteIsolation.Bonne:
      facteur_isolation = 0.7; // -30% de consommation
      break;
    case QualiteIsolation.Moyenne:
      facteur_isolation = 1.0; // consommation de base
      break;
    case QualiteIsolation.Mauvaise:
      facteur_isolation = 1.3; // +30% de consommation
      break;
  }

  const conso_estimee = conso_base * facteur_isolation;

  return getDPEFromConsumption(conso_estimee);
};
