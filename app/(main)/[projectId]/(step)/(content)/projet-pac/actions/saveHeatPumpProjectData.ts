"use server";

import { auth } from "@/lib/auth";
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
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  const validatedData = heatPumpProjectSchema.parse(data);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      housing: true,
    },
  });

  if (!project || project.userId !== session.user.id) {
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
