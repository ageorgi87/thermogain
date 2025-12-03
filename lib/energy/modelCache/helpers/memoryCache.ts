import type { EnergyEvolutionModel } from "@/lib/energyEvolution/energyEvolutionData"

/**
 * Cache en mémoire pour optimiser les lectures pendant l'exécution
 * Partagé entre toutes les fonctions du module
 */
export const memoryCache: Record<string, { model: EnergyEvolutionModel; timestamp: number }> = {}

/**
 * Flag de pré-chargement en cours
 */
export let isPreloading = false

/**
 * Définit le flag de pré-chargement
 */
export const setIsPreloading = (value: boolean): void => {
  isPreloading = value
}

/**
 * Durée de validité du cache (30 jours)
 */
export const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 jours en millisecondes
