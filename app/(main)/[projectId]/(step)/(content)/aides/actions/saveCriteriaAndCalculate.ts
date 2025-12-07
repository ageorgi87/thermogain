"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProjectDataForAides } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/getProjectDataForAides";
import { calculateAidesAirEau } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/calculateAides/calculateAidesAirEau";
import { calculateAidesAirAir } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/calculateAides/calculateAidesAirAir";
import { calculateAidesGeothermique } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/calculateAides/calculateAidesGeothermique";

interface SaveCriteriaParams {
  projectId: string;
  type_logement: string;
  surface_logement: number;
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
        surface_logement: params.surface_logement,
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
        surface_logement: params.surface_logement,
        revenu_fiscal_reference: params.revenu_fiscal_reference,
        residence_principale: params.residence_principale,
        remplacement_complet: params.remplacement_complet,
      },
    });

    // Récupérer les données brutes du projet depuis la DB
    const projectData = await getProjectDataForAides(params.projectId);

    // Dispatcher : Appeler la fonction de calcul appropriée selon le type de PAC
    let result;

    switch (projectData.type_pac) {
      case "Air/Eau":
        result = await calculateAidesAirEau(projectData);
        break;

      case "Air/Air":
        result = await calculateAidesAirAir(projectData);
        break;

      case "Eau/Eau":
        result = await calculateAidesGeothermique(projectData);
        break;

      default:
        throw new Error(`Type de PAC non supporté: ${projectData.type_pac}`);
    }

    return {
      success: true,
      data: result,
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
