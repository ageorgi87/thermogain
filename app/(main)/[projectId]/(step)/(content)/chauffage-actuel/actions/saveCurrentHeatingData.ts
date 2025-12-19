"use server";

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess";
import { prisma } from "@/lib/prisma";
import type { ProjectCurrentHeating } from "@prisma/client";
import {
  currentHeatingSchema,
  type CurrentHeatingData,
} from "./currentHeatingSchema";

interface SaveCurrentHeatingDataParams {
  projectId: string;
  data: CurrentHeatingData;
}

export const saveCurrentHeatingData = async ({
  projectId,
  data,
}: SaveCurrentHeatingDataParams): Promise<ProjectCurrentHeating> => {
  await verifyProjectAccess({ projectId });

  const validatedData = currentHeatingSchema.parse(data);

  // Get project to check current step
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { currentStep: true },
  });

  if (!project) {
    throw new Error("Projet non trouvé");
  }

  const currentHeating = await prisma.projectCurrentHeating.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    },
    update: validatedData,
  });

  // Update currentStep from 1 to 2 (chauffage-actuel is now step 1)
  if (project.currentStep === 1) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 2 },
    });
  }

  return currentHeating;
};
