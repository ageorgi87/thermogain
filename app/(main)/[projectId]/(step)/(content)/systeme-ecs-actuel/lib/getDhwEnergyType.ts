import { TypeEcs } from "@/types/typeEcs"
import { EnergyType } from "@/types/energyType"

/**
 * Maps ECS type to energy type for price lookup
 * Used to determine which default price to show from cache table
 */
export const getDhwEnergyType = (typeEcs: TypeEcs): EnergyType => {
  switch (typeEcs) {
    case TypeEcs.BALLON_ELECTRIQUE:
    case TypeEcs.THERMODYNAMIQUE:
    case TypeEcs.SOLAIRE: // Appoint électrique
      return EnergyType.ELECTRICITE
    case TypeEcs.CHAUFFE_EAU_GAZ:
      return EnergyType.GAZ
  }
}
