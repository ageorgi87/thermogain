"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAidesWithAPI } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/mesAidesRenoClient";
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

    // Appeler l'API Mes Aides Réno
    const apiResponse = await calculateAidesWithAPI(apiParams);

    // Extraire les montants des aides
    const ma_prime_renov = apiResponse.aides.ma_prime_renov?.montant || 0;
    const cee = apiResponse.aides.cee?.montant || 0;
    const total_aides = apiResponse.total_aides;

    return {
      success: true,
      data: {
        ma_prime_renov,
        cee,
        total_aides,
        eligible_ma_prime_renov:
          apiResponse.eligibilite.eligible_ma_prime_renov,
        eligible_cee: apiResponse.eligibilite.eligible_cee,
        raisons_ineligibilite: apiResponse.eligibilite.raisons_ineligibilite,
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
