/**
 * Calcule le montant CEE selon la fiche standardisée (méthode détaillée)
 *
 * Cette fonction peut être utilisée pour un calcul plus précis basé sur les kWh cumac
 * Non utilisée dans le drawer pour simplifier l'UX, mais disponible pour des calculs avancés
 */

import { CEECategory } from './ceeData'

export const calculateCEEDetailed = (
  typePac: string,
  surfaceHabitable: number,
  zoneClimatique: string,
  category: CEECategory
): number => {
  // Facteurs de pondération selon zone climatique (fiche BAR-TH-104)
  const facteursZone: Record<string, number> = {
    H1: 1.2,
    H2: 1.0,
    H3: 0.8,
  }

  // kWh cumac de base pour PAC Air/Eau (simplifié)
  const kWhCumacBase = surfaceHabitable * 100 * (facteursZone[zoneClimatique] || 1.0)

  // Prix moyen du kWh cumac selon catégorie (en centimes d'€)
  const prixKWhCumac: Record<CEECategory, number> = {
    precaire: 0.012, // 1.2 centime
    modeste: 0.010, // 1.0 centime
    classique: 0.008, // 0.8 centime
    "non-eligible": 0,
  }

  const montantCalcule = kWhCumacBase * prixKWhCumac[category]

  // Les montants forfaitaires sont souvent plus avantageux
  return Math.round(montantCalcule)
}
