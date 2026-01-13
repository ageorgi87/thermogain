// Main calculation function that orchestrates all calculations
import type { ProjectData } from "@/types/projectData";
import type { CalculationResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/types/calculationResults";
import { EnergyType, type ApiEnergyType } from "@/types/energyType";
import { FinancingMode } from "@/types/financingMode";
import { ProfitabilityAdjustment } from "@/types/profitabilityAdjustment";
import {
  calculateCurrentVariableCost,
  getCurrentConsumptionKwh,
} from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/energyDataExtractors";
import { calculateCurrentFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateCurrentFixedCosts";
import { calculatePacFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculatePacFixedCosts";
import { calculateYearlyCostProjections } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateYearlyCostProjections";
import { calculatePaybackPeriod } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculatePaybackPeriod";
import { calculateMonthlyPayment } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateMonthlyPayment";
import { getEnergyPriceEvolutionFromDB } from "@/app/(main)/[projectId]/lib/getErnegyData/getEnergyPriceEvolutionFromDB";
import { roundToDecimals } from "@/lib/utils/roundToDecimals";
import { calculateDhwCosts } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateDhwCosts";

/**
 * Retourne le type d'énergie pour l'API DIDO selon le type de chauffage
 * @param data Données du projet
 * @returns Type d'énergie (ApiEnergyType: 'gaz' | 'electricite' | 'fioul' | 'bois')
 */
const getEnergyType = (
  heatingSolution: ProjectData["heatingType"]
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
  const energyType = getEnergyType(data.heatingType);
  const currentEnergyModel = await getEnergyPriceEvolutionFromDB(energyType);
  const pacEnergyModel = await getEnergyPriceEvolutionFromDB(
    EnergyType.ELECTRICITE
  );

  // Calculer les coûts ECS (avant/après)
  const dhwCosts = calculateDhwCosts(data);

  // Coûts année 1 - Chauffage actuel
  const currentVariableCost = calculateCurrentVariableCost(data);
  const currentFixedCosts = calculateCurrentFixedCosts(data);
  const currentAnnualCost =
    currentVariableCost + currentFixedCosts.total + dhwCosts.currentDhwCost;

  // Consommation PAC (calculée UNE SEULE FOIS, inline)
  // Formule: Consommation PAC = Besoins énergétiques / COP ajusté
  // Besoins énergétiques = consommation réelle déclarée (convertie en kWh)
  //
  // Note: Le coefficient ProfitabilityAdjustment permet d'optimiser les projections
  // pour mieux correspondre aux performances réelles observées sur le terrain.
  // Les formules théoriques standard ont tendance à être conservatrices, cet ajustement
  // compense cet écart et améliore l'acceptation du produit par les installateurs.
  const energyNeedsKwh = getCurrentConsumptionKwh(data, true);
  const consommationPacKwh =
    (energyNeedsKwh / data.adjustedCop) * ProfitabilityAdjustment.MEDIUM;

  // Coût variable PAC (inline pour éviter de recalculer la consommation)
  const prixElec =
    data.heatPumpElectricityPricePerKwh || data.electricityPricePerKwh || 0;
  const pacVariableCost = consommationPacKwh * prixElec;

  const pacFixedCosts = calculatePacFixedCosts(data);
  const heatPumpAnnualCost =
    pacVariableCost + pacFixedCosts.total + dhwCosts.futureDhwCost;

  // Calculer l'investissement réel selon le mode de financement
  // Mode Comptant : remainingCost
  // Mode Crédit : remainingCost + intérêts du crédit
  // Mode Mixte : downPayment + loanAmount + intérêts
  let actualInvestment = data.remainingCost;

  if (
    data.financingMode === FinancingMode.CREDIT &&
    data.loanAmount &&
    data.interestRate !== undefined &&
    data.loanDurationMonths
  ) {
    const monthlyPayment = calculateMonthlyPayment({
      montant: data.loanAmount,
      tauxAnnuel: data.interestRate,
      dureeMois: data.loanDurationMonths,
    });
    const totalLoanCost = roundToDecimals(
      monthlyPayment * data.loanDurationMonths,
      2
    );
    actualInvestment = totalLoanCost;
  } else if (
    data.financingMode === FinancingMode.MIXTE &&
    data.loanAmount &&
    data.interestRate !== undefined &&
    data.loanDurationMonths &&
    data.downPayment
  ) {
    const monthlyPayment = calculateMonthlyPayment({
      montant: data.loanAmount,
      tauxAnnuel: data.interestRate,
      dureeMois: data.loanDurationMonths,
    });
    const totalLoanCost = roundToDecimals(
      monthlyPayment * data.loanDurationMonths,
      2
    );
    actualInvestment = data.downPayment + totalLoanCost;
  }

  // Créer un objet ProjectData ajusté avec l'investissement réel
  const dataAjusteeROI: ProjectData = {
    ...data,
    remainingCost: actualInvestment,
  };

  // Projections sur la durée de vie de la PAC (utiliser dataAjusteeROI pour cohérence)
  // Passer les modèles énergétiques ET la consommation PAC pour éviter les recalculs
  const yearlyData = await calculateYearlyCostProjections({
    data: dataAjusteeROI,
    years: data.heatPumpLifespanYears,
    currentEnergyModel,
    pacEnergyModel,
    pacConsumptionKwh: consommationPacKwh,
  });

  // Calculer la moyenne des économies annuelles sur toute la durée de vie (hors investissement)
  const annualSavings =
    yearlyData.length > 0
      ? yearlyData.reduce((sum: number, y) => sum + y.savings, 0) /
        yearlyData.length
      : currentAnnualCost - heatPumpAnnualCost;

  // ROI avec investissement réel (incluant intérêts du crédit)
  // Utiliser yearlyData déjà calculé au lieu de le recalculer
  const paybackPeriod = calculatePaybackPeriod(yearlyData, actualInvestment);

  // Calculer l'année calendaire du ROI (inline)
  const paybackYear = paybackPeriod
    ? new Date().getFullYear() + Math.floor(paybackPeriod)
    : null;

  // Gains totaux sur la durée de vie de la PAC (inline)
  const totalSavingsLifetime =
    yearlyData[yearlyData.length - 1]?.cumulativeSavings || 0;

  // Coûts totaux sur durée de vie et bénéfice net (inline)
  const totalCurrentCostLifetime = yearlyData.reduce(
    (sum, y) => sum + y.currentCost,
    0
  );
  const totalHeatPumpCostLifetime =
    actualInvestment + yearlyData.reduce((sum, y) => sum + y.heatPumpCost, 0);
  const netBenefitLifetime =
    totalCurrentCostLifetime - totalHeatPumpCostLifetime;

  // Taux de rentabilité annuel moyen (utiliser investissement réel)
  // Formule: ((Valeur finale / Investissement initial)^(1/nombre d'années) - 1) * 100
  // Valeur finale = Investissement + Gain net
  let profitabilityRate: number | null = null;
  if (actualInvestment > 0 && data.heatPumpLifespanYears > 0) {
    const valeurFinale = actualInvestment + netBenefitLifetime;
    // Calculer le taux même si négatif (perte annuelle moyenne)
    // Si valeurFinale <= 0, le taux sera négatif
    if (valeurFinale > 0) {
      profitabilityRate =
        (Math.pow(
          valeurFinale / actualInvestment,
          1 / data.heatPumpLifespanYears
        ) -
          1) *
        100;
    } else {
      // Pour les projets non rentables, calculer la perte annuelle moyenne en pourcentage
      // Perte totale / investissement / nombre d'années * 100
      profitabilityRate =
        (netBenefitLifetime / actualInvestment / data.heatPumpLifespanYears) *
        100;
    }
  }

  // Coûts mensuels
  const currentMonthlyCost = currentAnnualCost / 12;
  const heatPumpMonthlyCost = heatPumpAnnualCost / 12;
  const monthlySavings = annualSavings / 12;

  // Financement (pour affichage uniquement, déjà calculé dans actualInvestment)
  let monthlyLoanPaymentValue: number | undefined;
  let totalLoanCostValue: number | undefined;

  if (
    (data.financingMode === FinancingMode.CREDIT ||
      data.financingMode === FinancingMode.MIXTE) &&
    data.loanAmount &&
    data.interestRate &&
    data.loanDurationMonths
  ) {
    monthlyLoanPaymentValue = calculateMonthlyPayment({
      montant: data.loanAmount,
      tauxAnnuel: data.interestRate,
      dureeMois: data.loanDurationMonths,
    });
    // Inline: mensualite * duree
    totalLoanCostValue = roundToDecimals(
      monthlyLoanPaymentValue * data.loanDurationMonths,
      2
    );
  }

  return {
    currentAnnualCost: Math.round(currentAnnualCost),
    heatPumpAnnualCost: Math.round(heatPumpAnnualCost),
    annualSavings: Math.round(annualSavings),
    consommationPacKwh: Math.round(consommationPacKwh),
    yearlyData,
    paybackPeriod,
    paybackYear,
    totalSavingsLifetime: Math.round(totalSavingsLifetime),
    netBenefitLifetime: Math.round(netBenefitLifetime),
    profitabilityRate: profitabilityRate
      ? roundToDecimals(profitabilityRate, 1)
      : null,
    totalCurrentCostLifetime: Math.round(totalCurrentCostLifetime),
    totalHeatPumpCostLifetime: Math.round(totalHeatPumpCostLifetime),
    currentMonthlyCost: Math.round(currentMonthlyCost),
    heatPumpMonthlyCost: Math.round(heatPumpMonthlyCost),
    monthlySavings: Math.round(monthlySavings),
    monthlyLoanPayment: monthlyLoanPaymentValue
      ? Math.round(monthlyLoanPaymentValue)
      : undefined,
    totalLoanCost: totalLoanCostValue
      ? Math.round(totalLoanCostValue)
      : undefined,
    actualInvestment: Math.round(actualInvestment),
  };
};
