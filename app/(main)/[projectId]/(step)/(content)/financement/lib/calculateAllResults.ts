// Main calculation function that orchestrates all calculations
import type { ProjectData } from "@/types/projectData";
import type { CalculationResults } from "@/types/calculationResults";
import { EnergyType, type ApiEnergyType } from "@/types/energyType";
import { calculateCurrentCostYear1 } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateCurrentCostYear1";
import { calculatePacCostYear1 } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculatePacCostYear1";
import { calculatePacConsumptionKwh } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculatePacConsumptionKwh";
import { calculateYearlyData } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateYearlyData";
import { calculateTotalSavings } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateTotalSavings";
import { calculateNetBenefit } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateNetBenefit";
import { calculatePaybackPeriod } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculatePaybackPeriod";
import { calculatePaybackYear } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculatePaybackYear";
import { calculateMonthlyPayment } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateMonthlyPayment";
import { calculateTotalCreditCost } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateTotalCreditCost";
import { getEnergyPriceEvolutionFromDB } from "@/app/(main)/[projectId]/lib/energy/getEnergyPriceEvolutionFromDB";

/**
 * Retourne le type d'énergie pour l'API DIDO selon le type de chauffage
 * @param data Données du projet
 * @returns Type d'énergie (ApiEnergyType: 'gaz' | 'electricite' | 'fioul' | 'bois')
 */
const getEnergyType = (
  data: ProjectData
): ApiEnergyType => {
  switch (data.type_chauffage) {
    case "Fioul":
    case "GPL":
      return EnergyType.FIOUL;

    case "Gaz":
      return EnergyType.GAZ;

    case "Pellets":
    case "Bois":
      return EnergyType.BOIS;

    case "Electrique":
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return EnergyType.ELECTRICITE;

    default:
      return EnergyType.GAZ; // Fallback
  }
};

/**
 * Fonction principale qui calcule tous les résultats du projet
 * @param data Données du projet
 * @returns Tous les résultats calculés
 */
export const calculateAllResults = async (
  data: ProjectData
): Promise<CalculationResults> => {
  // Récupérer les modèles énergétiques UNE SEULE FOIS au début
  // Les données ont été rafraîchies au step 1 (informations) si nécessaire
  const energyType = getEnergyType(data);
  const currentEnergyModel = await getEnergyPriceEvolutionFromDB(energyType);
  const pacEnergyModel = await getEnergyPriceEvolutionFromDB(EnergyType.ELECTRICITE);

  // Coûts année 1
  const coutAnnuelActuel = calculateCurrentCostYear1(data);
  const coutAnnuelPac = calculatePacCostYear1(data);

  // Consommation PAC
  const consommationPacKwh = calculatePacConsumptionKwh(data);

  // Calculer l'investissement réel selon le mode de financement
  // Mode Comptant : reste_a_charge
  // Mode Crédit : reste_a_charge + intérêts du crédit
  // Mode Mixte : apport_personnel + montant_credit + intérêts
  let investissementReel = data.reste_a_charge;

  if (
    data.mode_financement === "Crédit" &&
    data.montant_credit &&
    data.taux_interet !== undefined &&
    data.duree_credit_mois
  ) {
    const coutTotalCredit = calculateTotalCreditCost({
      montant: data.montant_credit,
      tauxAnnuel: data.taux_interet,
      dureeMois: data.duree_credit_mois,
    });
    investissementReel = coutTotalCredit;
  } else if (
    data.mode_financement === "Mixte" &&
    data.montant_credit &&
    data.taux_interet !== undefined &&
    data.duree_credit_mois &&
    data.apport_personnel
  ) {
    const coutTotalCredit = calculateTotalCreditCost({
      montant: data.montant_credit,
      tauxAnnuel: data.taux_interet,
      dureeMois: data.duree_credit_mois,
    });
    investissementReel = data.apport_personnel + coutTotalCredit;
  }

  // Créer un objet ProjectData ajusté avec l'investissement réel
  const dataAjusteeROI: ProjectData = {
    ...data,
    reste_a_charge: investissementReel,
  };

  // Projections sur la durée de vie de la PAC (utiliser dataAjusteeROI pour cohérence)
  // Passer les modèles énergétiques pour éviter de les re-fetch à chaque année
  const yearlyData = await calculateYearlyData({
    data: dataAjusteeROI,
    years: data.duree_vie_pac,
    currentEnergyModel,
    pacEnergyModel,
  });

  // Calculer la moyenne des économies annuelles sur toute la durée de vie (hors investissement)
  const economiesAnnuelles =
    yearlyData.length > 0
      ? yearlyData.reduce((sum: number, y) => sum + y.economie, 0) / yearlyData.length
      : coutAnnuelActuel - coutAnnuelPac;

  // ROI avec investissement réel (incluant intérêts du crédit)
  const paybackPeriod = await calculatePaybackPeriod({
    data: dataAjusteeROI,
    currentEnergyModel,
    pacEnergyModel,
  });
  const paybackYear = await calculatePaybackYear({
    data: dataAjusteeROI,
    currentEnergyModel,
    pacEnergyModel,
  });

  // Gains totaux sur la durée de vie de la PAC
  const totalSavingsLifetime = await calculateTotalSavings({
    data: dataAjusteeROI,
    years: data.duree_vie_pac,
    currentEnergyModel,
    pacEnergyModel,
  });
  const netBenefitLifetime = await calculateNetBenefit({
    data: dataAjusteeROI,
    years: data.duree_vie_pac,
    currentEnergyModel,
    pacEnergyModel,
  });

  // Coûts totaux sur durée de vie
  const coutTotalActuelLifetime = yearlyData.reduce(
    (sum: number, y) => sum + y.coutActuel,
    0
  );
  const coutTotalPacLifetime =
    investissementReel + yearlyData.reduce((sum: number, y) => sum + y.coutPac, 0);

  // Taux de rentabilité annuel moyen (utiliser investissement réel)
  // Formule: ((Valeur finale / Investissement initial)^(1/nombre d'années) - 1) * 100
  // Valeur finale = Investissement + Gain net
  let tauxRentabilite: number | null = null;
  if (investissementReel > 0 && data.duree_vie_pac > 0) {
    const valeurFinale = investissementReel + netBenefitLifetime;
    // Calculer le taux même si négatif (perte annuelle moyenne)
    // Si valeurFinale <= 0, le taux sera négatif
    if (valeurFinale > 0) {
      tauxRentabilite =
        (Math.pow(valeurFinale / investissementReel, 1 / data.duree_vie_pac) -
          1) *
        100;
    } else {
      // Pour les projets non rentables, calculer la perte annuelle moyenne en pourcentage
      // Perte totale / investissement / nombre d'années * 100
      tauxRentabilite =
        (netBenefitLifetime / investissementReel / data.duree_vie_pac) * 100;
    }
  }

  // Coûts mensuels
  const coutMensuelActuel = coutAnnuelActuel / 12;
  const coutMensuelPac = coutAnnuelPac / 12;
  const economieMensuelle = economiesAnnuelles / 12;

  // Financement
  let mensualiteCredit: number | undefined;
  let coutTotalCredit: number | undefined;

  if (
    data.mode_financement === "Crédit" &&
    data.montant_credit &&
    data.taux_interet &&
    data.duree_credit_mois
  ) {
    mensualiteCredit = calculateMonthlyPayment({
      montant: data.montant_credit,
      tauxAnnuel: data.taux_interet,
      dureeMois: data.duree_credit_mois,
    });
    coutTotalCredit = calculateTotalCreditCost({
      montant: data.montant_credit,
      tauxAnnuel: data.taux_interet,
      dureeMois: data.duree_credit_mois,
    });
  }

  return {
    coutAnnuelActuel: Math.round(coutAnnuelActuel),
    coutAnnuelPac: Math.round(coutAnnuelPac),
    economiesAnnuelles: Math.round(economiesAnnuelles),
    consommationPacKwh: Math.round(consommationPacKwh),
    yearlyData,
    paybackPeriod,
    paybackYear,
    totalSavingsLifetime: Math.round(totalSavingsLifetime),
    netBenefitLifetime: Math.round(netBenefitLifetime),
    tauxRentabilite: tauxRentabilite
      ? Math.round(tauxRentabilite * 10) / 10
      : null,
    coutTotalActuelLifetime: Math.round(coutTotalActuelLifetime),
    coutTotalPacLifetime: Math.round(coutTotalPacLifetime),
    coutMensuelActuel: Math.round(coutMensuelActuel),
    coutMensuelPac: Math.round(coutMensuelPac),
    economieMensuelle: Math.round(economieMensuelle),
    mensualiteCredit: mensualiteCredit
      ? Math.round(mensualiteCredit)
      : undefined,
    coutTotalCredit: coutTotalCredit ? Math.round(coutTotalCredit) : undefined,
    investissementReel: Math.round(investissementReel),
  };
};
