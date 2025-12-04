/**
 * Configuration centralisée des étapes du wizard de projet PAC
 */
export const WIZARD_STEPS = [
  {
    key: "informations",
    title: "Informations du projet",
    description: "Nommez votre projet et renseignez les destinataires",
    explanation:
      "Le nom du projet vous permet de le retrouver facilement dans votre liste. Les adresses email recevront automatiquement le rapport de simulation une fois l'analyse terminée.",
  },
  {
    key: "logement",
    title: "Votre logement",
    description: "Caractéristiques de votre habitation",
    explanation:
      "Les caractéristiques de votre logement (surface, isolation, année de construction) sont essentielles pour estimer avec précision vos besoins en chauffage, dimensionner correctement la pompe à chaleur, et calculer les économies potentielles.",
  },
  {
    key: "chauffage-actuel",
    title: "Chauffage actuel",
    description: "Votre système de chauffage existant",
    explanation:
      "Ces informations nous permettent d'évaluer votre consommation énergétique actuelle, son coût annuel, et le rendement de votre installation. Cette analyse servira de référence pour comparer les économies potentielles avec une pompe à chaleur.",
  },
  {
    key: "projet-pac",
    title: "Projet de pompe à chaleur",
    description: "Caractéristiques de la PAC envisagée",
    explanation:
      "Ces informations permettent de calculer la consommation électrique de la pompe à chaleur, les coûts d'abonnement, et d'estimer les économies d'énergie par rapport à votre système actuel.",
  },
  {
    key: "couts",
    title: "Coûts de l'installation",
    description: "Détaillez les différents coûts de votre projet",
    explanation:
      "Le détail des coûts (équipement, installation, travaux annexes) permet de calculer votre investissement total et d'évaluer la rentabilité de votre projet sur le long terme.",
  },
  {
    key: "aides",
    title: "Aides financières",
    description: "Calculez les aides dont vous pouvez bénéficier",
    explanation:
      "Les aides financières (MaPrimeRénov', CEE, etc.) peuvent considérablement réduire le coût d'installation de votre pompe à chaleur. Ces informations permettent d'estimer le montant des aides auxquelles vous êtes éligible.",
  },
  {
    key: "financement",
    title: "Plan de financement",
    description: "Mode de financement et options de paiement",
    explanation:
      "Le plan de financement vous permet de définir comment vous allez financer l'installation de votre pompe à chaleur. Cela affecte les calculs de retour sur investissement et les projections financières à long terme.",
  },
] as const;

/**
 * Type pour les clés d'étapes
 */
export type WizardStepKey = (typeof WIZARD_STEPS)[number]["key"];

/**
 * Trouve les informations d'une étape par sa clé
 */
export const getStepInfo = (key: WizardStepKey) => {
  return WIZARD_STEPS.find((step) => step.key === key);
};

/**
 * Retourne la clé de l'étape pour un currentStep donné (1-based)
 * @param currentStep - Le numéro d'étape actuel du projet (1-based)
 * @returns La clé de l'étape ou undefined si invalide
 */
export const getStepKey = (currentStep: number): string | undefined => {
  const index = currentStep - 1;
  return WIZARD_STEPS[index]?.key;
};

/**
 * Retourne le nombre total d'étapes du wizard
 */
export const getTotalSteps = (): number => {
  return WIZARD_STEPS.length;
};

/**
 * Retourne le numéro d'étape (1-based) pour un currentStep donné (1-based)
 * @param currentStep - Le numéro d'étape actuel du projet (1-based)
 * @returns Le numéro d'étape à afficher (1-based)
 */
export const getStepNumber = (currentStep: number): number => {
  return Math.min(currentStep, getTotalSteps());
};
