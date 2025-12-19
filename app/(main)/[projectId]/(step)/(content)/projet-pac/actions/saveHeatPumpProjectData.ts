"use server";

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess";
import { prisma } from "@/lib/prisma";
import {
  heatPumpProjectSchema,
  type HeatPumpProjectData,
} from "./heatPumpProjectSchema";
import { calculateAdjustedCOP } from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/lib/calculateAdjustedCOP";
import { EmitterType } from "@/types/emitterType";

interface SaveHeatPumpProjectDataParams {
  projectId: string;
  data: HeatPumpProjectData;
}

export const saveHeatPumpProjectData = async ({
  projectId,
  data,
}: SaveHeatPumpProjectDataParams) => {
  await verifyProjectAccess({ projectId });

  const validatedData = heatPumpProjectSchema.parse(data);

  // Get project data needed for calculations and step update
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      currentStep: true,
      housing: {
        select: {
          postalCode: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Projet non trouvé");
  }

  // Calculer le COP ajusté selon émetteurs et zone climatique
  // La température de départ est automatiquement déduite du type d'émetteur
  const adjustedCop = calculateAdjustedCOP(
    validatedData.estimatedCop,
    validatedData.emitters ?? EmitterType.RADIATEURS_BASSE_TEMP,
    project.housing?.postalCode ?? undefined,
    validatedData.heatPumpType
  );

  const heatPump = await prisma.projectHeatPump.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      adjustedCop,
      projectId,
    },
    update: {
      ...validatedData,
      adjustedCop,
    },
  });

  if (project.currentStep === 4) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 5 },
    });
  }

  return heatPump;
};
