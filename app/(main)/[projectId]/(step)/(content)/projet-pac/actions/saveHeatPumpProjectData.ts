"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  heatPumpProjectSchema,
  type HeatPumpProjectData,
} from "./heatPumpProjectSchema";
import { calculateAdjustedCOP } from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/lib/calculateAdjustedCOP";

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
      logement: true,
    },
  });

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé");
  }

  // Calculer le COP ajusté selon température, émetteurs, et zone climatique
  const cop_ajuste = calculateAdjustedCOP(
    validatedData.cop_estime,
    validatedData.temperature_depart ?? 45,
    validatedData.emetteurs ?? "Radiateurs basse température",
    project.logement?.code_postal ?? undefined,
    validatedData.type_pac
  );

  const projetPac = await prisma.projectProjetPac.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      cop_ajuste,
      projectId,
    } as any,
    update: {
      ...validatedData,
      cop_ajuste,
    } as any,
  });

  if (project.currentStep === 4) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 5 },
    });
  }

  return projetPac;
};
