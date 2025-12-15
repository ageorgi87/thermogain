import { prisma } from "@/lib/prisma";
import { PacType } from "@/types/pacType";

/**
 * Détermine si l'étape ECS doit être affichée pour un projet donné
 *
 * Conditions pour afficher l'étape ECS:
 * 1. Le type de PAC permet la gestion de l'ECS (type_pac = AIR_EAU ou EAU_EAU)
 * 2. Le client veut que la future PAC gère l'ECS (with_ecs_management = true)
 * 3. Le système de chauffage actuel a une ECS séparée (ecs_integrated = false)
 *
 * @param projectId - ID du projet
 * @returns true si l'étape ECS doit être affichée, false sinon
 */
export const shouldShowDhwStep = async (
  projectId: string
): Promise<boolean> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      projetPac: {
        select: {
          type_pac: true,
          with_ecs_management: true,
        },
      },
      currentHeating: {
        select: {
          dhwIntegrated: true,
        },
      },
    },
  });

  if (!project) {
    return false;
  }

  // 1. Vérifier que le type de PAC permet la gestion de l'ECS
  const pacTypeAllowsDhw =
    project.projetPac?.type_pac === PacType.AIR_EAU ||
    project.projetPac?.type_pac === PacType.EAU_EAU;

  // 2. Vérifier que le client veut que la PAC gère l'ECS
  const clientWantsDhwManagement = project.projetPac?.with_ecs_management === true;

  // 3. Vérifier que le système actuel a une ECS séparée (pas intégrée au chauffage)
  const currentDhwIsSeparate = project.currentHeating?.dhwIntegrated === false;

  return pacTypeAllowsDhw && clientWantsDhwManagement && currentDhwIsSeparate;
};
