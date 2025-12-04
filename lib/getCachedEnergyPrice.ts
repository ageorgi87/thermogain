"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentEnergyPrice as fetchFromApi } from "@/lib/getCurrentEnergyPrice";
import { isCacheValid } from "@/lib/isCacheValid";
import { convertPriceToUnit } from "@/lib/convertPriceToUnit";

/**
 * Récupère le prix actuel d'une énergie depuis le cache ou l'API DIDO
 * Le cache est valide pour le mois en cours, sinon l'API est appelée
 *
 * @param energyType - Type d'énergie: "fioul", "gaz", "gpl", "bois", "electricite"
 * @returns Le prix dans l'unité appropriée (€/litre, €/kWh, €/kg, etc.)
 */
export const getCachedEnergyPrice = async (
  energyType: string
): Promise<number> => {
  try {
    // Rechercher le prix en cache
    const cached = await prisma.energyPriceCache.findUnique({
      where: { energyType },
    });

    // Si le cache existe et est valide (du mois en cours), le retourner
    if (cached && isCacheValid(cached.lastUpdated) && cached.currentPrice > 0) {
      return cached.currentPrice;
    }

    // Sinon, récupérer le prix depuis l'API DIDO
    const pricePerKwh = await fetchFromApi(energyType);

    // Convertir le prix vers l'unité appropriée
    const currentPrice = convertPriceToUnit(pricePerKwh, energyType);

    // Mettre à jour ou créer l'entrée en cache
    await prisma.energyPriceCache.upsert({
      where: { energyType },
      create: {
        energyType,
        currentPrice,
        tauxRecent: 0, // Sera mis à jour par getOrRefreshEnergyModel
        tauxEquilibre: 0, // Sera mis à jour par getOrRefreshEnergyModel
        anneesTransition: 5,
        lastUpdated: new Date(),
      },
      update: {
        currentPrice,
        lastUpdated: new Date(),
      },
    });

    return currentPrice;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du prix pour ${energyType}:`,
      error
    );

    // En cas d'erreur, essayer de récupérer la donnée la plus récente en DB
    try {
      const mostRecent = await prisma.energyPriceCache.findFirst({
        where: { energyType },
        orderBy: { lastUpdated: "desc" },
      });

      if (mostRecent && mostRecent.currentPrice > 0) {
        return mostRecent.currentPrice;
      }
    } catch (dbError) {
      console.error(
        `Erreur lors de la lecture de la DB pour ${energyType}:`,
        dbError
      );
    }

    // Si la DB est vide ou inaccessible, utiliser les valeurs par défaut
    console.warn(`⚠️ Utilisation des valeurs par défaut pour ${energyType}`);
    const defaultPrices: Record<string, number> = {
      fioul: 1.15, // €/litre
      gaz: 0.1, // €/kWh
      gpl: 1.6, // €/kg
      bois: 0.26, // €/kg (pellets)
      electricite: 0.2516, // €/kWh
    };

    return defaultPrices[energyType] || 0.2;
  }
};
