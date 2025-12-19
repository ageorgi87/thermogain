"use server";

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess";
import { prisma } from "@/lib/prisma";
import {
  saveInformationsDataSchema,
  type SaveInformationsDataInput,
} from "./saveInformationsDataSchema";
import { refreshEnergyPricesIfNeeded } from "@/app/(main)/[projectId]/lib/refreshEnergyPricesIfNeeded/refreshEnergyPricesIfNeeded";

interface SaveInformationsDataParams {
  projectId: string;
  data: SaveInformationsDataInput;
}

export const saveInformationsData = async ({
  projectId,
  data,
}: SaveInformationsDataParams) => {
  await verifyProjectAccess({ projectId });

  const validatedData = saveInformationsDataSchema.parse(data);

  // Get project to check current step
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { currentStep: true },
  });

  if (!project) {
    throw new Error("Projet non trouvé");
  }

  // Refresh energy prices if needed (< 31 days)
  // This ensures all subsequent steps have fresh energy data
  await refreshEnergyPricesIfNeeded();

  // Update project name and recipientEmails directly in Project table
  await prisma.project.update({
    where: { id: projectId },
    data: {
      name: validatedData.project_name,
      recipientEmails: validatedData.recipient_emails,
      currentStep: project.currentStep === 0 ? 1 : project.currentStep, // Move to step 1 if on step 0
    },
  });

  // Upsert ProjectHeatPump with heatPumpType and withDhwManagement
  // Other fields will be filled in step 3 (projet-pac)
  await prisma.projectHeatPump.upsert({
    where: { projectId },
    create: {
      projectId,
      heatPumpType: validatedData.type_pac,
      withDhwManagement: validatedData.with_ecs_management,
    },
    update: {
      heatPumpType: validatedData.type_pac,
      withDhwManagement: validatedData.with_ecs_management,
    },
  });
};
