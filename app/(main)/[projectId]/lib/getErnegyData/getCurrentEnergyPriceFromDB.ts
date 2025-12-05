"use server";

import { prisma } from "@/lib/prisma";
import { EnergyType } from "@/types/energyType";
import { ENERGY_CONVERSION_FACTORS } from "@/config/constants";
import { roundToDecimals } from "@/lib/utils/roundToDecimals";

/**
 * Coefficient multiplicateur GPL/Fioul
 * Le GPL est environ 39% plus cher que le fioul au kWh
 */
const GPL_TO_FIOUL_RATIO = 1.39;

/**
 * Convertit le prix de l'API (€/kWh) vers l'unité appropriée selon le type d'énergie
 * Tous les prix sont arrondis à 3 décimales
 */
const convertPriceToUnit = (pricePerKwh: number, energyType: EnergyType): number => {
  switch (energyType) {
    case EnergyType.FIOUL:
      // Fioul: 9.96 kWh/litre → prix en €/litre
      return roundToDecimals(pricePerKwh * ENERGY_CONVERSION_FACTORS.FIOUL_KWH_PER_LITRE, 3);
    case EnergyType.GAZ:
      // Gaz: prix en €/kWh (pas de conversion)
      return roundToDecimals(pricePerKwh, 3);
    case EnergyType.GPL:
      // GPL: 12.8 kWh/kg → prix en €/kg
      return roundToDecimals(pricePerKwh * ENERGY_CONVERSION_FACTORS.GPL_KWH_PER_KG, 3);
    case EnergyType.BOIS:
      // Bois (granulés): 4.6 kWh/kg → prix en €/kg
      return roundToDecimals(pricePerKwh * ENERGY_CONVERSION_FACTORS.PELLETS_KWH_PER_KG, 3);
    case EnergyType.ELECTRICITE:
      // Électricité: prix en €/kWh (pas de conversion)
      return roundToDecimals(pricePerKwh, 3);
    default:
      return pricePerKwh;
  }
};

/**
 * Récupère le prix actuel d'une énergie depuis la DB
 * Le prix est retourné dans l'unité appropriée (€/litre, €/kWh, €/kg)
 *
 * IMPORTANT: Cette fonction ne fait que lire la DB.
 * Les données sont rafraîchies au step 1 (informations) par refreshEnergyPricesIfNeeded().
 *
 * @param energyType Type d'énergie ('fioul', 'gaz', 'gpl', 'bois', 'electricite')
 * @returns Prix dans l'unité appropriée
 * @throws Error si les données ne sont pas en DB
 */
export const getCurrentEnergyPriceFromDB = async (
  energyType: EnergyType
): Promise<number> => {
  // GPL n'a pas de données directes, on utilise le fioul × 1.39
  if (energyType === EnergyType.GPL) {
    const fioulData = await prisma.energyPriceCache.findUnique({
      where: { energyType: EnergyType.FIOUL }
    });

    if (!fioulData || !fioulData.currentPrice || fioulData.currentPrice <= 0) {
      throw new Error(`Prix fioul manquant en DB (nécessaire pour calculer GPL)`);
    }

    const fioulPrice = convertPriceToUnit(fioulData.currentPrice, EnergyType.FIOUL);
    return roundToDecimals(fioulPrice * GPL_TO_FIOUL_RATIO, 3); // GPL ≈ 39% plus cher
  }

  // Pour les autres énergies, récupérer depuis la DB
  const energyData = await prisma.energyPriceCache.findUnique({
    where: { energyType }
  });

  if (!energyData || !energyData.currentPrice || energyData.currentPrice <= 0) {
    throw new Error(`Prix ${energyType} manquant en DB`);
  }

  return convertPriceToUnit(energyData.currentPrice, energyType);
};
