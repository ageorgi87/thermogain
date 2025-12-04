import { prisma } from "@/lib/prisma"
import type { DefaultEnergyPrices } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/types/defaultEnergyPrices"

/**
 * Convertit le prix de l'API (€/kWh) vers l'unité appropriée selon le type d'énergie
 */
const convertPriceToUnit = (pricePerKwh: number, energyType: string): number => {
  switch (energyType) {
    case "fioul":
      // Fioul: 10 kWh/litre → prix en €/litre
      return Math.round(pricePerKwh * 10 * 1000) / 1000 // Arrondir à 3 décimales
    case "gaz":
      // Gaz: prix en €/kWh
      return Math.round(pricePerKwh * 10000) / 10000 // Arrondir à 4 décimales
    case "gpl":
      // GPL: 12.8 kWh/kg → prix en €/kg
      return Math.round(pricePerKwh * 12.8 * 1000) / 1000 // Arrondir à 3 décimales
    case "bois":
      // Bois (granulés): 4.8 kWh/kg → prix en €/kg
      return Math.round(pricePerKwh * 4.8 * 1000) / 1000 // Arrondir à 3 décimales
    case "electricite":
      // Électricité: prix en €/kWh
      return Math.round(pricePerKwh * 10000) / 10000 // Arrondir à 4 décimales
    default:
      return pricePerKwh
  }
}

/**
 * Récupère les prix par défaut de l'énergie depuis la DB
 * Ces prix sont utilisés comme valeurs par défaut dans le formulaire
 *
 * Les prix sont récupérés depuis la table energyPriceCache qui est mise à jour
 * mensuellement par getOrRefreshEnergyModel()
 *
 * @throws Error si les données ne sont pas en DB
 */
export const getDefaultEnergyPrices = async (): Promise<DefaultEnergyPrices> => {
  // Récupérer tous les prix depuis la DB
  const energyPrices = await prisma.energyPriceCache.findMany({
    where: {
      energyType: {
        in: ["fioul", "gaz", "bois", "electricite"]
      }
    }
  })

  // Construire l'objet de prix avec conversion vers les bonnes unités
  const prices: Partial<DefaultEnergyPrices> = {}

  for (const energyData of energyPrices) {
    if (!energyData.currentPrice || energyData.currentPrice <= 0) {
      throw new Error(`Prix ${energyData.energyType} manquant ou invalide en DB`)
    }

    const convertedPrice = convertPriceToUnit(energyData.currentPrice, energyData.energyType)

    switch (energyData.energyType) {
      case "fioul":
        prices.fioul = convertedPrice
        break
      case "gaz":
        prices.gaz = convertedPrice
        break
      case "bois":
        prices.bois = convertedPrice
        break
      case "electricite":
        prices.electricite = convertedPrice
        break
    }
  }

  // Vérifier que toutes les énergies requises sont présentes
  if (!prices.fioul || !prices.gaz || !prices.bois || !prices.electricite) {
    throw new Error(`Données énergétiques incomplètes en DB`)
  }

  // GPL: calculé depuis le fioul
  const gpl = Math.round(prices.fioul * 1.39 * 1000) / 1000 // GPL ≈ 39% plus cher que le fioul

  return {
    fioul: prices.fioul,
    gaz: prices.gaz,
    gpl,
    bois: prices.bois,
    electricite: prices.electricite,
  }
}
