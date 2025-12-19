"use server";

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess";
import { prisma } from "@/lib/prisma";

interface GetInformationsDataParams {
  projectId: string;
}

export const getInformationsData = async ({
  projectId,
}: GetInformationsDataParams) => {
  await verifyProjectAccess({ projectId });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      name: true,
      recipientEmails: true,
      heatPump: {
        select: {
          heatPumpType: true,
          withDhwManagement: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Projet non trouvé");
  }

  return {
    name: project.name,
    recipientEmails: project.recipientEmails,
    typePac: project.heatPump?.heatPumpType,
    withEcsManagement: project.heatPump?.withDhwManagement,
  };
};
