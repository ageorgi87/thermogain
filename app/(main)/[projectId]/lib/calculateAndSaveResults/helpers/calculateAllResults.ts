// Main calculation function that orchestrates all calculations
import type { ProjectData } from "@/types/projectData";
import type { CalculationResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/types/calculationResults";
import { EnergyType, type ApiEnergyType } from "@/types/energyType";
import { FinancingMode } from "@/types/financingMode";
import { calculateCurrentVariableCost } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/energyDataExtractors";
import { calculateCurrentFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateCurrentFixedCosts";
import { calculatePacFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculatePacFixedCosts";
import { getCurrentConsumptionKwh } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/energyDataExtractors";
import { calculateYearlyCostProjections } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateYearlyCostProjections";
import { calculatePaybackPeriod } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculatePaybackPeriod";
import { calculateMonthlyPayment } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateMonthlyPayment";
import { getEnergyPriceEvolutionFromDB } from "@/app/(main)/[projectId]/lib/getErnegyData/getEnergyPriceEvolutionFromDB";
import { roundToDecimals } from "@/lib/utils/roundToDecimals";
import { calculateEcsCosts } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateEcsCosts";

/**
 * Retourne le type d'énergie pour l'API DIDO selon le type de chauffage
 * @param data Données du projet
 * @returns Type d'énergie (ApiEnergyType: 'gaz' | 'electricite' | 'fioul' | 'bois')
 */
const getEnergyType = (
  heatingSolution: ProjectData["type_chauffage"]
): ApiEnergyType => {
  switch (heatingSolution) {
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
  const energyType = getEnergyType(data.type_chauffage);
  const currentEnergyModel = await getEnergyPriceEvolutionFromDB(energyType);
  const pacEnergyModel = await getEnergyPriceEvolutionFromDB(
    EnergyType.ELECTRICITE
  );

  // Calculer les coûts ECS (avant/après)
  const ecsCosts = calculateEcsCosts(data);

  // Coûts année 1 - Chauffage actuel
  const currentVariableCost = calculateCurrentVariableCost(data);
  const currentFixedCosts = calculateCurrentFixedCosts(data);
  const coutAnnuelActuel = currentVariableCost + currentFixedCosts.total + ecsCosts.currentEcsCost;

  // Consommation PAC (calculée UNE SEULE FOIS, inline)
  // Formule: Consommation PAC = Besoins énergétiques / COP ajusté
  const currentConsumptionKwh = getCurrentConsumptionKwh(data, true);
  const consommationPacKwh = currentConsumptionKwh / data.cop_ajuste;

  // Coût variable PAC (inline pour éviter de recalculer la consommation)
  const prixElec = data.prix_elec_pac || data.prix_elec_kwh || 0;
  const pacVariableCost = consommationPacKwh * prixElec;

  const pacFixedCosts = calculatePacFixedCosts(data);
  const coutAnnuelPac = pacVariableCost + pacFixedCosts.total + ecsCosts.futureEcsCost;

  // Calculer l'investissement réel selon le mode de financement
  // Mode Comptant : reste_a_charge
  // Mode Crédit : reste_a_charge + intérêts du crédit
  // Mode Mixte : apport_personnel + montant_credit + intérêts
  let investissementReel = data.reste_a_charge;

  if (
    data.mode_financement === FinancingMode.CREDIT &&
    data.montant_credit &&
    data.taux_interet !== undefined &&
    data.duree_credit_mois
  ) {
    const mensualite = calculateMonthlyPayment({
      montant: data.montant_credit,
      tauxAnnuel: data.taux_interet,
      dureeMois: data.duree_credit_mois,
    });
    const coutTotalCredit = roundToDecimals(
      mensualite * data.duree_credit_mois,
      2
    );
    investissementReel = coutTotalCredit;
  } else if (
    data.mode_financement === FinancingMode.MIXTE &&
    data.montant_credit &&
    data.taux_interet !== undefined &&
    data.duree_credit_mois &&
    data.apport_personnel
  ) {
    const mensualite = calculateMonthlyPayment({
      montant: data.montant_credit,
      tauxAnnuel: data.taux_interet,
      dureeMois: data.duree_credit_mois,
    });
    const coutTotalCredit = roundToDecimals(
      mensualite * data.duree_credit_mois,
      2
    );
    investissementReel = data.apport_personnel + coutTotalCredit;
  }

  // Créer un objet ProjectData ajusté avec l'investissement réel
  const dataAjusteeROI: ProjectData = {
    ...data,
    reste_a_charge: investissementReel,
  };

  // Projections sur la durée de vie de la PAC (utiliser dataAjusteeROI pour cohérence)
  // Passer les modèles énergétiques ET la consommation PAC pour éviter les recalculs
  const yearlyData = await calculateYearlyCostProjections({
    data: dataAjusteeROI,
    years: data.duree_vie_pac,
    currentEnergyModel,
    pacEnergyModel,
    pacConsumptionKwh: consommationPacKwh,
  });

  // Calculer la moyenne des économies annuelles sur toute la durée de vie (hors investissement)
  const economiesAnnuelles =
    yearlyData.length > 0
      ? yearlyData.reduce((sum: number, y) => sum + y.economie, 0) /
        yearlyData.length
      : coutAnnuelActuel - coutAnnuelPac;

  // ROI avec investissement réel (incluant intérêts du crédit)
  // Utiliser yearlyData déjà calculé au lieu de le recalculer
  const paybackPeriod = calculatePaybackPeriod(yearlyData, investissementReel);

  // Calculer l'année calendaire du ROI (inline)
  const paybackYear = paybackPeriod
    ? new Date().getFullYear() + Math.floor(paybackPeriod)
    : null;

  // Gains totaux sur la durée de vie de la PAC (inline)
  const totalSavingsLifetime =
    yearlyData[yearlyData.length - 1]?.economiesCumulees || 0;

  // Coûts totaux sur durée de vie et bénéfice net (inline)
  const coutTotalActuelLifetime = yearlyData.reduce(
    (sum, y) => sum + y.coutActuel,
    0
  );
  const coutTotalPacLifetime =
    investissementReel + yearlyData.reduce((sum, y) => sum + y.coutPac, 0);
  const netBenefitLifetime = coutTotalActuelLifetime - coutTotalPacLifetime;

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

  // Financement (pour affichage uniquement, déjà calculé dans investissementReel)
  let mensualiteCredit: number | undefined;
  let coutTotalCredit: number | undefined;

  if (
    data.mode_financement === FinancingMode.CREDIT &&
    data.montant_credit &&
    data.taux_interet &&
    data.duree_credit_mois
  ) {
    mensualiteCredit = calculateMonthlyPayment({
      montant: data.montant_credit,
      tauxAnnuel: data.taux_interet,
      dureeMois: data.duree_credit_mois,
    });
    // Inline: mensualite * duree
    coutTotalCredit = roundToDecimals(
      mensualiteCredit * data.duree_credit_mois,
      2
    );
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
      ? roundToDecimals(tauxRentabilite, 1)
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
