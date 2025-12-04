// Main calculation function that orchestrates all calculations
import type { ProjectData } from "@/types/projectData";
import type { CalculationResults } from "@/types/calculationResults";
import { calculateCurrentAnnualCost } from "@/lib/calculateCurrentAnnualCost";
import { calculatePacAnnualCost } from "@/lib/calculatePacAnnualCost";
import { calculatePacConsumptionKwh } from "@/lib/calculatePacConsumptionKwh";
import { calculateYearlyData } from "@/lib/calculateYearlyData";
import { calculateTotalSavings } from "@/lib/calculateTotalSavings";
import { calculateNetBenefit } from "@/lib/calculateNetBenefit";
import { calculatePaybackPeriod } from "@/lib/calculatePaybackPeriod";
import { calculatePaybackYear } from "@/lib/calculatePaybackYear";
import { calculateMonthlyPayment } from "@/lib/calculateMonthlyPayment";
import { calculateTotalCreditCost } from "@/lib/calculateTotalCreditCost";

/**
 * Fonction principale qui calcule tous les résultats du projet
 * @param data Données du projet
 * @returns Tous les résultats calculés
 */
export const calculateAllResults = async (
  data: ProjectData
): Promise<CalculationResults> => {
  // Coûts année 1
  const coutAnnuelActuel = calculateCurrentAnnualCost(data);
  const coutAnnuelPac = calculatePacAnnualCost(data);

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
  const yearlyData = await calculateYearlyData({
    data: dataAjusteeROI,
    years: data.duree_vie_pac,
  });

  // Calculer la moyenne des économies annuelles sur toute la durée de vie (hors investissement)
  const economiesAnnuelles =
    yearlyData.length > 0
      ? yearlyData.reduce((sum: number, y) => sum + y.economie, 0) / yearlyData.length
      : coutAnnuelActuel - coutAnnuelPac;

  // ROI avec investissement réel (incluant intérêts du crédit)
  const paybackPeriod = await calculatePaybackPeriod({ data: dataAjusteeROI });
  const paybackYear = await calculatePaybackYear({ data: dataAjusteeROI });

  // Gains totaux sur la durée de vie de la PAC
  const totalSavingsLifetime = await calculateTotalSavings({
    data: dataAjusteeROI,
    years: data.duree_vie_pac,
  });
  const netBenefitLifetime = await calculateNetBenefit({
    data: dataAjusteeROI,
    years: data.duree_vie_pac,
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
