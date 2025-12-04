"use server";

import { prisma } from "@/lib/prisma";

/**
 * Convertit le prix de l'API (€/kWh) vers l'unité appropriée selon le type d'énergie
 */
const convertPriceToUnit = (pricePerKwh: number, energyType: string): number => {
  switch (energyType) {
    case "fioul":
      // Fioul: 10 kWh/litre → prix en €/litre
      return Math.round(pricePerKwh * 10 * 1000) / 1000;
    case "gaz":
      // Gaz: prix en €/kWh
      return Math.round(pricePerKwh * 10000) / 10000;
    case "gpl":
      // GPL: 12.8 kWh/kg → prix en €/kg
      return Math.round(pricePerKwh * 12.8 * 1000) / 1000;
    case "bois":
      // Bois (granulés): 4.8 kWh/kg → prix en €/kg
      return Math.round(pricePerKwh * 4.8 * 1000) / 1000;
    case "electricite":
      // Électricité: prix en €/kWh
      return Math.round(pricePerKwh * 10000) / 10000;
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
export const getEnergyPriceFromDB = async (
  energyType: "fioul" | "gaz" | "gpl" | "bois" | "electricite"
): Promise<number> => {
  // GPL n'a pas de données directes, on utilise le fioul × 1.39
  if (energyType === "gpl") {
    const fioulData = await prisma.energyPriceCache.findUnique({
      where: { energyType: "fioul" }
    });

    if (!fioulData || !fioulData.currentPrice || fioulData.currentPrice <= 0) {
      throw new Error(`Prix fioul manquant en DB (nécessaire pour calculer GPL)`);
    }

    const fioulPrice = convertPriceToUnit(fioulData.currentPrice, "fioul");
    return Math.round(fioulPrice * 1.39 * 1000) / 1000; // GPL ≈ 39% plus cher
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
