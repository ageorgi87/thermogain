import { prisma } from "@/lib/prisma"
import type { DefaultEnergyPrices } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/types/defaultEnergyPrices"
import { EnergyType } from "@/types/energyType"
import { ENERGY_CONVERSION_FACTORS } from "@/config/constants"
import { roundToDecimals } from "@/lib/utils/roundToDecimals"

/**
 * Coefficient multiplicateur GPL/Fioul
 * Le GPL est environ 39% plus cher que le fioul au kWh
 */
const GPL_TO_FIOUL_RATIO = 1.39

/**
 * Convertit le prix de l'API (€/kWh) vers l'unité appropriée selon le type d'énergie
 * Tous les prix sont arrondis à 3 décimales
 */
const convertPriceToUnit = (pricePerKwh: number, energyType: EnergyType): number => {
  switch (energyType) {
    case EnergyType.FIOUL:
      // Fioul: 9.96 kWh/litre → prix en €/litre
      return roundToDecimals(pricePerKwh * ENERGY_CONVERSION_FACTORS.FIOUL_KWH_PER_LITRE, 3)
    case EnergyType.GAZ:
      // Gaz: prix en €/kWh (pas de conversion)
      return roundToDecimals(pricePerKwh, 3)
    case EnergyType.GPL:
      // GPL: 12.8 kWh/kg → prix en €/kg
      return roundToDecimals(pricePerKwh * ENERGY_CONVERSION_FACTORS.GPL_KWH_PER_KG, 3)
    case EnergyType.BOIS:
      // Bois (granulés): 4.6 kWh/kg → prix en €/kg
      return roundToDecimals(pricePerKwh * ENERGY_CONVERSION_FACTORS.PELLETS_KWH_PER_KG, 3)
    case EnergyType.ELECTRICITE:
      // Électricité: prix en €/kWh (pas de conversion)
      return roundToDecimals(pricePerKwh, 3)
    default:
      return pricePerKwh
  }
}

/**
 * Récupère les prix par défaut de l'énergie depuis la DB
 * Ces prix sont utilisés comme valeurs par défaut dans le formulaire
 *
 * Les prix sont récupérés depuis la table energyPriceCache qui est rafraîchie
 * au step 1 (informations) par refreshEnergyPricesIfNeeded()
 *
 * @throws Error si les données ne sont pas en DB
 */
export const getDefaultEnergyPrices = async (): Promise<DefaultEnergyPrices> => {
  // Récupérer tous les prix depuis la DB
  const energyPrices = await prisma.energyPriceCache.findMany({
    where: {
      energyType: {
        in: [EnergyType.FIOUL, EnergyType.GAZ, EnergyType.BOIS, EnergyType.ELECTRICITE]
      }
    }
  })

  // Construire l'objet de prix avec conversion vers les bonnes unités
  const prices: Partial<DefaultEnergyPrices> = {}

  for (const energyData of energyPrices) {
    if (!energyData.currentPrice || energyData.currentPrice <= 0) {
      throw new Error(`Prix ${energyData.energyType} manquant ou invalide en DB`)
    }

    const convertedPrice = convertPriceToUnit(energyData.currentPrice, energyData.energyType as EnergyType)

    switch (energyData.energyType) {
      case EnergyType.FIOUL:
        prices.fioul = convertedPrice
        break
      case EnergyType.GAZ:
        prices.gaz = convertedPrice
        break
      case EnergyType.BOIS:
        prices.bois = convertedPrice
        break
      case EnergyType.ELECTRICITE:
        prices.electricite = convertedPrice
        break
    }
  }

  // Vérifier que toutes les énergies requises sont présentes
  if (!prices.fioul || !prices.gaz || !prices.bois || !prices.electricite) {
    throw new Error(`Données énergétiques incomplètes en DB`)
  }

  // GPL: calculé depuis le fioul (GPL ≈ 39% plus cher)
  const gpl = roundToDecimals(prices.fioul * GPL_TO_FIOUL_RATIO, 3)

  return {
    fioul: prices.fioul,
    gaz: prices.gaz,
    gpl,
    bois: prices.bois,
    electricite: prices.electricite,
  }
}
