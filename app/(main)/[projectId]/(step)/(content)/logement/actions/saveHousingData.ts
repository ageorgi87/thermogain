"use server";

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess";
import { prisma } from "@/lib/prisma";
import { housingSchema, type HousingData } from "./housingSchema";

interface SaveHousingDataParams {
  projectId: string;
  data: HousingData;
}

export const saveHousingData = async ({
  projectId,
  data,
}: SaveHousingDataParams) => {
  await verifyProjectAccess({ projectId });

  const validatedData = housingSchema.parse(data);

  // Get project to check current step
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { currentStep: true },
  });

  if (!project) {
    throw new Error("Projet non trouvé");
  }

  // Upsert housing data
  const housing = await prisma.projectHousing.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    },
    update: validatedData,
  });

  // Update project's current step if needed
  if (project.currentStep === 1) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 2 },
    });
  }

  return housing;
};
