/**
 * Type de pompe à chaleur (PAC)
 */
export enum PacType {
  /** Pompe à chaleur Air/Air (chauffage uniquement) */
  AIR_AIR = "Air/Air",

  /** Pompe à chaleur Air/Eau (chauffage + option ECS) */
  AIR_EAU = "Air/Eau",

  /** Pompe à chaleur Eau/Eau géothermique (chauffage + option ECS) */
  EAU_EAU = "Eau/Eau",
}
