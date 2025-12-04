"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProjectChauffageActuel } from "@prisma/client";
import {
  currentHeatingSchema,
  type CurrentHeatingData,
} from "./currentHeatingSchema";
import { estimateConsumptionByEnergyType } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/lib/estimateConsumptionByEnergyType";
import { getEnergyPriceFromDB } from "@/app/(main)/[projectId]/lib/energy/getEnergyPriceFromDB";
import { GAS_SUBSCRIPTION } from "@/config/constants";
import { adjustConsumptionForEfficiency } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/lib/adjustConsumptionForEfficiency";

interface SaveCurrentHeatingDataParams {
  projectId: string
  data: CurrentHeatingData
}

export const saveCurrentHeatingData = async ({
  projectId,
  data
}: SaveCurrentHeatingDataParams): Promise<ProjectChauffageActuel> => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  const validatedData = currentHeatingSchema.parse(data);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé");
  }

  // If user doesn't know consumption, estimate it based on housing characteristics
  if (!validatedData.connait_consommation) {
    // Récupérer les données du logement depuis l'étape 1 (ProjectLogement)
    const logement = await prisma.projectLogement.findUnique({
      where: { projectId },
    });

    if (!logement) {
      throw new Error(
        "Les informations du logement sont requises. Veuillez d'abord remplir l'étape Logement."
      );
    }

    // Housing data from Step 1
    const housingData = {
      surface_habitable: logement.surface_habitable,
      annee_construction: logement.annee_construction,
      qualite_isolation: logement.qualite_isolation,
      nombre_occupants: logement.nombre_occupants,
      code_postal: logement.code_postal, // Code postal pour zone climatique
    };

    // Estimate consumption based on energy type (avec ajustement climatique)
    const estimationInitiale = estimateConsumptionByEnergyType({
      housing: housingData,
      energyType: validatedData.type_chauffage
    });

    // Ajuster l'estimation selon le rendement réel de l'installation (âge + état)
    const { adjustedConsumption, efficiency } = adjustConsumptionForEfficiency({
      typeChauffage: validatedData.type_chauffage,
      ageInstallation: validatedData.age_installation,
      etatInstallation: validatedData.etat_installation,
      consumptionValue: estimationInitiale.value
    });

    // Utiliser la consommation ajustée
    const estimation = {
      ...estimationInitiale,
      value: adjustedConsumption,
    };

    // Get current energy price from cache (monthly refresh)
    let energyPrice: number;

    switch (validatedData.type_chauffage) {
      case "Fioul":
        energyPrice = await getEnergyPriceFromDB("fioul");
        validatedData.conso_fioul_litres = estimation.value;
        validatedData.prix_fioul_litre = energyPrice;
        break;
      case "Gaz":
        energyPrice = await getEnergyPriceFromDB("gaz");
        validatedData.conso_gaz_kwh = estimation.value;
        validatedData.prix_gaz_kwh = energyPrice;
        // Assigner l'abonnement gaz par défaut (moyenne nationale)
        validatedData.abonnement_gaz = GAS_SUBSCRIPTION.ANNUAL_AVERAGE;
        break;
      case "GPL":
        energyPrice = await getEnergyPriceFromDB("gpl");
        validatedData.conso_gpl_kg = estimation.value;
        validatedData.prix_gpl_kg = energyPrice;
        break;
      case "Pellets":
      case "Bois":
        energyPrice = await getEnergyPriceFromDB("bois");
        if (validatedData.type_chauffage === "Pellets") {
          validatedData.conso_pellets_kg = estimation.value;
          validatedData.prix_pellets_kg = energyPrice;
        } else {
          validatedData.conso_bois_steres = estimation.value;
          validatedData.prix_bois_stere = energyPrice;
        }
        break;
      case "Electrique":
        energyPrice = await getEnergyPriceFromDB("electricite");
        validatedData.conso_elec_kwh = estimation.value;
        validatedData.prix_elec_kwh = energyPrice;
        break;
      case "PAC Air/Air":
      case "PAC Air/Eau":
      case "PAC Eau/Eau":
        energyPrice = await getEnergyPriceFromDB("electricite");
        validatedData.conso_pac_kwh = estimation.value;
        validatedData.prix_elec_kwh = energyPrice;
        // Set a default COP for existing PACs (estimated average)
        validatedData.cop_actuel = 2.5;
        break;
    }
  }

  const chauffageActuel = await prisma.projectChauffageActuel.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  });

  // Update currentStep from 1 to 2 (chauffage-actuel is now step 1)
  if (project.currentStep === 1) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 2 },
    });
  }

  return chauffageActuel;
};
