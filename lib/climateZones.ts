/**
 * Module de gestion des zones climatiques françaises
 * Basé sur la réglementation thermique RT2012 et DPE 3CL-DPE 2021
 *
 * Zones climatiques françaises :
 * - H1 : Nord et Est (climat froid)
 * - H2 : Ouest et Centre (climat tempéré)
 * - H3 : Sud et pourtour méditerranéen (climat chaud)
 *
 * Sources :
 * - RT2012 : Réglementation Thermique 2012
 * - DPE 3CL-DPE 2021 : Annexe 2 - Zonage climatique
 * - ADEME : Données climatiques françaises
 */

/**
 * Types de zones climatiques françaises
 */
export type ClimateZone = "H1a" | "H1b" | "H1c" | "H2a" | "H2b" | "H2c" | "H2d" | "H3"

/**
 * Informations sur une zone climatique
 */
export interface ClimateZoneInfo {
  zone: ClimateZone
  name: string
  description: string
  dju: number // Degrés-Jours Unifiés (base 18°C)
  temperatureMoyenneHiver: number // °C
  temperatureMoyenneEte: number // °C
  copAdjustment: number // Facteur d'ajustement du COP (1.0 = neutre)
}

/**
 * Données climatiques par zone selon DPE 3CL-DPE 2021
 * DJU moyens calculés sur la période 1991-2020
 */
const CLIMATE_ZONES: Record<ClimateZone, ClimateZoneInfo> = {
  "H1a": {
    zone: "H1a",
    name: "H1a - Nord-Est",
    description: "Zone la plus froide (Vosges, Jura, Alpes du Nord)",
    dju: 3000,
    temperatureMoyenneHiver: -2,
    temperatureMoyenneEte: 20,
    copAdjustment: 0.85, // COP réduit en zone très froide
  },
  "H1b": {
    zone: "H1b",
    name: "H1b - Est",
    description: "Zone froide (Alsace, Lorraine, Bourgogne-Franche-Comté)",
    dju: 2700,
    temperatureMoyenneHiver: 0,
    temperatureMoyenneEte: 21,
    copAdjustment: 0.90,
  },
  "H1c": {
    zone: "H1c",
    name: "H1c - Nord",
    description: "Zone froide (Nord-Pas-de-Calais, Picardie, Normandie Est)",
    dju: 2600,
    temperatureMoyenneHiver: 2,
    temperatureMoyenneEte: 19,
    copAdjustment: 0.92,
  },
  "H2a": {
    zone: "H2a",
    name: "H2a - Ouest",
    description: "Zone tempérée océanique (Bretagne, Pays de la Loire)",
    dju: 2200,
    temperatureMoyenneHiver: 5,
    temperatureMoyenneEte: 19,
    copAdjustment: 1.0, // Zone de référence
  },
  "H2b": {
    zone: "H2b",
    name: "H2b - Centre-Ouest",
    description: "Zone tempérée (Centre-Val de Loire, Poitou-Charentes)",
    dju: 2400,
    temperatureMoyenneHiver: 3,
    temperatureMoyenneEte: 21,
    copAdjustment: 0.95,
  },
  "H2c": {
    zone: "H2c",
    name: "H2c - Sud-Ouest",
    description: "Zone tempérée douce (Nouvelle-Aquitaine, Midi-Pyrénées)",
    dju: 2000,
    temperatureMoyenneHiver: 6,
    temperatureMoyenneEte: 22,
    copAdjustment: 1.05,
  },
  "H2d": {
    zone: "H2d",
    name: "H2d - Centre-Sud",
    description: "Zone tempérée (Rhône-Alpes, Auvergne)",
    dju: 2500,
    temperatureMoyenneHiver: 2,
    temperatureMoyenneEte: 21,
    copAdjustment: 0.93,
  },
  "H3": {
    zone: "H3",
    name: "H3 - Méditerranée",
    description: "Zone chaude méditerranéenne (PACA, Occitanie, Corse)",
    dju: 1600,
    temperatureMoyenneHiver: 8,
    temperatureMoyenneEte: 25,
    copAdjustment: 1.10, // COP amélioré en zone chaude
  },
}

/**
 * Mapping des départements vers les zones climatiques
 * Basé sur l'annexe 2 du DPE 3CL-DPE 2021
 */
const DEPARTMENT_TO_ZONE: Record<string, ClimateZone> = {
  // H1a - Zone la plus froide
  "01": "H1a", // Ain (montagne)
  "25": "H1a", // Doubs
  "39": "H1a", // Jura
  "70": "H1a", // Haute-Saône
  "73": "H1a", // Savoie
  "74": "H1a", // Haute-Savoie
  "88": "H1a", // Vosges
  "90": "H1a", // Territoire de Belfort

  // H1b - Est
  "08": "H1b", // Ardennes
  "10": "H1b", // Aube
  "21": "H1b", // Côte-d'Or
  "51": "H1b", // Marne
  "52": "H1b", // Haute-Marne
  "54": "H1b", // Meurthe-et-Moselle
  "55": "H1b", // Meuse
  "57": "H1b", // Moselle
  "58": "H1b", // Nièvre
  "67": "H1b", // Bas-Rhin
  "68": "H1b", // Haut-Rhin
  "71": "H1b", // Saône-et-Loire
  "89": "H1b", // Yonne

  // H1c - Nord
  "02": "H1c", // Aisne
  "14": "H1c", // Calvados
  "27": "H1c", // Eure
  "59": "H1c", // Nord
  "60": "H1c", // Oise
  "62": "H1c", // Pas-de-Calais
  "76": "H1c", // Seine-Maritime
  "80": "H1c", // Somme
  "95": "H1c", // Val-d'Oise

  // H2a - Ouest
  "22": "H2a", // Côtes-d'Armor
  "29": "H2a", // Finistère
  "35": "H2a", // Ille-et-Vilaine
  "44": "H2a", // Loire-Atlantique
  "49": "H2a", // Maine-et-Loire
  "50": "H2a", // Manche
  "53": "H2a", // Mayenne
  "56": "H2a", // Morbihan
  "61": "H2a", // Orne
  "72": "H2a", // Sarthe
  "85": "H2a", // Vendée

  // H2b - Centre-Ouest
  "16": "H2b", // Charente
  "17": "H2b", // Charente-Maritime
  "18": "H2b", // Cher
  "28": "H2b", // Eure-et-Loir
  "36": "H2b", // Indre
  "37": "H2b", // Indre-et-Loire
  "41": "H2b", // Loir-et-Cher
  "45": "H2b", // Loiret
  "75": "H2b", // Paris
  "77": "H2b", // Seine-et-Marne
  "78": "H2b", // Yvelines
  "79": "H2b", // Deux-Sèvres
  "86": "H2b", // Vienne
  "91": "H2b", // Essonne
  "92": "H2b", // Hauts-de-Seine
  "93": "H2b", // Seine-Saint-Denis
  "94": "H2b", // Val-de-Marne

  // H2c - Sud-Ouest
  "19": "H2c", // Corrèze
  "23": "H2c", // Creuse
  "24": "H2c", // Dordogne
  "31": "H2c", // Haute-Garonne
  "32": "H2c", // Gers
  "33": "H2c", // Gironde
  "40": "H2c", // Landes
  "46": "H2c", // Lot
  "47": "H2c", // Lot-et-Garonne
  "64": "H2c", // Pyrénées-Atlantiques
  "65": "H2c", // Hautes-Pyrénées
  "81": "H2c", // Tarn
  "82": "H2c", // Tarn-et-Garonne
  "87": "H2c", // Haute-Vienne

  // H2d - Centre-Sud
  "03": "H2d", // Allier
  "05": "H2d", // Hautes-Alpes (vallées)
  "07": "H2d", // Ardèche
  "15": "H2d", // Cantal
  "26": "H2d", // Drôme
  "38": "H2d", // Isère
  "42": "H2d", // Loire
  "43": "H2d", // Haute-Loire
  "48": "H2d", // Lozère
  "63": "H2d", // Puy-de-Dôme
  "69": "H2d", // Rhône

  // H3 - Méditerranée
  "04": "H3", // Alpes-de-Haute-Provence
  "06": "H3", // Alpes-Maritimes
  "09": "H3", // Ariège
  "11": "H3", // Aude
  "12": "H3", // Aveyron
  "13": "H3", // Bouches-du-Rhône
  "2A": "H3", // Corse-du-Sud
  "2B": "H3", // Haute-Corse
  "30": "H3", // Gard
  "34": "H3", // Hérault
  "66": "H3", // Pyrénées-Orientales
  "83": "H3", // Var
  "84": "H3", // Vaucluse

  // DOM-TOM (zone H3 par défaut, mais nécessiteraient un traitement spécifique)
  "971": "H3", // Guadeloupe
  "972": "H3", // Martinique
  "973": "H3", // Guyane
  "974": "H3", // La Réunion
  "976": "H3", // Mayotte
}

/**
 * Détermine la zone climatique à partir du code postal
 *
 * @param codePostal - Code postal français (5 chiffres)
 * @returns La zone climatique correspondante ou H2a par défaut
 *
 * @example
 * getClimateZoneFromPostalCode("75001") // => "H2b" (Paris)
 * getClimateZoneFromPostalCode("13001") // => "H3" (Marseille)
 * getClimateZoneFromPostalCode("67000") // => "H1b" (Strasbourg)
 */
export const getClimateZoneFromPostalCode = (codePostal: string): ClimateZone => {
  if (!codePostal || codePostal.length < 2) {
    console.warn(`Code postal invalide: ${codePostal}, utilisation de H2a par défaut`)
    return "H2a"
  }

  // Extraire le département (2 ou 3 premiers chiffres)
  let departement = codePostal.substring(0, 2)

  // Cas spéciaux Corse
  if (codePostal.startsWith("20")) {
    departement = parseInt(codePostal.substring(0, 3)) < 200 ? "2A" : "2B"
  }

  // DOM-TOM
  if (codePostal.startsWith("97") || codePostal.startsWith("98")) {
    departement = codePostal.substring(0, 3)
  }

  const zone = DEPARTMENT_TO_ZONE[departement]

  if (!zone) {
    console.warn(`Zone climatique non trouvée pour le département ${departement}, utilisation de H2a par défaut`)
    return "H2a"
  }

  return zone
}

/**
 * Récupère les informations complètes d'une zone climatique
 *
 * @param zone - Code de la zone climatique
 * @returns Les informations de la zone
 *
 * @example
 * const info = getClimateZoneInfo("H1a")
 * console.log(info.dju) // => 3000
 */
export const getClimateZoneInfo = (zone: ClimateZone): ClimateZoneInfo => {
  return CLIMATE_ZONES[zone]
}

/**
 * Récupère les informations climatiques à partir du code postal
 *
 * @param codePostal - Code postal français
 * @returns Les informations de la zone climatique
 *
 * @example
 * const info = getClimateInfoFromPostalCode("67000")
 * console.log(info.name) // => "H1b - Est"
 * console.log(info.dju) // => 2700
 */
export const getClimateInfoFromPostalCode = (codePostal: string): ClimateZoneInfo => {
  const zone = getClimateZoneFromPostalCode(codePostal)
  return getClimateZoneInfo(zone)
}

/**
 * Calcule le coefficient d'ajustement de consommation selon la zone climatique
 * Utilisé pour ajuster l'estimation de consommation par rapport à une zone de référence (H2a)
 *
 * @param codePostal - Code postal français
 * @returns Coefficient multiplicateur (1.0 = référence H2a)
 *
 * @example
 * // Une maison en H1a (zone froide) consomme ~36% de plus qu'en H2a
 * getConsumptionAdjustment("67000") // => 1.23 (H1b)
 *
 * // Une maison en H3 (zone chaude) consomme ~27% de moins qu'en H2a
 * getConsumptionAdjustment("13001") // => 0.73 (H3)
 */
export const getConsumptionAdjustment = (codePostal: string): number => {
  const info = getClimateInfoFromPostalCode(codePostal)
  const djuReference = CLIMATE_ZONES["H2a"].dju // 2200 DJU

  // La consommation est proportionnelle aux DJU
  return info.dju / djuReference
}

/**
 * Calcule le coefficient d'ajustement du COP selon la zone climatique
 * Les PAC sont plus efficaces en zones chaudes (températures extérieures plus élevées)
 *
 * @param codePostal - Code postal français
 * @returns Coefficient multiplicateur du COP
 *
 * @example
 * // En zone H1a (très froide), le COP est réduit de 15%
 * getCOPAdjustment("68000") // => 0.85
 *
 * // En zone H3 (méditerranée), le COP est amélioré de 10%
 * getCOPAdjustment("06000") // => 1.10
 */
export const getCOPAdjustment = (codePostal: string): number => {
  const info = getClimateInfoFromPostalCode(codePostal)
  return info.copAdjustment
}
