"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProjectChauffageActuel } from "@prisma/client";
import {
  currentHeatingSchema,
  type CurrentHeatingData,
} from "./currentHeatingSchema";
import { estimateConsumptionByEnergyType } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/lib/estimateConsumptionByEnergyType";
import { getCurrentEnergyPriceFromDB } from "@/app/(main)/[projectId]/lib/getErnegyData/getCurrentEnergyPriceFromDB";
import { GAS_SUBSCRIPTION } from "@/config/constants";
import { calculateBoilerEfficiency } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/lib/calculateBoilerEfficiency";
import { REFERENCE_EFFICIENCY } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/config/heatingEfficiencyData";
import { EnergyType } from "@/types/energyType";
import { QualiteIsolation } from "@/types/isolation";

interface SaveCurrentHeatingDataParams {
  projectId: string;
  data: CurrentHeatingData;
}

export const saveCurrentHeatingData = async ({
  projectId,
  data,
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
      qualite_isolation: logement.qualite_isolation as QualiteIsolation,
      nombre_occupants: logement.nombre_occupants,
      code_postal: logement.code_postal, // Code postal pour zone climatique
    };

    // Estimate consumption based on energy type (avec ajustement climatique)
    const estimationInitiale = estimateConsumptionByEnergyType({
      housing: housingData,
      energyType: validatedData.type_chauffage,
    });

    // Ajuster l'estimation selon le rendement réel de l'installation (âge + état)
    // Inline: Calculer le rendement réel puis ajuster la consommation
    const efficiency = calculateBoilerEfficiency(
      validatedData.type_chauffage,
      validatedData.age_installation,
      validatedData.etat_installation
    );

    const refEfficiency = REFERENCE_EFFICIENCY[validatedData.type_chauffage] || 0.75;
    const adjustedConsumption = Math.round(
      estimationInitiale.value * (refEfficiency / efficiency)
    );

    // Utiliser la consommation ajustée
    const estimation = {
      ...estimationInitiale,
      value: adjustedConsumption,
    };

    // Get current energy price from cache (monthly refresh)
    let energyPrice: number;

    switch (validatedData.type_chauffage) {
      case "Fioul":
        energyPrice = await getCurrentEnergyPriceFromDB(EnergyType.FIOUL);
        validatedData.conso_fioul_litres = estimation.value;
        validatedData.prix_fioul_litre = energyPrice;
        break;
      case "Gaz":
        energyPrice = await getCurrentEnergyPriceFromDB(EnergyType.GAZ);
        validatedData.conso_gaz_kwh = estimation.value;
        validatedData.prix_gaz_kwh = energyPrice;
        // Assigner l'abonnement gaz par défaut (moyenne nationale)
        validatedData.abonnement_gaz = GAS_SUBSCRIPTION.ANNUAL_AVERAGE;
        break;
      case "GPL":
        energyPrice = await getCurrentEnergyPriceFromDB(EnergyType.GPL);
        validatedData.conso_gpl_kg = estimation.value;
        validatedData.prix_gpl_kg = energyPrice;
        break;
      case "Pellets":
      case "Bois":
        energyPrice = await getCurrentEnergyPriceFromDB(EnergyType.BOIS);
        if (validatedData.type_chauffage === "Pellets") {
          validatedData.conso_pellets_kg = estimation.value;
          validatedData.prix_pellets_kg = energyPrice;
        } else {
          validatedData.conso_bois_steres = estimation.value;
          validatedData.prix_bois_stere = energyPrice;
        }
        break;
      case "Electrique":
        energyPrice = await getCurrentEnergyPriceFromDB(EnergyType.ELECTRICITE);
        validatedData.conso_elec_kwh = estimation.value;
        validatedData.prix_elec_kwh = energyPrice;
        break;
      case "PAC Air/Air":
      case "PAC Air/Eau":
      case "PAC Eau/Eau":
        energyPrice = await getCurrentEnergyPriceFromDB(EnergyType.ELECTRICITE);
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
