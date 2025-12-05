import { QualiteIsolation } from "@/types/isolation"

export interface HousingCharacteristics {
  surface_habitable: number
  annee_construction: number
  qualite_isolation: QualiteIsolation
  nombre_occupants: number
  code_postal?: string
}
