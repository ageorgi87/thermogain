"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { housingSchema, type HousingData } from "./housingSchema";
import { estimateDPE } from "@/lib/dpe/estimateDPE";

interface SaveHousingDataParams {
  projectId: string;
  data: HousingData;
}

export const saveHousingData = async ({
  projectId,
  data,
}: SaveHousingDataParams) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  const validatedData = housingSchema.parse(data);

  // Check if project exists and belongs to user
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé");
  }

  // Si le DPE n'est pas fourni, on l'estime automatiquement
  let finalData = { ...validatedData };

  if (!validatedData.classe_dpe) {
    const dpeEstime = estimateDPE({
      annee_construction: validatedData.annee_construction,
      qualite_isolation: validatedData.qualite_isolation,
      surface_habitable: validatedData.surface_habitable,
    });

    finalData.classe_dpe = dpeEstime;
  }

  // Upsert logement data
  const logement = await prisma.projectLogement.upsert({
    where: { projectId },
    create: {
      ...finalData,
      projectId,
    } as any,
    update: finalData as any,
  });

  // Update project's current step if needed
  if (project.currentStep === 1) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 2 },
    });
  }

  return logement;
};
