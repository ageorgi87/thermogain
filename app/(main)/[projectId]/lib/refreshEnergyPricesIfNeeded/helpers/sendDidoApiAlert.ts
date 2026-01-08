"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envoie un email d'alerte simple quand l'API DIDO n'a pas fourni de données depuis 30+ jours
 */
export const sendDidoApiAlert = async (
  daysSinceLastUpdate: number
): Promise<void> => {
  try {
    await resend.emails.send({
      from: "ThermoGain Alerts <contact@thermogain.fr>",
      to: "contact@thermogain.fr",
      subject: `[ALERTE] API DIDO - Pas de mise à jour depuis ${daysSinceLastUpdate} jours`,
      text: `L'API DIDO n'a pas fourni de nouvelles données de prix énergétiques depuis ${daysSinceLastUpdate} jours.

Dernière mise à jour reçue : il y a ${daysSinceLastUpdate} jours

Les calculs continuent d'utiliser les données en cache, mais elles deviennent de plus en plus obsolètes.

Action recommandée : Vérifier le statut de l'API DIDO sur https://data.statistiques.developpement-durable.gouv.fr

---
Alerte automatique ThermoGain`,
    });

    console.log(
      `[sendDidoApiAlert] Email d'alerte envoyé : ${daysSinceLastUpdate} jours sans mise à jour`
    );
  } catch (error) {
    console.error(
      "[sendDidoApiAlert] Erreur lors de l'envoi de l'email d'alerte:",
      error
    );
    // Ne pas throw : l'échec d'envoi d'email ne doit pas bloquer l'application
  }
};
