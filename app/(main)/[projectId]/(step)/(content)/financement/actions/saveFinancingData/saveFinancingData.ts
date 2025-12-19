"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
import { prisma } from "@/lib/prisma"
import { calculateMensualite } from "@/app/(main)/[projectId]/(step)/(content)/financement/lib/loanCalculations"
import { financingSchema, type FinancingData } from "@/app/(main)/[projectId]/(step)/(content)/financement/actions/saveFinancingData/saveFinancingDataSchema"

interface SaveFinancingDataParams {
  projectId: string
  data: FinancingData
}

export const saveFinancingData = async ({
  projectId,
  data,
}: SaveFinancingDataParams) => {
  await verifyProjectAccess({ projectId })

  const validatedData = financingSchema.parse(data)

  // Get project to check current step
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { currentStep: true },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  // Calculate monthlyPayment if credit information is provided
  let monthlyPayment: number | null = null
  if (
    validatedData.montant_credit &&
    validatedData.taux_interet !== undefined &&
    validatedData.duree_credit_mois
  ) {
    monthlyPayment = calculateMensualite(
      validatedData.montant_credit,
      validatedData.taux_interet,
      validatedData.duree_credit_mois
    )
  }

  const financement = await prisma.projectFinancing.upsert({
    where: { projectId },
    create: {
      projectId,
      financingMode: validatedData.mode_financement,
      downPayment: validatedData.apport_personnel ?? null,
      loanAmount: validatedData.montant_credit ?? null,
      interestRate: validatedData.taux_interet ?? null,
      loanDurationMonths: validatedData.duree_credit_mois ?? null,
      monthlyPayment,
    },
    update: {
      financingMode: validatedData.mode_financement,
      downPayment: validatedData.apport_personnel ?? null,
      loanAmount: validatedData.montant_credit ?? null,
      interestRate: validatedData.taux_interet ?? null,
      loanDurationMonths: validatedData.duree_credit_mois ?? null,
      monthlyPayment,
    },
  })

  if (project.currentStep === 6) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 7 },
    })
  }

  return financement
}
