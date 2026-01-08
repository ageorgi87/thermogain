"use server";

import { prisma } from "@/lib/prisma";
import { fetchAllEnergyDataFromAPI } from "@/app/(main)/[projectId]/lib/refreshEnergyPricesIfNeeded/helpers/fetchAllEnergyDataFromAPI";
import { updateEnergyPriceCache } from "@/app/(main)/[projectId]/lib/refreshEnergyPricesIfNeeded/mutations/updateEnergyPriceCache";
import { sendDidoApiAlert } from "@/app/(main)/[projectId]/lib/refreshEnergyPricesIfNeeded/helpers/sendDidoApiAlert";
import { EnergyType } from "@/types/energyType";
import { API_ENERGY_TYPES } from "@/app/(main)/[projectId]/(step)/(content)/informations/config/apiEnergyTypes";

const ALERT_THRESHOLD_DAYS = 30;
const ALERT_COOLDOWN_DAYS = 7; // Ne pas renvoyer d'alerte avant 7 jours

/**
 * Rafraîchit les prix énergétiques depuis l'API DIDO si nécessaire
 *
 * Logique mise à jour avec fallback sur cache:
 * 1. Vérifie la date de dernière mise à jour GLOBALE (via electricite comme référence)
 * 2. Si obsolète (>1 jour) → Tente de fetch les données depuis l'API
 * 3. Si l'API échoue → Continue avec les données en cache (même anciennes)
 * 4. Si cache >30 jours ET pas d'alerte récente → Envoie email à contact@thermogain.fr
 *
 * IMPORTANT: L'application ne crashe JAMAIS à cause de l'API indisponible.
 * Les données en cache sont toujours utilisées en fallback, même si anciennes.
 *
 * Cette fonction doit être appelée à la step 1 (informations) du wizard
 * avant de passer à la step suivante.
 */
export const refreshEnergyPricesIfNeeded = async (): Promise<void> => {
  // 1. Vérifier la date de mise à jour GLOBALE (via electricite comme référence)
  const globalReference = await prisma.energyPriceCache.findUnique({
    where: { energyType: EnergyType.ELECTRICITE },
  });

  if (!globalReference) {
    // Pas de cache du tout → DOIT fetch l'API (première initialisation)
    console.log("[refreshEnergyPricesIfNeeded] Aucun cache trouvé, initialisation depuis l'API...");
    try {
      const allEnergyData = await fetchAllEnergyDataFromAPI();
      await Promise.all(
        API_ENERGY_TYPES.map(async (energyType) => {
          const energyData = allEnergyData[energyType];
          await updateEnergyPriceCache(energyType, energyData);
        })
      );
      console.log("[refreshEnergyPricesIfNeeded] Cache initialisé avec succès");
    } catch (error) {
      console.error("[refreshEnergyPricesIfNeeded] Échec initialisation API:", error);
      throw new Error("Impossible d'initialiser le cache énergétique. L'API DIDO est indisponible.");
    }
    return;
  }

  const now = new Date();
  const daysSinceUpdate = Math.floor(
    (now.getTime() - globalReference.lastUpdated.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Si données récentes (<1 jour) → Rien à faire
  if (daysSinceUpdate < 1) {
    return;
  }

  // Tentative de mise à jour depuis l'API
  console.log(`[refreshEnergyPricesIfNeeded] Tentative de rafraîchissement (${daysSinceUpdate} jours depuis MAJ)`);

  try {
    const allEnergyData = await fetchAllEnergyDataFromAPI();
    await Promise.all(
      API_ENERGY_TYPES.map(async (energyType) => {
        const energyData = allEnergyData[energyType];
        await updateEnergyPriceCache(energyType, energyData);
      })
    );
    console.log("[refreshEnergyPricesIfNeeded] Rafraîchissement réussi depuis l'API");
  } catch (error) {
    console.warn(`[refreshEnergyPricesIfNeeded] API indisponible, utilisation du cache (${daysSinceUpdate} jours)`, error);

    // Si cache >30 jours → Vérifier si on doit envoyer une alerte
    if (daysSinceUpdate >= ALERT_THRESHOLD_DAYS) {
      const daysSinceLastAlert = globalReference.lastAlertSent
        ? Math.floor((now.getTime() - globalReference.lastAlertSent.getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;

      if (daysSinceLastAlert >= ALERT_COOLDOWN_DAYS) {
        console.log(`[refreshEnergyPricesIfNeeded] Envoi d'alerte email (${daysSinceUpdate} jours sans mise à jour)`);
        await sendDidoApiAlert(daysSinceUpdate);

        // Marquer l'alerte comme envoyée
        await prisma.energyPriceCache.update({
          where: { energyType: EnergyType.ELECTRICITE },
          data: { lastAlertSent: now },
        });
      } else {
        console.log(`[refreshEnergyPricesIfNeeded] Alerte non envoyée (cooldown: ${ALERT_COOLDOWN_DAYS - daysSinceLastAlert} jours restants)`);
      }
    }

    // Continue avec le cache existant (ne pas throw)
  }
};
