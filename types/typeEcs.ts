/**
 * Enum for domestic hot water (DHW/ECS) system types
 * Used in step "ecs-actuel" - only when separate DHW system exists
 */
export enum TypeEcs {
  BALLON_ELECTRIQUE = "Ballon électrique",
  THERMODYNAMIQUE = "Chauffe-eau thermodynamique",
  CHAUFFE_EAU_GAZ = "Chauffe-eau gaz",
  SOLAIRE = "Chauffe-eau solaire",
}
