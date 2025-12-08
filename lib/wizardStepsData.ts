import { WizardStepKey } from "@/types/wizardStepKey";

/**
 * Configuration centralisée des étapes du wizard de projet PAC
 */
export const WIZARD_STEPS = [
  {
    key: WizardStepKey.INFORMATIONS,
    title: "Informations du projet",
    description: "Nommez votre projet et renseignez les destinataires",
    explanation:
      "Le nom du projet vous permet de le retrouver facilement dans votre liste. Les adresses email recevront automatiquement le rapport de simulation une fois l'analyse terminée.",
  },
  {
    key: WizardStepKey.LOGEMENT,
    title: "Votre logement",
    description: "Caractéristiques de votre habitation",
    explanation:
      "Les caractéristiques de votre logement (surface, isolation, année de construction) sont essentielles pour estimer avec précision vos besoins en chauffage, dimensionner correctement la pompe à chaleur, et calculer les économies potentielles.",
  },
  {
    key: WizardStepKey.CHAUFFAGE_ACTUEL,
    title: "Chauffage actuel",
    description: "Votre système de chauffage existant",
    explanation:
      "Ces informations nous permettent d'évaluer votre consommation énergétique actuelle, son coût annuel, et le rendement de votre installation. Cette analyse servira de référence pour comparer les économies potentielles avec une pompe à chaleur.",
  },
  {
    key: WizardStepKey.SYSTEME_ECS_ACTUEL,
    title: "Système d'eau chaude sanitaire actuel",
    description: "Votre système d'eau chaude sanitaire",
    explanation:
      "Ces informations permettent de calculer le coût annuel de votre production d'eau chaude actuelle et de comparer avec la future PAC intégrant l'ECS. Cette étape n'est affichée que si votre système actuel possède une production d'ECS séparée du chauffage.",
  },
  {
    key: WizardStepKey.PROJET_PAC,
    title: "Projet de pompe à chaleur",
    description: "Caractéristiques de la PAC envisagée",
    explanation:
      "Ces informations permettent de calculer la consommation électrique de la pompe à chaleur, les coûts d'abonnement, et d'estimer les économies d'énergie par rapport à votre système actuel.",
  },
  {
    key: WizardStepKey.COUTS,
    title: "Coûts de l'installation",
    description: "Détaillez les différents coûts de votre projet",
    explanation:
      "Le détail des coûts (équipement, installation, travaux annexes) permet de calculer votre investissement total et d'évaluer la rentabilité de votre projet sur le long terme.",
  },
  {
    key: WizardStepKey.AIDES,
    title: "Aides financières",
    description: "Calculez les aides dont vous pouvez bénéficier",
    explanation:
      "Les aides financières (MaPrimeRénov', CEE, etc.) peuvent considérablement réduire le coût d'installation de votre pompe à chaleur. Ces informations permettent d'estimer le montant des aides auxquelles vous êtes éligible.",
  },
  {
    key: WizardStepKey.FINANCEMENT,
    title: "Plan de financement",
    description: "Mode de financement et options de paiement",
    explanation:
      "Le plan de financement vous permet de définir comment vous allez financer l'installation de votre pompe à chaleur. Cela affecte les calculs de retour sur investissement et les projections financières à long terme.",
  },
] as const;

/**
 * Trouve les informations d'une étape par sa clé
 */
export const getStepInfo = (key: WizardStepKey | string) => {
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

/**
 * Retourne la clé de la première étape du wizard
 * @returns La clé de la première étape
 */
export const getFirstStepKey = (): string => {
  return WIZARD_STEPS[0].key;
};

/**
 * Retourne l'index (0-based) d'une étape par sa clé
 * @param stepKey - La clé de l'étape
 * @returns L'index de l'étape ou -1 si non trouvée
 */
export const getStepIndex = (stepKey: string): number => {
  return WIZARD_STEPS.findIndex((s) => s.key === stepKey);
};

/**
 * Retourne la clé de l'étape suivante
 * @param currentStepKey - La clé de l'étape actuelle
 * @returns La clé de l'étape suivante ou undefined si c'est la dernière
 */
export const getNextStepKey = (currentStepKey: string): string | undefined => {
  const currentIndex = getStepIndex(currentStepKey);
  if (currentIndex === -1 || currentIndex >= getTotalSteps() - 1) {
    return undefined;
  }
  return WIZARD_STEPS[currentIndex + 1].key;
};

/**
 * Retourne la clé de l'étape précédente
 * @param currentStepKey - La clé de l'étape actuelle
 * @returns La clé de l'étape précédente ou undefined si c'est la première
 */
export const getPreviousStepKey = (
  currentStepKey: string
): string | undefined => {
  const currentIndex = getStepIndex(currentStepKey);
  if (currentIndex <= 0) {
    return undefined;
  }
  return WIZARD_STEPS[currentIndex - 1].key;
};
