import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { EvolutionsData } from "./evolutionsSchema"

interface EvolutionsFieldsProps {
  form: UseFormReturn<EvolutionsData>
  typeChauffage?: string
}

export function EvolutionsFields({ form, typeChauffage }: EvolutionsFieldsProps) {
  // Déterminer quel champ afficher selon le type de chauffage actuel
  // Si c'est déjà électrique ou PAC, on ne demande pas l'évolution car c'est la même que pour la PAC
  const getEnergyFieldConfig = () => {
    switch (typeChauffage) {
      case "Fioul":
        return {
          name: "evolution_prix_fioul" as const,
          label: "Évolution du prix du fioul (%/an)",
        }
      case "Gaz":
        return {
          name: "evolution_prix_gaz" as const,
          label: "Évolution du prix du gaz (%/an)",
        }
      case "GPL":
        return {
          name: "evolution_prix_gpl" as const,
          label: "Évolution du prix du GPL (%/an)",
        }
      case "Pellets":
      case "Bois":
        return {
          name: "evolution_prix_bois" as const,
          label: "Évolution du prix du bois/pellets (%/an)",
        }
      case "Electrique":
      case "PAC Air/Air":
      case "PAC Air/Eau":
      case "PAC Eau/Eau":
        // Pas de champ spécifique, on utilise evolution_prix_electricite
        return null
      default:
        return null
    }
  }

  const energyFieldConfig = getEnergyFieldConfig()

  return (
    <div className="space-y-4">
      {energyFieldConfig && (
        <FormField
          control={form.control}
          name={energyFieldConfig.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{energyFieldConfig.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Augmentation annuelle estimée (ex: 5 pour +5%/an, -2 pour -2%/an)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="evolution_prix_electricite"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {typeChauffage === "Electrique" || typeChauffage?.startsWith("PAC")
                ? "Évolution du prix de l'électricité (%/an)"
                : "Évolution du prix de l'électricité pour la PAC (%/an)"}
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              {typeChauffage === "Electrique" || typeChauffage?.startsWith("PAC")
                ? "Évolution annuelle estimée du prix de l'électricité"
                : "Évolution du prix de l'électricité pour alimenter la future pompe à chaleur"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
