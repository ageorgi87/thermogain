"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface GetInformationsDataParams {
  projectId: string;
}

export const getInformationsData = async ({
  projectId,
}: GetInformationsDataParams) => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
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

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé");
  }

  return {
    name: project.name,
    recipientEmails: project.recipientEmails,
    typePac: project.heatPump?.heatPumpType,
    withEcsManagement: project.heatPump?.withDhwManagement,
  };
};
