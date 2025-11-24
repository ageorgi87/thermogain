"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { currentHeatingSchema, type CurrentHeatingData } from "./currentHeatingSchema"
import { estimateConsumptionByEnergyType } from "@/lib/consumptionEstimation"
import { getCurrentEnergyPrice } from "@/lib/didoApi"

export async function saveCurrentHeatingData(projectId: string, data: CurrentHeatingData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const validatedData = currentHeatingSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  // If user doesn't know consumption, estimate it based on housing characteristics
  if (!validatedData.connait_consommation) {
    // Housing data is required for estimation (validated by schema)
    const housingData = {
      surface_habitable: validatedData.surface_habitable!,
      annee_construction: validatedData.annee_construction!,
      isolation_murs: validatedData.isolation_murs!,
      isolation_combles: validatedData.isolation_combles!,
      isolation_fenetres: validatedData.isolation_fenetres!,
      nombre_occupants: validatedData.nombre_occupants!,
    }

    // Estimate consumption based on energy type
    const estimation = estimateConsumptionByEnergyType(housingData, validatedData.type_chauffage)

    // Get current energy price from DIDO API
    let energyPrice: number

    switch (validatedData.type_chauffage) {
      case "Fioul":
        energyPrice = await getCurrentEnergyPrice("fioul")
        validatedData.conso_fioul_litres = estimation.value
        validatedData.prix_fioul_litre = energyPrice
        break
      case "Gaz":
        energyPrice = await getCurrentEnergyPrice("gaz")
        validatedData.conso_gaz_kwh = estimation.value
        validatedData.prix_gaz_kwh = energyPrice
        break
      case "GPL":
        energyPrice = await getCurrentEnergyPrice("gpl")
        validatedData.conso_gpl_kg = estimation.value
        validatedData.prix_gpl_kg = energyPrice
        break
      case "Pellets":
      case "Bois":
        energyPrice = await getCurrentEnergyPrice("bois")
        if (validatedData.type_chauffage === "Pellets") {
          validatedData.conso_pellets_kg = estimation.value
          validatedData.prix_pellets_kg = energyPrice
        } else {
          validatedData.conso_bois_steres = estimation.value
          validatedData.prix_bois_stere = energyPrice
        }
        break
      case "Electrique":
        energyPrice = await getCurrentEnergyPrice("electricite")
        validatedData.conso_elec_kwh = estimation.value
        validatedData.prix_elec_kwh = energyPrice
        break
      case "PAC Air/Air":
      case "PAC Air/Eau":
      case "PAC Eau/Eau":
        energyPrice = await getCurrentEnergyPrice("electricite")
        validatedData.conso_pac_kwh = estimation.value
        validatedData.prix_elec_kwh = energyPrice
        // Set a default COP for existing PACs (estimated average)
        validatedData.cop_actuel = 2.5
        break
    }

    console.log(`Consommation estimée: ${estimation.value} ${estimation.unit}`)
    console.log(`Prix énergétique: ${energyPrice} €`)
  }

  const chauffageActuel = await prisma.projectChauffageActuel.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  // Update currentStep from 1 to 2 (chauffage-actuel is now step 1)
  if (project.currentStep === 1) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 2 },
    })
  }

  return chauffageActuel
}
