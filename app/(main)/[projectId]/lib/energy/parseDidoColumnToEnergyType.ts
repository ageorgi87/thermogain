/**
 * Parse le nom de colonne de l'API DIDO pour déterminer le type d'énergie
 */

export type DidoEnergyType = 'ELECTRICITE' | 'GAZ' | 'BOIS' | 'PETROLEUM'

export const parseDidoColumnToEnergyType = (priceColumnName: string): DidoEnergyType => {
  if (priceColumnName.includes('ELE')) {
    return 'ELECTRICITE'
  } else if (priceColumnName.includes('GAZ')) {
    return 'GAZ'
  } else if (priceColumnName.includes('BOIS')) {
    return 'BOIS'
  } else {
    // Fioul, GPL, autres produits pétroliers
    return 'PETROLEUM'
  }
}
