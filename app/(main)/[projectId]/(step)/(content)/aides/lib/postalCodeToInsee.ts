"use server";

/**
 * Convertit un code postal français en code INSEE
 *
 * Utilise l'API officielle de géocoding du gouvernement français
 * https://geo.api.gouv.fr/decoupage-administratif/communes
 *
 * Un code postal peut correspondre à plusieurs communes (donc plusieurs codes INSEE).
 * Par défaut, on retourne le premier résultat (commune la plus peuplée).
 *
 * @param codePostal - Code postal français (5 chiffres)
 * @returns Code INSEE de la commune
 * @throws Error si le code postal est invalide ou si l'API échoue
 */
export const postalCodeToInsee = async (
  codePostal: string
): Promise<string> => {
  // Valider le format du code postal
  if (!/^\d{5}$/.test(codePostal)) {
    throw new Error(
      `Code postal invalide: ${codePostal}. Format attendu: 5 chiffres`
    );
  }

  try {
    // Appeler l'API geo.api.gouv.fr
    const url = `https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=code,nom,population&format=json&geometry=centre`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erreur API geo.gouv.fr: ${response.status} ${response.statusText}`
      );
    }

    const communes = (await response.json()) as Array<{
      code: string;
      nom: string;
      population?: number;
    }>;

    if (!communes || communes.length === 0) {
      throw new Error(
        `Aucune commune trouvée pour le code postal ${codePostal}`
      );
    }

    // Si plusieurs communes, trier par population décroissante et prendre la première
    const communesSorted = communes.sort((a, b) => {
      const popA = a.population ?? 0;
      const popB = b.population ?? 0;
      return popB - popA;
    });

    const commune = communesSorted[0];

    return commune.code;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la conversion du code postal ${codePostal}:`,
      error
    );

    if (error instanceof Error) {
      throw new Error(
        `Impossible de convertir le code postal ${codePostal}: ${error.message}`
      );
    }

    throw new Error(
      `Erreur inconnue lors de la conversion du code postal ${codePostal}`
    );
  }
};
