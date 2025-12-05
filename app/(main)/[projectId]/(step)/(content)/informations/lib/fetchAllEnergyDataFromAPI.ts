import type { ApiEnergyType } from "@/types/energyType";
import type { EnergyEvolutionModel } from "@/types/energy";
import { fetchOneEnergyDataFromAPI } from "@/app/(main)/[projectId]/(step)/(content)/informations/lib/fetchOneEnergyDataFromAPI";
import { API_ENERGY_TYPES } from "@/app/(main)/[projectId]/(step)/(content)/informations/config/apiEnergyTypes";

/**
 * Récupère les données énergétiques pour TOUTES les énergies en parallèle
 *
 * Cette fonction optimise les appels API en les exécutant simultanément
 * plutôt que séquentiellement, réduisant significativement le temps d'exécution.
 *
 * @returns Objet contenant les données énergétiques pour chaque type d'énergie
 */
export const fetchAllEnergyDataFromAPI = async (): Promise<
  Record<ApiEnergyType, EnergyEvolutionModel>
> => {
  // Lancer les 4 appels API en parallèle
  const results = await Promise.all(
    API_ENERGY_TYPES.map(async (energyType) => {
      const energyData = await fetchOneEnergyDataFromAPI(energyType);
      return { energyType, energyData };
    })
  );

  // Transformer le tableau en objet indexé par energyType
  const allEnergyData = results.reduce(
    (acc, { energyType, energyData }) => {
      acc[energyType] = energyData;
      return acc;
    },
    {} as Record<ApiEnergyType, EnergyEvolutionModel>
  );

  return allEnergyData;
};
