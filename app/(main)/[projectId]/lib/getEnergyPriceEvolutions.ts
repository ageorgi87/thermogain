import { DATAFILE_RIDS, type EnergyPriceEvolution } from "@/app/(main)/[projectId]/lib/didoConstants";
import { calculateEnergyEvolution10y } from "@/app/(main)/[projectId]/lib/calculateEnergyEvolution10y";

/**
 * Récupère les taux d'évolution des prix de l'énergie depuis l'API DIDO
 * Calcule l'évolution sur 10 ans, alignée avec l'horizon d'investissement d'une PAC (17 ans)
 *
 * Cette fonction interroge l'API DIDO-SDES pour obtenir les données historiques
 * des prix de l'énergie et calcule les taux d'évolution annuels moyens sur 10 ans.
 *
 * En cas d'échec de l'API, des valeurs par défaut basées sur les moyennes historiques sont retournées.
 */
export const getEnergyPriceEvolutions =
  async (): Promise<EnergyPriceEvolution> => {
    // Valeurs par défaut basées sur les moyennes historiques 2014-2024 (10 ans)
    const defaultValues: EnergyPriceEvolution = {
      evolution_prix_fioul: 3,
      evolution_prix_gaz: 4,
      evolution_prix_gpl: 3,
      evolution_prix_bois: 2,
      evolution_prix_electricite: 3,
    };

    try {
      // Calculer les évolutions sur 10 ans pour chaque type d'énergie en parallèle
      const [fioul, gaz, bois, electricite] = await Promise.all([
        calculateEnergyEvolution10y(
          DATAFILE_RIDS.petroleum,
          "PX_PETRO_FOD_100KWH_C1"
        ), // Prix fioul domestique
        calculateEnergyEvolution10y(
          DATAFILE_RIDS.gas,
          "PX_GAZ_D_TTES_TRANCHES"
        ), // Prix gaz toutes tranches
        calculateEnergyEvolution10y(
          DATAFILE_RIDS.wood,
          "PX_BOIS_GRANVRAC_100KWH"
        ), // Prix bois granulés vrac
        calculateEnergyEvolution10y(
          DATAFILE_RIDS.electricity,
          "PX_ELE_D_TTES_TRANCHES"
        ), // Prix électricité toutes tranches
      ]);

      // GPL utilise les mêmes données que le pétrole (approximation)
      return {
        evolution_prix_fioul: fioul || defaultValues.evolution_prix_fioul,
        evolution_prix_gaz: gaz || defaultValues.evolution_prix_gaz,
        evolution_prix_gpl: fioul || defaultValues.evolution_prix_gpl, // Approximation
        evolution_prix_bois: bois || defaultValues.evolution_prix_bois,
        evolution_prix_electricite:
          electricite || defaultValues.evolution_prix_electricite,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des évolutions de prix:",
        error
      );
      return defaultValues;
    }
  };
