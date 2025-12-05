import type { ClimateZone } from "@/app/(main)/[projectId]/lib/getClimateData/types/climateZone";
import type { ClimateZoneInfo } from "@/app/(main)/[projectId]/lib/getClimateData/types/climateZoneInfo";

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
