export interface ProjectData {
  // Current Heating
  heatingType: string
  fuelConsumptionLiters?: number
  fuelPricePerLiter?: number
  gasConsumptionKwh?: number
  gasPricePerKwh?: number
  lpgConsumptionKg?: number
  lpgPricePerKg?: number
  pelletsConsumptionKg?: number
  pelletsPricePerKg?: number
  woodConsumptionSteres?: number
  woodPricePerStere?: number
  electricityConsumptionKwh?: number
  electricityPricePerKwh?: number
  currentCop?: number
  heatPumpConsumptionKwh?: number

  // Fixed costs and subscriptions (November 2024)
  currentSubscribedPowerKva?: number  // Current electrical subscribed power (kVA)
  gasSubscription?: number            // Annual gas subscription (€/year) - for heatingType = "Gaz"
  annualMaintenance?: number          // Annual maintenance cost current system (€/year)
  dhwIntegrated?: boolean             // DHW integrated in current heating? (mixed boiler)

  // Separate DHW (if dhwIntegrated = false) - December 2024
  dhwSystemType?: string              // DHW system type ("Ballon électrique", "Thermodynamique", etc.)
  dhwConsumptionKwh?: number          // DHW annual consumption (kWh/year)
  dhwEnergyPricePerKwh?: number       // DHW energy price (€/kWh)
  dhwAnnualMaintenance?: number       // DHW annual maintenance (€/year)

  // Heat Pump Project
  heatPumpType: string
  heatPumpPowerKw: number
  estimatedCop: number // Nominal COP from manufacturer
  adjustedCop: number  // Actual adjusted COP (emitters, climate)
  emitters: string     // Emitters type (automatically determines flow temperature)
  heatPumpLifespanYears: number

  // Heat pump fixed costs (November 2024)
  heatPumpSubscribedPowerKva?: number   // Electrical subscribed power for heat pump (kVA)
  annualMaintenanceCost?: number        // Annual heat pump maintenance cost (€/year)
  heatPumpElectricityPricePerKwh?: number  // Electricity price for heat pump (€/kWh), if different from current price

  // DHW management by heat pump (December 2024)
  withDhwManagement?: boolean          // Will the heat pump manage DHW?
  dhwCop?: number                      // Heat pump COP for DHW production (≈ estimatedCop × 0.85)

  // Housing (for DHW estimation + DPE energy needs) - December 2024
  numberOfOccupants?: number           // Number of occupants (for DHW needs estimation)
  dpeRating?: string                   // DPE rating (A-G) - for theoretical needs calculation
  livingArea?: number                  // Living area (m²) - for theoretical DPE needs calculation

  // Postal code for climate adjustment COP
  postalCode?: string

  // Costs
  totalCost: number

  // Financial aid
  remainingCost: number

  // Evolution rates (DEPRECATED - November 2024)
  // Evolution rates are now automatically calculated via Mean Reversion model
  // from DIDO-SDES API. These fields are kept for compatibility but no longer used.
  evolution_prix_fioul?: number
  evolution_prix_gaz?: number
  evolution_prix_gpl?: number
  evolution_prix_bois?: number
  evolution_prix_electricite?: number

  // Financing
  financingMode?: string
  loanAmount?: number
  interestRate?: number
  loanDurationMonths?: number
  downPayment?: number
}
