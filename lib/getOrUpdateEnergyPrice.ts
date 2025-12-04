"use server";

import { prisma } from "@/lib/prisma";
import { isCacheValid } from "@/lib/isCacheValid";
import { DATAFILE_RIDS } from "@/lib/didoConstants";
import { calculateEnergyEvolution10y } from "@/lib/calculateEnergyEvolution10y";

/**
 * Récupère l'évolution sur 10 ans pour un type d'énergie spécifique
 * Utilisé par le système de cache pour mettre à jour les prix
 */
const getEnergyEvolution10y = async (
  energyType: string
): Promise<number> => {
  const defaultEvolution = 3; // 3% par an par défaut

  try {
    switch (energyType) {
      case "fioul":
      case "gpl":
        return await calculateEnergyEvolution10y(
          DATAFILE_RIDS.petroleum,
          "PX_PETRO_FOD_100KWH_C1"
        );
      case "gaz":
        return await calculateEnergyEvolution10y(
          DATAFILE_RIDS.gas,
          "PX_GAZ_D_TTES_TRANCHES"
        );
      case "bois":
        return await calculateEnergyEvolution10y(
          DATAFILE_RIDS.wood,
          "PX_BOIS_GRANVRAC_100KWH"
        );
      case "electricite":
        return await calculateEnergyEvolution10y(
          DATAFILE_RIDS.electricity,
          "PX_ELE_D_TTES_TRANCHES"
        );
      default:
        return defaultEvolution;
    }
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'évolution pour ${energyType}:`,
      error
    );
    return defaultEvolution;
  }
};

/**
 * Récupère ou met à jour les données d'évolution de prix pour un type d'énergie
 * Utilise le cache si les données datent du mois en cours, sinon interroge l'API
 * Retourne le taux récent (anciennement evolution_10y)
 */
export const getOrUpdateEnergyPrice = async (
  energyType: string
): Promise<{
  evolution_10y: number;
  fromCache: boolean;
}> => {
  try {
    // Chercher dans le cache
    const cached = await prisma.energyPriceCache.findUnique({
      where: { energyType },
    });

    // Si le cache existe et est valide (du mois en cours), le retourner
    if (cached && isCacheValid(cached.lastUpdated)) {
      console.log(
        `📦 Cache hit pour ${energyType} (dernière mise à jour: ${cached.lastUpdated.toLocaleDateString()})`
      );
      return {
        evolution_10y: cached.tauxRecent, // Utiliser tauxRecent au lieu de evolution_10y
        fromCache: true,
      };
    }

    // Sinon, interroger l'API DIDO
    console.log(`🌐 Récupération depuis l'API DIDO pour ${energyType}...`);
    const evolution10y = await getEnergyEvolution10y(energyType);

    // Mettre à jour ou créer dans le cache
    const updated = await prisma.energyPriceCache.upsert({
      where: { energyType },
      update: {
        tauxRecent: evolution10y, // Utiliser tauxRecent
        lastUpdated: new Date(),
      },
      create: {
        energyType,
        currentPrice: 0,
        tauxRecent: evolution10y, // Utiliser tauxRecent
        tauxEquilibre: 0, // Sera mis à jour par getOrRefreshEnergyModel
        anneesTransition: 5,
        lastUpdated: new Date(),
      },
    });

    console.log(`✅ Cache mis à jour pour ${energyType}`);

    return {
      evolution_10y: updated.tauxRecent,
      fromCache: false,
    };
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des données pour ${energyType}:`,
      error
    );

    // En cas d'erreur, essayer de récupérer la valeur la plus récente en DB
    try {
      const mostRecent = await prisma.energyPriceCache.findFirst({
        where: { energyType },
        orderBy: { lastUpdated: "desc" },
      });

      if (mostRecent && mostRecent.tauxRecent > 0) {
        console.log(
          `⚠️ Utilisation de l'évolution la plus récente en DB pour ${energyType}: ${mostRecent.tauxRecent}% (date: ${mostRecent.lastUpdated.toLocaleDateString()})`
        );
        return {
          evolution_10y: mostRecent.tauxRecent,
          fromCache: true,
        };
      }
    } catch (dbError) {
      console.error(
        `Erreur lors de la lecture de la DB pour ${energyType}:`,
        dbError
      );
    }

    // Si la DB est vide ou inaccessible, utiliser des valeurs par défaut conservatrices
    console.warn(`⚠️ Utilisation des valeurs par défaut pour ${energyType}`);
    const defaults: Record<string, number> = {
      fioul: 3, // 3% par an (historique moyen)
      gaz: 4, // 4% par an (impact guerre Ukraine)
      gpl: 3, // 3% par an (suit le pétrole)
      bois: 2, // 2% par an (plus stable)
      electricite: 3, // 3% par an (tarifs réglementés)
    };

    return {
      evolution_10y: defaults[energyType] || 3,
      fromCache: false,
    };
  }
};
