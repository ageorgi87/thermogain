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
export const CLIMATE_ZONES: Record<ClimateZone, ClimateZoneInfo> = {
  "H1a": {
    zone: "H1a",
    name: "H1a - Nord-Est",
    description: "Zone la plus froide (Vosges, Jura, Alpes du Nord)",
    dju: 3000,
    temperatureMoyenneHiver: -2,
    temperatureMoyenneEte: 20,
    copAdjustment: 0.85,
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
    copAdjustment: 1.0,
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
    copAdjustment: 1.10,
  },
}

/**
 * Mapping des départements vers les zones climatiques
 * Basé sur l'annexe 2 du DPE 3CL-DPE 2021
 */
export const DEPARTMENT_TO_ZONE: Record<string, ClimateZone> = {
  // H1a - Zone la plus froide
  "01": "H1a", "25": "H1a", "39": "H1a", "70": "H1a",
  "73": "H1a", "74": "H1a", "88": "H1a", "90": "H1a",

  // H1b - Est
  "08": "H1b", "10": "H1b", "21": "H1b", "51": "H1b",
  "52": "H1b", "54": "H1b", "55": "H1b", "57": "H1b",
  "58": "H1b", "67": "H1b", "68": "H1b", "71": "H1b",
  "89": "H1b",

  // H1c - Nord
  "02": "H1c", "14": "H1c", "27": "H1c", "59": "H1c",
  "60": "H1c", "62": "H1c", "76": "H1c", "80": "H1c",
  "95": "H1c",

  // H2a - Ouest
  "22": "H2a", "29": "H2a", "35": "H2a", "44": "H2a",
  "49": "H2a", "50": "H2a", "53": "H2a", "56": "H2a",
  "61": "H2a", "72": "H2a", "85": "H2a",

  // H2b - Centre-Ouest
  "16": "H2b", "17": "H2b", "18": "H2b", "28": "H2b",
  "36": "H2b", "37": "H2b", "41": "H2b", "45": "H2b",
  "75": "H2b", "77": "H2b", "78": "H2b", "79": "H2b",
  "86": "H2b", "91": "H2b", "92": "H2b", "93": "H2b",
  "94": "H2b",

  // H2c - Sud-Ouest
  "19": "H2c", "23": "H2c", "24": "H2c", "31": "H2c",
  "32": "H2c", "33": "H2c", "40": "H2c", "46": "H2c",
  "47": "H2c", "64": "H2c", "65": "H2c", "81": "H2c",
  "82": "H2c", "87": "H2c",

  // H2d - Centre-Sud
  "03": "H2d", "05": "H2d", "07": "H2d", "15": "H2d",
  "26": "H2d", "38": "H2d", "42": "H2d", "43": "H2d",
  "48": "H2d", "63": "H2d", "69": "H2d",

  // H3 - Méditerranée
  "04": "H3", "06": "H3", "09": "H3", "11": "H3",
  "12": "H3", "13": "H3", "2A": "H3", "2B": "H3",
  "30": "H3", "34": "H3", "66": "H3", "83": "H3",
  "84": "H3",

  // DOM-TOM
  "971": "H3", "972": "H3", "973": "H3", "974": "H3", "976": "H3",
}
