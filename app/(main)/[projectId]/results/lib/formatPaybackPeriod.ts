/**
 * Formate une période de retour sur investissement en texte lisible
 * @param period Période en années (peut contenir des décimales)
 * @returns Chaîne formatée (ex: "5 ans et 3 mois")
 */
export const formatPaybackPeriod = (period: number | null): string => {
  if (!period) return "";

  const years = Math.floor(period);
  const months = Math.round((period - years) * 12);

  if (months === 0) {
    return `${years} an${years > 1 ? "s" : ""}`;
  }

  return `${years} an${years > 1 ? "s" : ""} et ${months} mois`;
};
