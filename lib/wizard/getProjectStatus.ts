/**
 * Retourne le statut d'un projet en fonction du flag completed
 * @param completed - Le flag indiquant si le projet est terminé
 * @returns "En cours" ou "Terminé"
 */
export const getProjectStatus = (completed: boolean): "En cours" | "Terminé" => {
  return completed ? "Terminé" : "En cours"
}
