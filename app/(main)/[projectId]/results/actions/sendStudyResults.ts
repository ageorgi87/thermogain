"use server";

import { prisma } from "@/lib/prisma";
import { resend, EMAIL_FROM } from "@/email/lib/resend";
import { StudyResultsEmail } from "@/email/templates/StudyResultsEmail";
import { render } from "@react-email/render";

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
export const sendStudyResults = async ({
  projectId,
  userId,
  recipientEmail,
}: SendStudyResultsParams): Promise<SendStudyResultsResponse> => {
  try {
    // 1. Récupérer uniquement les données nécessaires pour l'email
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId, // Vérifier que l'utilisateur est propriétaire
      },
      select: {
        name: true,
        completed: true,
        recipientEmails: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            company: true,
            siret: true,
            address: true,
            phone: true,
            city: true,
            postalCode: true,
            website: true,
          },
        },
        currentHeating: {
          select: {
            heatingType: true,
          },
        },
        heatPump: {
          select: {
            heatPumpType: true,
          },
        },
        costs: {
          select: {
            totalCost: true,
          },
        },
        financialAid: {
          select: {
            totalAid: true,
          },
        },
        results: {
          select: {
            annualSavings: true,
            paybackPeriod: true,
            netBenefitLifetime: true,
          },
        },
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
    } else if (project.user?.email) {
      emailsTo = [project.user.email];
    }

    if (emailsTo.length === 0) {
      return {
        success: false,
        error: "Aucun email destinataire configuré pour ce projet",
      };
    }

    // 4. Récupérer les résultats depuis la DB
    if (!project.results) {
      return {
        success: false,
        error: "Les résultats du projet n'ont pas encore été calculés",
      };
    }
    const results = project.results;

    // 5. Calculer l'investissement net
    const investmentTotal = project.costs?.totalCost || 0;
    const aidesTotal = project.financialAid?.totalAid || 0;
    const investmentNet = investmentTotal - aidesTotal;

    // 6. Préparer les données pour l'email
    const emailData = {
      recipientFirstName: undefined, // Multi-destinataires
      professionalName:
        project.user?.firstName && project.user?.lastName
          ? `${project.user.firstName} ${project.user.lastName}`
          : project.user?.firstName || undefined,
      professionalCompany: project.user?.company || undefined,
      professionalSiret: project.user?.siret || undefined,
      professionalAddress: project.user?.address || undefined,
      professionalPhone: project.user?.phone || undefined,
      professionalCity: project.user?.city || undefined,
      professionalPostalCode: project.user?.postalCode || undefined,
      professionalWebsite: project.user?.website || undefined,
      projectName: project.name,
      currentHeatingType:
        project.currentHeating?.heatingType || "système actuel",
      pacType: project.heatPump?.heatPumpType || "PAC",
      investmentTotal: Math.round(investmentTotal),
      aidesTotal: Math.round(aidesTotal),
      investmentNet: Math.round(investmentNet),
      annualSavings: Math.round(results.annualSavings),
      roi: results.paybackPeriod || 0,
      benefitNet17Years: Math.round(results.netBenefitLifetime),
    };

    // 8. Rendre le template email
    const emailHtml = await render(StudyResultsEmail(emailData));

    // 9. Envoyer l'email via Resend à tous les destinataires
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

    // 10. Mettre à jour le timestamp du projet
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
};