import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { EvolutionsData } from "./evolutionsSchema"

interface EvolutionsFieldsProps {
  form: UseFormReturn<EvolutionsData>
  typeChauffage?: string
  lastUpdated?: Date
}

export function EvolutionsFields({ form, typeChauffage, lastUpdated }: EvolutionsFieldsProps) {
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
              <FormLabel className="flex items-center gap-2">
                {energyFieldConfig.label}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Évolution moyenne sur 10 ans : <strong>{field.value ? `${field.value > 0 ? '+' : ''}${field.value}%/an` : 'Non définie'}</strong>
                    </p>
                    <p className="mt-1">Fournie par les données publiques du ministère de la Transition Écologique.</p>
                    {lastUpdated && (
                      <p className="mt-1">
                        Dernière mise à jour : {new Date(lastUpdated).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
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
            <FormLabel className="flex items-center gap-2">
              {typeChauffage === "Electrique" || typeChauffage?.startsWith("PAC")
                ? "Évolution du prix de l'électricité (%/an)"
                : "Évolution du prix de l'électricité pour la PAC (%/an)"}
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Évolution moyenne sur 10 ans : <strong>{field.value ? `${field.value > 0 ? '+' : ''}${field.value}%/an` : 'Non définie'}</strong>
                  </p>
                  <p className="mt-1">Fournie par les données publiques du ministère de la Transition Écologique.</p>
                  {lastUpdated && (
                    <p className="mt-1">
                      Dernière mise à jour : {new Date(lastUpdated).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
