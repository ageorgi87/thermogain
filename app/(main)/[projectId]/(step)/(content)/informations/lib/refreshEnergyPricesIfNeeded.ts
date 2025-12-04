"use server"

import { prisma } from "@/lib/prisma"
import type { EnergyEvolutionModel } from "@/types/energy"
import { DATAFILE_RIDS } from "@/app/(main)/[projectId]/lib/energy/didoConstants"
import { analyzeEnergyPriceHistory } from "@/app/(main)/[projectId]/lib/calculateAllResults/analyzeEnergyPriceHistory"
import { getDataFileRows } from "@/app/(main)/[projectId]/lib/energy/getDataFileRows"

/**
 * Calcule le prix actuel moyen d'une énergie (moyenne des 12 derniers mois)
 * depuis l'API DIDO
 *
 * @param rid Identifiant du datafile DIDO
 * @param priceColumnName Nom de la colonne contenant le prix
 * @param energyType Type d'énergie
 * @returns Prix moyen en €/kWh
 * @throws Error si les données ne sont pas disponibles
 */
const calculateCurrentPrice = async (
  rid: string,
  priceColumnName: string,
  energyType: string
): Promise<number> => {
  // Récupérer les 12 derniers mois
  const rows = await getDataFileRows(rid, 12)

  if (rows.length === 0) {
    throw new Error(`Aucune donnée de prix disponible pour ${energyType} depuis l'API DIDO`)
  }

  // Extraire les prix et calculer la moyenne
  const prices: number[] = rows
    .map((row: any) => parseFloat(row[priceColumnName]))
    .filter((price: number) => !isNaN(price) && price > 0)

  if (prices.length === 0) {
    throw new Error(`Aucun prix valide trouvé pour ${energyType} dans les données DIDO`)
  }

  // Calculer la moyenne des prix des 12 derniers mois
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length

  // Les prix dans l'API sont en €/100kWh, donc diviser par 100 pour avoir €/kWh
  const pricePerKwh = averagePrice / 100

  console.log(`💰 Prix moyen ${energyType}: ${pricePerKwh.toFixed(4)} €/kWh`)

  // Arrondir à 4 décimales
  return Math.round(pricePerKwh * 10000) / 10000
}

/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 * basé sur l'historique réel de l'API DIDO
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Modèle Mean Reversion optimal calculé depuis l'API DIDO
 * @throws Error si le type d'énergie est invalide ou si l'API échoue
 */
const fetchEnergyModelFromAPI = async (
  energyType: "gaz" | "electricite" | "fioul" | "bois"
): Promise<EnergyEvolutionModel> => {
  let rid: string
  let priceColumnName: string
  let label: string

  switch (energyType) {
    case "gaz":
      rid = DATAFILE_RIDS.gas
      priceColumnName = "PX_GAZ_D_TTES_TRANCHES"
      label = "GAZ"
      break

    case "electricite":
      rid = DATAFILE_RIDS.electricity
      priceColumnName = "PX_ELE_D_TTES_TRANCHES"
      label = "ÉLECTRICITÉ"
      break

    case "fioul":
      rid = DATAFILE_RIDS.petroleum
      priceColumnName = "PX_PETRO_FOD_100KWH_C1"
      label = "FIOUL"
      break

    case "bois":
      rid = DATAFILE_RIDS.wood
      priceColumnName = "PX_BOIS_GRANVRAC_100KWH"
      label = "BOIS"
      break

    default:
      throw new Error(`Type d'énergie invalide: ${energyType}`)
  }

  const analysis = await analyzeEnergyPriceHistory(rid, priceColumnName)
  const currentPrice = await calculateCurrentPrice(rid, priceColumnName, energyType)

  return {
    tauxRecent: analysis.tauxRecent,
    tauxEquilibre: analysis.tauxEquilibre,
    anneesTransition: 5,
    currentPrice,
  }
}

/**
 * Vérifie si les données en DB datent de moins de 31 jours
 * @param lastUpdated Date de dernière mise à jour
 * @returns true si les données sont valides (< 31 jours)
 */
const isDataFresh = (lastUpdated: Date): boolean => {
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
  return daysDiff < 31
}

/**
 * Rafraîchit les prix énergétiques depuis l'API DIDO si nécessaire
 *
 * Logique:
 * 1. Vérifie si les données existent en DB
 * 2. Vérifie si elles datent de moins de 31 jours
 * 3. Si absent OU > 31 jours → Appel API + Update DB
 * 4. Sinon → Ne fait rien
 *
 * Cette fonction doit être appelée à la step 1 (informations) du wizard
 * avant de passer à la step suivante.
 */
export const refreshEnergyPricesIfNeeded = async (): Promise<void> => {
  const energyTypes: Array<"gaz" | "electricite" | "fioul" | "bois"> = [
    "gaz",
    "electricite",
    "fioul",
    "bois"
  ]

  for (const energyType of energyTypes) {
    // 1. Chercher en DB
    const cached = await prisma.energyPriceCache.findUnique({
      where: { energyType }
    })

    // 2. Vérifier si update nécessaire
    const needsUpdate = !cached || !isDataFresh(cached.lastUpdated)

    if (needsUpdate) {
      if (!cached) {
        console.log(`📥 Aucune donnée en DB pour ${energyType.toUpperCase()}, appel API DIDO...`)
      } else {
        console.log(
          `🔄 Données ${energyType.toUpperCase()} obsolètes (${Math.floor((new Date().getTime() - cached.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))} jours), rafraîchissement...`
        )
      }

      // 3. Appeler l'API DIDO pour calculer le nouveau modèle ET le prix actuel
      const freshModel = await fetchEnergyModelFromAPI(energyType)

      // 4. Sauvegarder en DB (modèle + prix actuel)
      await prisma.energyPriceCache.upsert({
        where: { energyType },
        update: {
          tauxRecent: freshModel.tauxRecent,
          tauxEquilibre: freshModel.tauxEquilibre,
          anneesTransition: freshModel.anneesTransition || 5,
          currentPrice: freshModel.currentPrice || 0,
          lastUpdated: new Date()
        },
        create: {
          energyType,
          tauxRecent: freshModel.tauxRecent,
          tauxEquilibre: freshModel.tauxEquilibre,
          anneesTransition: freshModel.anneesTransition || 5,
          currentPrice: freshModel.currentPrice || 0,
          lastUpdated: new Date()
        }
      })

      console.log(`✅ Modèle ${energyType.toUpperCase()} mis à jour en DB`)
    } else {
      console.log(
        `✅ Données ${energyType.toUpperCase()} à jour (${Math.floor((new Date().getTime() - cached.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))} jours)`
      )
    }
  }
}
