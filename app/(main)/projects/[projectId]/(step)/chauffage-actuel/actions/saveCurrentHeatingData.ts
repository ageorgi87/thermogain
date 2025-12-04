"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  currentHeatingSchema,
  type CurrentHeatingData,
} from "./currentHeatingSchema";
import { estimateConsumptionByEnergyType } from "@/lib/estimation/estimateConsumptionByEnergyType";
import { getCachedEnergyPrice } from "@/lib/energy/priceCache/getCachedEnergyPrice";
import { calculateBoilerEfficiency } from "@/lib/heating/calculateBoilerEfficiency";
import { FUEL_ENERGY_CONTENT } from "@/lib/heating/heatingEfficiencyData";
import { calculateHeatDemand } from "@/lib/heating/calculateHeatDemand";
import { GAS_SUBSCRIPTION } from "@/config/constants";

/**
 * Calcule le rendement estimé d'une installation de chauffage
 * Cette fonction peut être appelée depuis le client pour afficher le rendement en temps réel
 */
export async function calculateEstimatedEfficiency(
  typeChauffage: string,
  ageInstallation: number,
  etatInstallation: "Bon" | "Moyen" | "Mauvais"
): Promise<{
  efficiency: number;
  efficiencyPercent: number;
  explanation: string;
}> {
  const efficiency = calculateBoilerEfficiency(
    typeChauffage,
    ageInstallation,
    etatInstallation
  );

  const efficiencyPercent = Math.round(efficiency * 100);

  let explanation = `Votre ${typeChauffage} de ${ageInstallation} ans `;

  if (etatInstallation === "Bon") {
    explanation += "bien entretenu ";
  } else if (etatInstallation === "Moyen") {
    explanation += "moyennement entretenu ";
  } else {
    explanation += "mal entretenu ";
  }

  explanation += `fonctionne à environ ${efficiencyPercent}% de rendement. `;

  if (efficiency < 0.7) {
    explanation +=
      "⚠️ Ce rendement est faible. Un entretien ou un remplacement permettrait de réaliser des économies importantes.";
  } else if (efficiency < 0.8) {
    explanation +=
      "Ce rendement est dans la moyenne des installations anciennes.";
  } else if (efficiency < 0.9) {
    explanation += "Ce rendement est correct pour une installation de cet âge.";
  } else {
    explanation += "Ce rendement est excellent.";
  }

  return {
    efficiency,
    efficiencyPercent,
    explanation,
  };
}

/**
 * Récupère les prix par défaut de l'énergie depuis le cache
 * Ces prix sont utilisés comme valeurs par défaut dans le formulaire
 */
export async function getDefaultEnergyPrices() {
  try {
    const [fioul, gaz, gpl, bois, electricite] = await Promise.all([
      getCachedEnergyPrice("fioul"),
      getCachedEnergyPrice("gaz"),
      getCachedEnergyPrice("gpl"),
      getCachedEnergyPrice("bois"),
      getCachedEnergyPrice("electricite"),
    ]);

    return {
      fioul, // €/litre
      gaz, // €/kWh
      gpl, // €/kg
      bois, // €/kg (pellets)
      electricite, // €/kWh
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des prix par défaut:", error);

    // Valeurs par défaut en cas d'erreur
    return {
      fioul: 1.15,
      gaz: 0.1,
      gpl: 1.6,
      bois: 0.26,
      electricite: 0.2516,
    };
  }
}

/**
 * Calcule le rendement réel de l'installation actuelle et ajuste la consommation
 * Cette fonction prend en compte l'âge et l'état de l'installation pour calculer
 * le rendement réel, puis ajuste la consommation estimée en conséquence
 */
function adjustConsumptionForEfficiency(
  typeChauffage: string,
  ageInstallation: number,
  etatInstallation: "Bon" | "Moyen" | "Mauvais",
  consumptionValue: number
): { adjustedConsumption: number; efficiency: number } {
  // Calculer le rendement réel de la chaudière
  const efficiency = calculateBoilerEfficiency(
    typeChauffage,
    ageInstallation,
    etatInstallation
  );

  // Pour les systèmes à combustion, ajuster la consommation en fonction du rendement
  // La consommation estimée est basée sur une installation "moyenne"
  // On ajuste donc selon le rendement réel vs rendement moyen

  // Rendement moyen de référence utilisé dans l'estimation initiale
  // (correspond à une installation de ~10 ans en état moyen)
  const REFERENCE_EFFICIENCY: Record<string, number> = {
    Gaz: 0.82,
    Fioul: 0.68,
    GPL: 0.82,
    Pellets: 0.8,
    Bois: 0.8,
    Electrique: 1.0,
    "PAC Air/Air": 1.0,
    "PAC Air/Eau": 1.0,
    "PAC Eau/Eau": 1.0,
  };

  const refEfficiency = REFERENCE_EFFICIENCY[typeChauffage] || 0.75;

  // Si le rendement réel est inférieur au rendement de référence,
  // la consommation réelle sera plus élevée (et vice versa)
  const adjustedConsumption = consumptionValue * (refEfficiency / efficiency);

  console.log(`⚙️ Ajustement pour rendement:`);
  console.log(
    `   Type: ${typeChauffage}, Âge: ${ageInstallation} ans, État: ${etatInstallation}`
  );
  console.log(`   Rendement calculé: ${(efficiency * 100).toFixed(1)}%`);
  console.log(
    `   Consommation estimée initiale: ${consumptionValue.toFixed(0)}`
  );
  console.log(`   Consommation ajustée: ${adjustedConsumption.toFixed(0)}`);

  return {
    adjustedConsumption: Math.round(adjustedConsumption),
    efficiency,
  };
}

export async function saveCurrentHeatingData(
  projectId: string,
  data: CurrentHeatingData
) {
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
    const estimationInitiale = estimateConsumptionByEnergyType(
      housingData,
      validatedData.type_chauffage
    );

    // Ajuster l'estimation selon le rendement réel de l'installation (âge + état)
    const { adjustedConsumption, efficiency } = adjustConsumptionForEfficiency(
      validatedData.type_chauffage,
      validatedData.age_installation,
      validatedData.etat_installation as "Bon" | "Moyen" | "Mauvais",
      estimationInitiale.value
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
        energyPrice = await getCachedEnergyPrice("fioul");
        validatedData.conso_fioul_litres = estimation.value;
        validatedData.prix_fioul_litre = energyPrice;
        break;
      case "Gaz":
        energyPrice = await getCachedEnergyPrice("gaz");
        validatedData.conso_gaz_kwh = estimation.value;
        validatedData.prix_gaz_kwh = energyPrice;
        // Assigner l'abonnement gaz par défaut (moyenne nationale)
        validatedData.abonnement_gaz = GAS_SUBSCRIPTION.ANNUAL_AVERAGE;
        break;
      case "GPL":
        energyPrice = await getCachedEnergyPrice("gpl");
        validatedData.conso_gpl_kg = estimation.value;
        validatedData.prix_gpl_kg = energyPrice;
        break;
      case "Pellets":
      case "Bois":
        energyPrice = await getCachedEnergyPrice("bois");
        if (validatedData.type_chauffage === "Pellets") {
          validatedData.conso_pellets_kg = estimation.value;
          validatedData.prix_pellets_kg = energyPrice;
        } else {
          validatedData.conso_bois_steres = estimation.value;
          validatedData.prix_bois_stere = energyPrice;
        }
        break;
      case "Electrique":
        energyPrice = await getCachedEnergyPrice("electricite");
        validatedData.conso_elec_kwh = estimation.value;
        validatedData.prix_elec_kwh = energyPrice;
        break;
      case "PAC Air/Air":
      case "PAC Air/Eau":
      case "PAC Eau/Eau":
        energyPrice = await getCachedEnergyPrice("electricite");
        validatedData.conso_pac_kwh = estimation.value;
        validatedData.prix_elec_kwh = energyPrice;
        // Set a default COP for existing PACs (estimated average)
        validatedData.cop_actuel = 2.5;
        break;
    }

    console.log(`📊 Résumé de l'estimation:`);
    console.log(
      `   Consommation estimée (ajustée): ${estimation.value} ${estimation.unit}`
    );
    console.log(`   Prix énergétique: ${energyPrice} €`);
    console.log(`   Rendement installation: ${(efficiency * 100).toFixed(1)}%`);
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
}
