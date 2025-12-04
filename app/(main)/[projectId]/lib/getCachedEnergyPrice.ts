"use server";

import { prisma } from "@/lib/prisma";
import { isCacheValid } from "@/app/(main)/[projectId]/lib/isCacheValid";
import { DATAFILE_RIDS } from "@/app/(main)/[projectId]/lib/didoConstants"
import { getDataFileRows } from "@/app/(main)/[projectId]/lib/getDataFileRows"

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
 * Récupère le prix actuel moyen d'une énergie depuis l'API DIDO
 * Le prix est calculé comme la moyenne des 12 derniers mois disponibles
 */
const fetchFromApi = async (energyType: string): Promise<number> => {
  // Valeurs par défaut (prix moyens en €/kWh)
  const defaultPrices: Record<string, number> = {
    fioul: 0.115,      // ~1.15 €/L / 10 kWh
    gaz: 0.10,         // 0.10 €/kWh
    gpl: 0.125,        // ~1.60 €/kg / 12.8 kWh
    bois: 0.055,       // ~100 €/stère / 1800 kWh
    electricite: 0.2516, // Tarif régulé moyen 2024
  }

  try {
    let rid: string
    let columnName: string

    switch (energyType) {
      case "fioul":
      case "gpl":
        rid = DATAFILE_RIDS.petroleum
        columnName = "PX_PETRO_FOD_100KWH_C1" // Prix pour 100 kWh
        break
      case "gaz":
        rid = DATAFILE_RIDS.gas
        columnName = "PX_GAZ_D_TTES_TRANCHES" // Prix pour 100 kWh
        break
      case "bois":
        rid = DATAFILE_RIDS.wood
        columnName = "PX_BOIS_GRANVRAC_100KWH" // Prix pour 100 kWh
        break
      case "electricite":
        rid = DATAFILE_RIDS.electricity
        columnName = "PX_ELE_D_TTES_TRANCHES" // Prix pour 100 kWh
        break
      default:
        return defaultPrices[energyType] || 0.20
    }

    // Récupérer les 12 derniers mois
    const rows = await getDataFileRows(rid, 12)

    if (rows.length === 0) {
      console.warn(`Pas de données disponibles pour ${energyType}, utilisation valeur par défaut`)
      return defaultPrices[energyType] || 0.20
    }

    // Extraire les prix et calculer la moyenne
    const prices: number[] = rows
      .map((row: any) => parseFloat(row[columnName]))
      .filter((price: number) => !isNaN(price) && price > 0)

    if (prices.length === 0) {
      console.warn(`Pas de prix valides pour ${energyType}, utilisation valeur par défaut`)
      return defaultPrices[energyType] || 0.20
    }

    // Calculer la moyenne des prix des 12 derniers mois
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length

    // Les prix dans l'API sont en €/100kWh, donc diviser par 100 pour avoir €/kWh
    const pricePerKwh = averagePrice / 100

    console.log(`Prix moyen ${energyType}: ${pricePerKwh.toFixed(4)} €/kWh`)

    // Arrondir à 4 décimales
    return Math.round(pricePerKwh * 10000) / 10000
  } catch (error) {
    console.error(`Erreur lors de la récupération du prix pour ${energyType}:`, error)
    return defaultPrices[energyType] || 0.20
  }
}

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
