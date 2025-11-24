import { ProjectData } from "./types"
import { calculateAdjustedCOP } from "@/lib/copAdjustments"

/**
 * Calcule la consommation annuelle de la PAC en kWh
 * Prend en compte les ajustements du COP selon :
 * - La température de départ
 * - Le type d'émetteurs
 * - La zone climatique
 *
 * @param data Données du projet
 * @returns Consommation PAC en kWh/an
 */
export function calculatePacConsumptionKwh(data: ProjectData): number {
  // Get current energy consumption in kWh equivalent
  let currentEnergyKwh = 0

  switch (data.type_chauffage) {
    case "Fioul":
      currentEnergyKwh = (data.conso_fioul_litres || 0) * 10 // 1L fioul ≈ 10 kWh
      break
    case "Gaz":
      currentEnergyKwh = data.conso_gaz_kwh || 0
      break
    case "GPL":
      currentEnergyKwh = (data.conso_gpl_kg || 0) * 12.8 // 1kg GPL ≈ 12.8 kWh
      break
    case "Pellets":
      currentEnergyKwh = (data.conso_pellets_kg || 0) * 4.8 // 1kg pellets ≈ 4.8 kWh
      break
    case "Bois":
      currentEnergyKwh = (data.conso_bois_steres || 0) * 2000 // 1 stère ≈ 2000 kWh
      break
    case "Electrique":
      currentEnergyKwh = data.conso_elec_kwh || 0
      break
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      // Si c'est déjà une PAC, utiliser sa consommation directement
      currentEnergyKwh = data.conso_pac_kwh || 0
      break
  }

  // Calculate adjusted COP based on all factors
  const copAjuste = calculateAdjustedCOP(
    data.cop_estime,
    data.temperature_depart,
    data.emetteurs,
    data.code_postal
  )

  // Calculate PAC consumption using adjusted COP
  const pacConsumptionKwh = currentEnergyKwh / copAjuste

  console.log(`📊 Consommation PAC:`)
  console.log(`   - Besoins thermiques: ${Math.round(currentEnergyKwh).toLocaleString()} kWh/an`)
  console.log(`   - COP ajusté: ${copAjuste.toFixed(2)}`)
  console.log(`   → Consommation électrique PAC: ${Math.round(pacConsumptionKwh).toLocaleString()} kWh/an`)

  return Math.round(pacConsumptionKwh)
}
