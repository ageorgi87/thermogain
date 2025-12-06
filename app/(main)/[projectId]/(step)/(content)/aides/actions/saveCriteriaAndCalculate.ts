"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAidesWithPublicodesAPI } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/mesAidesRenoPublicodesClient";
import { prepareApiParams } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/prepareApiParams";

interface SaveCriteriaParams {
  projectId: string;
  type_logement: string;
  revenu_fiscal_reference: number;
  residence_principale: boolean;
  remplacement_complet: boolean;
}

interface CalculateAidesResult {
  success: boolean;
  data?: {
    ma_prime_renov: number;
    cee: number;
    total_aides: number;
    eligible_ma_prime_renov: boolean;
    eligible_cee: boolean;
    raisons_ineligibilite?: string[];
  };
  error?: string;
}

/**
 * Sauvegarde les critères d'éligibilité en DB puis calcule les aides
 * Action serveur appelée depuis le composant AidCalculator
 *
 * @param params - Critères d'éligibilité et projectId
 * @returns Résultat du calcul avec montants des aides
 */
export const saveCriteriaAndCalculate = async (
  params: SaveCriteriaParams
): Promise<CalculateAidesResult> => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Non autorisé",
    };
  }

  try {
    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      select: { userId: true },
    });

    if (!project || project.userId !== session.user.id) {
      return {
        success: false,
        error: "Projet non trouvé",
      };
    }

    // Sauvegarder les critères d'éligibilité en DB
    await prisma.projectAides.upsert({
      where: { projectId: params.projectId },
      create: {
        projectId: params.projectId,
        type_logement: params.type_logement,
        revenu_fiscal_reference: params.revenu_fiscal_reference,
        residence_principale: params.residence_principale,
        remplacement_complet: params.remplacement_complet,
        ma_prime_renov: 0,
        cee: 0,
        autres_aides: 0,
        total_aides: 0,
      },
      update: {
        type_logement: params.type_logement,
        revenu_fiscal_reference: params.revenu_fiscal_reference,
        residence_principale: params.residence_principale,
        remplacement_complet: params.remplacement_complet,
      },
    });

    // Préparer les paramètres API (récupère tout depuis la DB)
    const apiParams = await prepareApiParams(params.projectId);

    // Appeler l'API Mes Aides Réno (Publicodes)
    const apiResponse = await calculateAidesWithPublicodesAPI(apiParams);

    // Extraire les montants depuis la réponse
    // Le field "gestes.chauffage.PAC.air-eau.montant" retourne le total avec détails
    const gesteField = apiResponse["gestes.chauffage.PAC.air-eau.montant"];

    if (!gesteField) {
      throw new Error("Réponse API invalide : field montant manquant");
    }

    // Le total est dans rawValue
    const total_aides = gesteField.rawValue || 0;

    // Les détails MPR et CEE sont dans le champ "details"
    let ma_prime_renov = 0;
    let cee = 0;

    if (gesteField.details && Array.isArray(gesteField.details)) {
      // Trouver MPR dans les détails
      const mprDetail = gesteField.details.find((d: any) => d.MPR);
      if (mprDetail?.MPR?.rawValue) {
        ma_prime_renov = Math.round(mprDetail.MPR.rawValue);
      }

      // Trouver CEE ou Coup de pouce dans les détails
      const ceeDetail = gesteField.details.find((d: any) => d.CEE);
      if (ceeDetail?.CEE?.rawValue) {
        cee = Math.round(ceeDetail.CEE.rawValue);
      }

      // Si pas de CEE, chercher Coup de pouce
      if (cee === 0) {
        const coupDePouceDetail = gesteField.details.find((d: any) => d["Coup de pouce"]);
        if (coupDePouceDetail?.["Coup de pouce"]?.rawValue) {
          cee = Math.round(coupDePouceDetail["Coup de pouce"].rawValue);
        }
      }
    }

    // Vérifier l'éligibilité
    const eligible_ma_prime_renov = ma_prime_renov > 0;
    const eligible_cee = cee > 0;

    // Collecter les raisons d'inéligibilité depuis missingVariables
    const raisons_ineligibilite: string[] = [];
    if (gesteField.missingVariables && gesteField.missingVariables.length > 0) {
      raisons_ineligibilite.push(
        `Variables manquantes pour le calcul complet: ${gesteField.missingVariables.join(", ")}`
      );
    }

    return {
      success: true,
      data: {
        ma_prime_renov,
        cee,
        total_aides,
        eligible_ma_prime_renov,
        eligible_cee,
        raisons_ineligibilite:
          raisons_ineligibilite.length > 0 ? raisons_ineligibilite : undefined,
      },
    };
  } catch (error) {
    console.error("❌ Erreur lors du calcul des aides:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors du calcul des aides",
    };
  }
};
