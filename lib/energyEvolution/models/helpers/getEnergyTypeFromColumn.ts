/**
 * Détermine le type d'énergie à partir du nom de colonne de l'API DIDO
 */

export type EnergyType = 'ELECTRICITE' | 'GAZ' | 'BOIS' | 'PETROLEUM'

export const getEnergyTypeFromColumn = (priceColumnName: string): EnergyType => {
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
