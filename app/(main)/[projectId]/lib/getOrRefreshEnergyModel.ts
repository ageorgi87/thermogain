import { prisma } from "@/lib/prisma"
import type { EnergyEvolutionModel } from "@/types/energy"
import { DATAFILE_RIDS } from "@/app/(main)/[projectId]/lib/didoConstants";
import { analyzeEnergyPriceHistory } from "@/app/(main)/[projectId]/lib/analyzeEnergyPriceHistory";

/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 * basé sur l'historique réel de l'API DIDO
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Modèle Mean Reversion optimal calculé depuis l'API DIDO
 * @throws Error si le type d'énergie est invalide ou si l'API échoue
 */
const getEnergyMeanReversionModel = async (
  energyType: "gaz" | "electricite" | "fioul" | "bois"
): Promise<EnergyEvolutionModel> => {
  let rid: string;
  let priceColumnName: string;
  let label: string;

  switch (energyType) {
    case "gaz":
      rid = DATAFILE_RIDS.gas;
      priceColumnName = "PX_GAZ_D_TTES_TRANCHES";
      label = "GAZ";
      break;

    case "electricite":
      rid = DATAFILE_RIDS.electricity;
      priceColumnName = "PX_ELE_D_TTES_TRANCHES";
      label = "ÉLECTRICITÉ";
      break;

    case "fioul":
      rid = DATAFILE_RIDS.petroleum;
      priceColumnName = "PX_PETRO_FOD_100KWH_C1";
      label = "FIOUL";
      break;

    case "bois":
      rid = DATAFILE_RIDS.wood;
      priceColumnName = "PX_BOIS_GRANVRAC_100KWH";
      label = "BOIS";
      break;

    default:
      throw new Error(`Type d'énergie invalide: ${energyType}`);
  }

  const analysis = await analyzeEnergyPriceHistory(rid, priceColumnName);

  return {
    tauxRecent: analysis.tauxRecent,
    tauxEquilibre: analysis.tauxEquilibre,
    anneesTransition: 5,
  };
};

/**
 * Vérifie si les données du cache sont du mois actuel
 * @param lastUpdated Date de dernière mise à jour
 * @returns true si les données datent du mois en cours
 */
const isCurrentMonth = (lastUpdated: Date): boolean => {
  const now = new Date()
  return (
    lastUpdated.getFullYear() === now.getFullYear() &&
    lastUpdated.getMonth() === now.getMonth()
  )
}

/**
 * Récupère le modèle énergétique depuis la DB ou le rafraîchit si nécessaire
 *
 * Logique:
 * 1. Cherche en DB
 * 2. Si données absentes OU datent du mois précédent → Appel API + Update DB
 * 3. Re-lit la DB pour obtenir les données fraîches
 * 4. Retourne toujours les données depuis la DB (jamais directement depuis l'API)
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Modèle d'évolution depuis la DB
 */
export const getOrRefreshEnergyModel = async (
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois'
): Promise<EnergyEvolutionModel> => {
  // 1. Chercher en DB
  let cached = await prisma.energyPriceCache.findUnique({
    where: { energyType }
  })

  // 2. Vérifier si update nécessaire
  const needsUpdate = !cached || !isCurrentMonth(cached.lastUpdated)

  if (needsUpdate) {
    if (!cached) {
      console.log(`📥 Aucune donnée en DB pour ${energyType.toUpperCase()}, appel API DIDO...`)
    } else {
      console.log(
        `🔄 Données ${energyType.toUpperCase()} obsolètes (dernière màj: ${cached.lastUpdated.toLocaleDateString('fr-FR')}), rafraîchissement...`
      )
    }

    // 3. Appeler l'API DIDO pour calculer le nouveau modèle
    const freshModel = await getEnergyMeanReversionModel(energyType)

    // 4. Sauvegarder en DB
    await prisma.energyPriceCache.upsert({
      where: { energyType },
      update: {
        tauxRecent: freshModel.tauxRecent,
        tauxEquilibre: freshModel.tauxEquilibre,
        anneesTransition: freshModel.anneesTransition || 5,
        lastUpdated: new Date()
      },
      create: {
        energyType,
        tauxRecent: freshModel.tauxRecent,
        tauxEquilibre: freshModel.tauxEquilibre,
        anneesTransition: freshModel.anneesTransition || 5,
        currentPrice: 0, // Legacy field
        lastUpdated: new Date()
      }
    })

    console.log(`✅ Modèle ${energyType.toUpperCase()} mis à jour en DB`)

    // 5. Re-lire depuis la DB pour garantir cohérence
    cached = await prisma.energyPriceCache.findUnique({
      where: { energyType }
    })
  } else if (cached) {
    console.log(`✅ Modèle ${energyType.toUpperCase()} à jour (${cached.lastUpdated.toLocaleDateString('fr-FR')})`)
  }

  // 6. Construire et retourner le modèle depuis les données DB
  if (!cached) {
    throw new Error(`Impossible de récupérer le modèle ${energyType} depuis la DB après update`)
  }

  return {
    tauxRecent: cached.tauxRecent,
    tauxEquilibre: cached.tauxEquilibre,
    anneesTransition: cached.anneesTransition
  }
}
