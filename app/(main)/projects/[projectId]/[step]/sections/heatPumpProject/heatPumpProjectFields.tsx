import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { HeatPumpProjectData } from "./heatPumpProjectSchema"
import { getPuissanceSouscritePacRecommandee } from "@/lib/subscriptionRates"

interface ProjetPacFieldsProps {
  form: UseFormReturn<HeatPumpProjectData>
  currentElectricPower?: number // Current electrical subscription power (kVA)
  defaultElectricityPrice?: number // Default electricity price (€/kWh)
  prixElecKwhActuel?: number // Prix électricité déjà renseigné dans chauffage actuel (si type électrique)
  typeChauffageActuel?: string // Type de chauffage actuel
}

// Helper component for price label with tooltip
function PriceLabelWithTooltip({ label, price, unit }: { label: string; price?: number; unit: string }) {
  return (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      {price && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[300px]">
              <p className="text-sm">
                Ce mois-ci, le prix moyen national est de <span className="font-semibold">{price.toFixed(3)}&nbsp;{unit}</span>.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

export function ProjetPacFields({ form, currentElectricPower = 6, defaultElectricityPrice, prixElecKwhActuel, typeChauffageActuel }: ProjetPacFieldsProps) {
  const typePac = form.watch("type_pac")
  const isWaterBased = typePac === "Air/Eau" || typePac === "Eau/Eau"
  const isAirToAir = typePac === "Air/Air"
  const puissancePacKw = form.watch("puissance_pac_kw")

  // Si le prix de l'électricité est déjà renseigné dans chauffage actuel ET que le type est électrique,
  // on masque le champ prix_elec_kwh
  const isElectricHeating = typeChauffageActuel === "Electrique" ||
                           typeChauffageActuel === "PAC Air/Air" ||
                           typeChauffageActuel === "PAC Air/Eau" ||
                           typeChauffageActuel === "PAC Eau/Eau"
  const shouldHideElectricityPrice = isElectricHeating && prixElecKwhActuel && prixElecKwhActuel > 0

  // Automatically set emetteurs to "Ventilo-convecteurs" for Air/Air PACs
  useEffect(() => {
    if (isAirToAir) {
      form.setValue("emetteurs", "Ventilo-convecteurs")
    }
  }, [isAirToAir, form])

  // Automatically calculate recommended subscription power when PAC power changes
  useEffect(() => {
    if (puissancePacKw && puissancePacKw > 0) {
      const recommendedPower = getPuissanceSouscritePacRecommandee(puissancePacKw, currentElectricPower)
      // Only update if the field hasn't been manually set or if it's the default value
      const currentValue = form.getValues("puissance_souscrite_pac")
      if (currentValue === undefined || currentValue === 9) {
        form.setValue("puissance_souscrite_pac", recommendedPower)
      }
    }
  }, [puissancePacKw, currentElectricPower, form])

  // Auto-fill prix_elec_kwh if already provided in chauffage actuel (for electric heating types)
  useEffect(() => {
    if (prixElecKwhActuel && prixElecKwhActuel > 0) {
      const currentValue = form.getValues("prix_elec_kwh")
      if (currentValue === undefined) {
        form.setValue("prix_elec_kwh", prixElecKwhActuel)
      }
    }
  }, [prixElecKwhActuel, form])

  return (
    <div className="space-y-6">
      {/* Section 1: Type de PAC */}
      <FormField
        control={form.control}
        name="type_pac"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type de pompe à chaleur *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Air/Eau">Air/Eau</SelectItem>
                <SelectItem value="Eau/Eau">Eau/Eau</SelectItem>
                <SelectItem value="Air/Air">Air/Air</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Section 2: Caractéristiques de la PAC */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Caractéristiques de la PAC</h3>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="puissance_pac_kw"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puissance de la PAC (kW) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="ex: 8"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cop_estime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  COP estimé *
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold">Indiquez le COP fabricant (fiche technique)</p>
                      <p className="mt-2 text-xs">Des ajustements seront automatiquement appliqués selon :</p>
                      <ul className="mt-1 text-xs list-disc list-inside space-y-0.5">
                        <li>Votre zone climatique (H1/H2/H3)</li>
                        {isWaterBased && (
                          <>
                            <li>La température de départ</li>
                            <li>Le type d&apos;émetteurs</li>
                          </>
                        )}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="ex: 3.5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duree_vie_pac"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durée de vie estimée (années) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="ex: 15"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Section 3: Configuration du système (only for water-based) */}
      {isWaterBased && (
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Configuration du système</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="temperature_depart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Température de départ (°C) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="ex: 45"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? 0 : Number(value))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emetteurs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'émetteurs *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Radiateurs haute température">
                        Radiateurs haute température
                      </SelectItem>
                      <SelectItem value="Radiateurs basse température">
                        Radiateurs basse température
                      </SelectItem>
                      <SelectItem value="Plancher chauffant">
                        Plancher chauffant
                      </SelectItem>
                      <SelectItem value="Ventilo-convecteurs">
                        Ventilo-convecteurs
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* Section 4: Électricité et abonnements */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Électricité et abonnements</h3>

        <div className="grid grid-cols-2 gap-4">
          {!shouldHideElectricityPrice && (
            <FormField
              control={form.control}
              name="prix_elec_kwh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <PriceLabelWithTooltip
                      label="Prix de l'électricité (€/kWh) *"
                      price={defaultElectricityPrice}
                      unit="€/kWh"
                    />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="ex: 0.23"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="puissance_souscrite_actuelle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    <span>Abonnement actuel (kVA) *</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <p className="text-sm">
                            Puissance de votre abonnement électrique actuel (visible sur votre facture).
                            <br /><br />
                            <span className="font-semibold">Valeur moyenne : 6 kVA</span>
                            <br /><br />
                            Puissances courantes : 3, 6, 9, 12, 15, 18 kVA
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="3">3 kVA</SelectItem>
                    <SelectItem value="6">6 kVA (standard)</SelectItem>
                    <SelectItem value="9">9 kVA</SelectItem>
                    <SelectItem value="12">12 kVA</SelectItem>
                    <SelectItem value="15">15 kVA</SelectItem>
                    <SelectItem value="18">18 kVA</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="puissance_souscrite_pac"
            render={({ field }) => {
              const recommendedPower = puissancePacKw
                ? getPuissanceSouscritePacRecommandee(puissancePacKw, currentElectricPower)
                : 9

              return (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <span>Abonnement avec PAC (kVA) *</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[300px]">
                            <p className="text-sm">
                              Puissance électrique recommandée pour alimenter la PAC et vos équipements existants.
                              <br /><br />
                              <span className="font-semibold">
                                Recommandation : {recommendedPower} kVA
                              </span>
                              <br /><br />
                              Calculée selon la formule : Puissance actuelle ({currentElectricPower} kVA) + Puissance PAC ({puissancePacKw || 0} kW)
                              <br /><br />
                              Le coefficient de foisonnement est pris en compte (tous vos appareils ne fonctionnent pas simultanément au maximum).
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3">3 kVA{recommendedPower === 3 ? " (recommandé)" : ""}</SelectItem>
                      <SelectItem value="6">6 kVA{recommendedPower === 6 ? " (recommandé)" : ""}</SelectItem>
                      <SelectItem value="9">9 kVA{recommendedPower === 9 ? " (recommandé)" : ""}</SelectItem>
                      <SelectItem value="12">12 kVA{recommendedPower === 12 ? " (recommandé)" : ""}</SelectItem>
                      <SelectItem value="15">15 kVA{recommendedPower === 15 ? " (recommandé)" : ""}</SelectItem>
                      <SelectItem value="18">18 kVA{recommendedPower === 18 ? " (recommandé)" : ""}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </div>
      </div>

      {/* Section 5: Coûts d'exploitation */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Coûts d'exploitation</h3>

        <FormField
          control={form.control}
          name="entretien_pac_annuel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <span>Entretien annuel (€/an) *</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[300px]">
                        <p className="text-sm">
                          Coût annuel de l&apos;entretien de votre future PAC.
                          <br /><br />
                          <span className="font-semibold">Valeur moyenne : 120 €/an</span>
                          <br /><br />
                          <span className="text-xs">
                            ⚠️ L&apos;entretien des PAC est obligatoire tous les 2 ans (Décret n°2020-912).
                            Un entretien annuel est fortement recommandé pour maintenir les performances.
                          </span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="ex: 120"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
