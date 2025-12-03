"use server";

import { prisma } from "@/lib/prisma";
import { resend, EMAIL_FROM } from "@/email/lib/resend";
import { StudyResultsEmail } from "@/email/templates/study-results-email";
import { render } from "@react-email/render";
import { calculateAllResults } from "@/app/(main)/projects/[projectId]/calculations";
import { type ProjectData } from "@/app/(main)/projects/[projectId]/calculations/types";

interface SendStudyResultsParams {
  projectId: string;
  userId: string;
  recipientEmail?: string; // Optional: override recipient email (default: user email)
}

interface SendStudyResultsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envoie les résultats d'étude par email au client
 *
 * @param projectId - ID du projet
 * @param userId - ID de l'utilisateur (pour vérification de propriété)
 * @param recipientEmail - Email du destinataire (optionnel, par défaut l'email du user)
 * @returns Résultat de l'envoi
 */
export async function sendStudyResults({
  projectId,
  userId,
  recipientEmail,
}: SendStudyResultsParams): Promise<SendStudyResultsResponse> {
  try {
    // 1. Récupérer le projet complet avec toutes les relations
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId, // Vérifier que l'utilisateur est propriétaire
      },
      include: {
        user: true,
        logement: true,
        chauffageActuel: true,
        projetPac: true,
        couts: true,
        aides: true,
        financement: true,
        evolutions: true,
      },
    });

    if (!project) {
      return {
        success: false,
        error: "Projet introuvable ou vous n'avez pas les droits d'accès",
      };
    }

    // 2. Vérifier que le projet est complet
    if (!project.completed) {
      return {
        success: false,
        error: "Le projet doit être complété avant d'envoyer les résultats",
      };
    }

    // 3. Déterminer les emails destinataires
    // Priorité : recipientEmail override > recipientEmails du projet > email du user
    let emailsTo: string[] = [];

    if (recipientEmail) {
      emailsTo = [recipientEmail];
    } else if (project.recipientEmails && project.recipientEmails.length > 0) {
      emailsTo = project.recipientEmails;
    } else if (project.user.email) {
      emailsTo = [project.user.email];
    }

    if (emailsTo.length === 0) {
      return {
        success: false,
        error: "Aucun email destinataire configuré pour ce projet",
      };
    }

    // 4. Construire l'objet ProjectData pour les calculs
    const projectData: ProjectData = {
      // Chauffage actuel - consommations spécifiques par type d'énergie
      type_chauffage: project.chauffageActuel?.type_chauffage || "",
      conso_fioul_litres:
        project.chauffageActuel?.conso_fioul_litres || undefined,
      prix_fioul_litre: project.chauffageActuel?.prix_fioul_litre || undefined,
      conso_gaz_kwh: project.chauffageActuel?.conso_gaz_kwh || undefined,
      prix_gaz_kwh: project.chauffageActuel?.prix_gaz_kwh || undefined,
      conso_gpl_kg: project.chauffageActuel?.conso_gpl_kg || undefined,
      prix_gpl_kg: project.chauffageActuel?.prix_gpl_kg || undefined,
      conso_pellets_kg: project.chauffageActuel?.conso_pellets_kg || undefined,
      prix_pellets_kg: project.chauffageActuel?.prix_pellets_kg || undefined,
      conso_bois_steres:
        project.chauffageActuel?.conso_bois_steres || undefined,
      prix_bois_stere: project.chauffageActuel?.prix_bois_stere || undefined,
      conso_elec_kwh: project.chauffageActuel?.conso_elec_kwh || undefined,
      prix_elec_kwh: project.chauffageActuel?.prix_elec_kwh || undefined,
      cop_actuel: project.chauffageActuel?.cop_actuel || undefined,
      conso_pac_kwh: project.chauffageActuel?.conso_pac_kwh || undefined,

      // Coûts fixes chauffage actuel
      puissance_souscrite_actuelle:
        project.chauffageActuel?.puissance_souscrite_actuelle || undefined,
      abonnement_gaz: project.chauffageActuel?.abonnement_gaz || undefined,
      entretien_annuel: project.chauffageActuel?.entretien_annuel || undefined,

      // Projet PAC
      type_pac: project.projetPac?.type_pac || "",
      puissance_pac_kw: project.projetPac?.puissance_pac_kw || 8,
      cop_estime: project.projetPac?.cop_estime || 3.5,
      temperature_depart: project.projetPac?.temperature_depart || 45,
      emetteurs: project.projetPac?.emetteurs || "Radiateurs basse température",
      duree_vie_pac: project.projetPac?.duree_vie_pac || 17,

      // Coûts fixes PAC
      puissance_souscrite_pac:
        project.projetPac?.puissance_souscrite_pac || undefined,
      entretien_pac_annuel:
        project.projetPac?.entretien_pac_annuel || undefined,
      prix_elec_pac: project.projetPac?.prix_elec_kwh || undefined,

      // Code postal pour ajustement climatique COP
      code_postal: project.logement?.code_postal || undefined,

      // Coûts
      cout_total: project.couts?.cout_total || 0,

      // Aides
      reste_a_charge:
        (project.couts?.cout_total || 0) - (project.aides?.total_aides || 0),

      // Évolutions (DEPRECATED mais conservés pour compatibilité)
      evolution_prix_fioul: getEvolutionForEnergyType(
        project.chauffageActuel?.type_chauffage || "",
        project.evolutions
      ),
      evolution_prix_gaz: project.evolutions?.evolution_prix_gaz || undefined,
      evolution_prix_gpl: project.evolutions?.evolution_prix_gpl || undefined,
      evolution_prix_bois: project.evolutions?.evolution_prix_bois || undefined,
      evolution_prix_electricite:
        project.evolutions?.evolution_prix_electricite || undefined,

      // Financement
      mode_financement: project.financement?.mode_financement || undefined,
      apport_personnel: project.financement?.apport_personnel || undefined,
      montant_credit: project.financement?.montant_credit || undefined,
      taux_interet: project.financement?.taux_interet || undefined,
      duree_credit_mois: project.financement?.duree_credit_mois || undefined,
    };

    // 5. Calculer les résultats financiers
    const results = calculateAllResults(projectData);

    // 6. Construire l'URL des résultats
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resultsUrl = `${baseUrl}/projects/${projectId}/results`;

    // 7. Déterminer les informations du professionnel
    const professionalName =
      project.user.firstName && project.user.lastName
        ? `${project.user.firstName} ${project.user.lastName}`
        : project.user.firstName || project.user.name || undefined;
    const professionalCompany = project.user.company || undefined;
    const professionalSiret = project.user.siret || undefined;
    const professionalAddress = project.user.address || undefined;
    const professionalPhone = project.user.phone || undefined;
    const professionalCity = project.user.city || undefined;
    const professionalPostalCode = project.user.postalCode || undefined;
    const professionalWebsite = project.user.website || undefined;

    // 8. Préparer les données communes pour l'email
    // Note: Le prénom ne sera pas inclus car on envoie à plusieurs destinataires potentiels
    const recipientFirstName = undefined;

    // 9. Préparer les données pour l'email
    const investmentTotal = project.couts?.cout_total || 0;
    const aidesTotal = project.aides?.total_aides || 0;
    const investmentNet = investmentTotal - aidesTotal;

    const emailData = {
      recipientFirstName,
      professionalName,
      professionalCompany,
      professionalSiret,
      professionalAddress,
      professionalPhone,
      professionalCity,
      professionalPostalCode,
      professionalWebsite,
      projectName: project.name,
      currentHeatingType:
        project.chauffageActuel?.type_chauffage || "système actuel",
      pacType: project.projetPac?.type_pac || "PAC",
      investmentTotal: Math.round(investmentTotal),
      aidesTotal: Math.round(aidesTotal),
      investmentNet: Math.round(investmentNet),
      annualSavings: Math.round(results.economiesAnnuelles),
      roi: results.paybackPeriod || 0,
      benefitNet17Years: Math.round(results.netBenefitLifetime),
      resultsUrl,
    };

    // 10. Rendre le template email
    const emailHtml = await render(StudyResultsEmail(emailData));

    // 11. Envoyer l'email via Resend à tous les destinataires
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: emailsTo,
      subject: "Votre étude de rentabilité pompe à chaleur",
      html: emailHtml,
      // Optionnel : ajouter des tags pour tracking
      tags: [
        {
          name: "type",
          value: "study-results",
        },
        {
          name: "project_id",
          value: projectId,
        },
      ],
    });

    if (error) {
      console.error("[sendStudyResults] Resend API error:", error);
      return {
        success: false,
        error: "Échec de l'envoi de l'email. Veuillez réessayer.",
      };
    }

    // 12. Logger l'envoi en base de données (optionnel mais recommandé)
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          // Vous pouvez ajouter un champ resultsSentAt dans le schéma Prisma
          // resultsSentAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (dbError) {
      // Non bloquant - silently ignore timestamp update failures
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("[sendStudyResults] Unexpected error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors de l'envoi",
    };
  }
}

/**
 * Helper: Récupère le taux d'évolution selon le type de chauffage
 */
function getEvolutionForEnergyType(
  typeChauffage: string,
  evolutions: {
    evolution_prix_fioul?: number | null;
    evolution_prix_gaz?: number | null;
    evolution_prix_gpl?: number | null;
    evolution_prix_bois?: number | null;
    evolution_prix_electricite: number;
  } | null
): number {
  if (!evolutions) return 5; // Valeur par défaut

  switch (typeChauffage) {
    case "Fioul":
      return evolutions.evolution_prix_fioul || 7.2;
    case "Gaz":
      return evolutions.evolution_prix_gaz || 8.7;
    case "GPL":
      return evolutions.evolution_prix_gpl || 7.2;
    case "Bois":
    case "Pellets":
      return evolutions.evolution_prix_bois || 3.4;
    case "Électricité":
      return evolutions.evolution_prix_electricite || 6.9;
    default:
      return 5;
  }
}
