import { z } from "zod";
import { ClasseDPE } from "@/types/dpe";

// Validation du code postal français (métropole, Corse, DOM-TOM)
const codePostalRegex = /^(?:0[1-9]|[1-8]\d|9[0-5]|2[AB]|97[1-8])\d{3}$/;

export const housingSchema = z.object({
  code_postal: z
    .string({ message: "Le code postal est requis" })
    .min(1, "Le code postal est requis")
    .regex(codePostalRegex, "Code postal invalide (ex: 75001, 20000, 97400)"),
  annee_construction: z
    .number({ message: "L'année de construction est requise" })
    .min(1800, "L'année doit être supérieure à 1800")
    .max(
      new Date().getFullYear() + 2,
      "L'année ne peut pas être dans le futur"
    ),
  nombre_occupants: z
    .number({ message: "Le nombre d'occupants est requis" })
    .min(1, "Il doit y avoir au moins 1 occupant")
    .max(20, "Le nombre d'occupants ne peut pas dépasser 20"),
  classe_dpe: z.nativeEnum(ClasseDPE, {
    message: "La classe DPE est requise",
  }),
});

export type HousingData = z.infer<typeof housingSchema>;
