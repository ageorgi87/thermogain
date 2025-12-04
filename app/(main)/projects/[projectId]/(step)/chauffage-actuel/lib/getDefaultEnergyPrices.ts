import { getCachedEnergyPrice } from "@/lib/energy/priceCache/getCachedEnergyPrice"

/**
 * Récupère les prix par défaut de l'énergie depuis le cache
 * Ces prix sont utilisés comme valeurs par défaut dans le formulaire
 */
export const getDefaultEnergyPrices = async () => {
  try {
    const [fioul, gaz, gpl, bois, electricite] = await Promise.all([
      getCachedEnergyPrice("fioul"),
      getCachedEnergyPrice("gaz"),
      getCachedEnergyPrice("gpl"),
      getCachedEnergyPrice("bois"),
      getCachedEnergyPrice("electricite"),
    ])

    return {
      fioul, // €/litre
      gaz, // €/kWh
      gpl, // €/kg
      bois, // €/kg (pellets)
      electricite, // €/kWh
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des prix par défaut:", error)

    // Valeurs par défaut en cas d'erreur
    return {
      fioul: 1.15,
      gaz: 0.1,
      gpl: 1.6,
      bois: 0.26,
      electricite: 0.2516,
    }
  }
}
