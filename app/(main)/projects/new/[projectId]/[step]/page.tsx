"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import {
  currentHeatingSchema as chauffageActuelSchema,
  type CurrentHeatingData as ChauffageActuelData,
} from "./sections/currentHeating/currentHeatingSchema"
import {
  heatPumpProjectSchema as projetPacSchema,
  type HeatPumpProjectData as ProjetPacData,
} from "./sections/heatPumpProject/heatPumpProjectSchema"
import {
  costsSchema as coutsSchema,
  type CostsData as CoutsData,
} from "./sections/costs/costsSchema"
import {
  financialAidSchema as aidesSchema,
  type FinancialAidData as AidesData,
} from "./sections/financialAid/financialAidSchema"
import {
  financingSchema as financementSchema,
  type FinancingData as FinancementData,
} from "./sections/financing/financingSchema"
import {
  evolutionsSchema,
  type EvolutionsData,
} from "./sections/evolutions/evolutionsSchema"
import { ChauffageActuelFields } from "./sections/currentHeating/currentHeatingFields"
import { ProjetPacFields } from "./sections/heatPumpProject/heatPumpProjectFields"
import { CoutsFields } from "./sections/costs/costsFields"
import { AidesFields } from "./sections/financialAid/financialAidFields"
import { FinancementFields } from "./sections/financing/financingFields"
import { EvolutionsFields } from "./sections/evolutions/evolutionsFields"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { saveCurrentHeatingData, getDefaultEnergyPrices } from "./sections/currentHeating/currentHeatingActions"
import { saveHeatPumpProjectData } from "./sections/heatPumpProject/heatPumpProjectActions"
import { saveCostsData } from "./sections/costs/costsActions"
import { saveFinancialAidData } from "./sections/financialAid/financialAidActions"
import { saveFinancingData } from "./sections/financing/financingActions"
import { saveEvolutionsData } from "./sections/evolutions/evolutionsActions"
import { getProject } from "@/lib/actions/projects"
import { fetchEnergyPriceEvolutions } from "@/lib/actions/energyPrices"
import { updateProjectStep } from "./updateProjectStep"
import { WIZARD_STEPS as STEPS } from "@/lib/wizardSteps"

const STEP_EXPLANATIONS: Record<string, string> = {
  "chauffage-actuel": "Ces informations nous permettent d'évaluer votre consommation énergétique actuelle, son coût annuel, et le rendement de votre installation. Cette analyse servira de référence pour comparer les économies potentielles avec une pompe à chaleur.",
  "projet-pac": "Les caractéristiques de la pompe à chaleur (type, puissance, COP) déterminent son efficacité et sa compatibilité avec votre logement. Ces données sont essentielles pour estimer précisément vos futures consommations et économies.",
  "couts": "Le détail des coûts (équipement, installation, travaux annexes) permet de calculer votre investissement total et d'évaluer la rentabilité de votre projet sur le long terme.",
  "aides": "Les aides financières disponibles (MaPrimeRénov', CEE, etc.) réduisent significativement votre reste à charge. Nous les prenons en compte pour calculer le retour sur investissement réel de votre projet.",
  "financement": "Votre mode de financement (comptant, crédit) impacte directement le coût total du projet et les mensualités. Ces informations permettent d'évaluer l'effort financier mensuel et le coût global incluant les intérêts.",
  "evolutions": "L'évolution prévue des prix de l'énergie influence fortement vos économies futures. Ces projections permettent d'estimer le gain financier sur 10, 15 ou 20 ans et d'anticiper la rentabilité de votre investissement.",
}

const DEFAULT_VALUES = {
  "chauffage-actuel": {
    type_chauffage: "Gaz",
    age_installation: 10,
    etat_installation: "Moyen",
    code_postal: "75001",
    connait_consommation: true,
    conso_gaz_kwh: 12000,
    prix_gaz_kwh: 0.09,
  },
  "projet-pac": {
    type_pac: "Air/Eau",
    puissance_pac_kw: 8,
    cop_estime: 3.5,
    temperature_depart: 55,
    emetteurs: "Radiateurs basse température",
    ballon_ecs: true,
    volume_ballon: 200,
  },
  couts: {
    cout_pac: 8000,
    cout_installation: 4000,
    cout_travaux_annexes: 2000,
    cout_total: 14000,
  },
  aides: {
    ma_prime_renov: 3000,
    cee: 2000,
    autres_aides: 0,
    total_aides: 5000,
    reste_a_charge: 9000,
  },
  financement: {
    mode_financement: "Crédit",
    apport_personnel: 2000,
    montant_credit: 7000,
    taux_interet: 3.5,
    duree_credit_mois: 120,
    // mensualite is calculated automatically
  },
  evolutions: {
    evolution_prix_fioul: 5,
    evolution_prix_gaz: 5,
    evolution_prix_gpl: 5,
    evolution_prix_bois: 5,
    evolution_prix_electricite: 3,
  },
}

const SCHEMAS = {
  "chauffage-actuel": chauffageActuelSchema,
  "projet-pac": projetPacSchema,
  couts: coutsSchema,
  aides: aidesSchema,
  financement: financementSchema,
  evolutions: evolutionsSchema,
}

export default function WizardStepPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const step = params.step as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [typeChauffage, setTypeChauffage] = useState<string | undefined>(undefined)
  const [defaultPrices, setDefaultPrices] = useState<{
    fioul: number
    gaz: number
    gpl: number
    bois: number
    electricite: number
  } | undefined>(undefined)

  const currentStepIndex = STEPS.findIndex((s) => s.key === step)
  const currentStep = STEPS[currentStepIndex]

  if (!currentStep) {
    router.push("/projects")
    return null
  }

  const form = useForm({
    resolver: zodResolver(SCHEMAS[step as keyof typeof SCHEMAS]) as any,
    defaultValues: DEFAULT_VALUES[step as keyof typeof DEFAULT_VALUES] as any,
  })

  const watchTypeChauffage = form.watch("type_chauffage")
  const watchModeFinancement = form.watch("mode_financement")
  const watchBallonEcs = form.watch("ballon_ecs")

  // Load existing data if any
  useEffect(() => {
    const loadData = async () => {
      try {
        const project = await getProject(projectId)

        // Load default prices for chauffage-actuel step
        if (step === "chauffage-actuel") {
          const prices = await getDefaultEnergyPrices()
          setDefaultPrices(prices)
        }

        if (project) {
          // Store type_chauffage for evolutions step
          if (project.chauffageActuel?.type_chauffage) {
            setTypeChauffage(project.chauffageActuel.type_chauffage)
          }

          // Map step key to database field name
          const sectionMap: Record<string, string> = {
            "chauffage-actuel": "chauffageActuel",
            "projet-pac": "projetPac",
            "couts": "couts",
            "aides": "aides",
            "financement": "financement",
            "evolutions": "evolutions",
          }

          const sectionKey = sectionMap[step]
          const sectionData = project[sectionKey as keyof typeof project]

          if (sectionData && typeof sectionData === 'object') {
            // Remove the ID, projectId, and timestamp fields before resetting
            const { id, projectId: _projectId, createdAt, updatedAt, ...data } = sectionData as any
            // Convert null values to undefined for Zod optional fields
            const cleanedData = Object.fromEntries(
              Object.entries(data).map(([key, value]) => [key, value === null ? undefined : value])
            )
            form.reset(cleanedData)
          } else if (step === "chauffage-actuel" && !sectionData) {
            // Si on est sur l'étape chauffage-actuel et qu'il n'y a pas de données sauvegardées,
            // utiliser les valeurs par défaut (les prix seront mis à jour par le second useEffect)
            form.reset(DEFAULT_VALUES["chauffage-actuel"])
          } else if (step === "evolutions" && !sectionData) {
            // Si on est sur l'étape évolutions et qu'il n'y a pas de données sauvegardées,
            // charger les taux d'évolution depuis l'API DIDO
            const evolutionsResult = await fetchEnergyPriceEvolutions()
            if (evolutionsResult.success) {
              form.reset(evolutionsResult.data)
            }
          }

        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [projectId, step, form])

  // Load default energy prices when user changes heating type (only on chauffage-actuel step)
  useEffect(() => {
    if (step !== "chauffage-actuel" || !watchTypeChauffage || isLoading || !defaultPrices) {
      return
    }

    // Only update the price field if it's empty or zero
    switch (watchTypeChauffage) {
      case "Fioul":
        if (!form.getValues("prix_fioul_litre") || form.getValues("prix_fioul_litre") === 0) {
          form.setValue("prix_fioul_litre", Math.round(defaultPrices.fioul * 100) / 100)
        }
        break
      case "Gaz":
        if (!form.getValues("prix_gaz_kwh") || form.getValues("prix_gaz_kwh") === 0) {
          form.setValue("prix_gaz_kwh", Math.round(defaultPrices.gaz * 100) / 100)
        }
        break
      case "GPL":
        if (!form.getValues("prix_gpl_kg") || form.getValues("prix_gpl_kg") === 0) {
          form.setValue("prix_gpl_kg", Math.round(defaultPrices.gpl * 100) / 100)
        }
        break
      case "Pellets":
        if (!form.getValues("prix_pellets_kg") || form.getValues("prix_pellets_kg") === 0) {
          form.setValue("prix_pellets_kg", Math.round(defaultPrices.bois * 100) / 100)
        }
        break
      case "Bois":
        // Pour le bois en stères: prix pellets/kg * 2000 kWh/stère / 4.8 kWh/kg ≈ prix/kg * 416
        const prixBoisStere = Math.round(defaultPrices.bois * 416.67 * 100) / 100
        if (!form.getValues("prix_bois_stere") || form.getValues("prix_bois_stere") === 0) {
          form.setValue("prix_bois_stere", prixBoisStere)
        }
        break
      case "Electrique":
      case "PAC Air/Air":
      case "PAC Air/Eau":
      case "PAC Eau/Eau":
        if (!form.getValues("prix_elec_kwh") || form.getValues("prix_elec_kwh") === 0) {
          form.setValue("prix_elec_kwh", Math.round(defaultPrices.electricite * 100) / 100)
        }
        break
    }
  }, [watchTypeChauffage, step, isLoading, defaultPrices, form])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Call the appropriate Server Action based on current step
      switch (step) {
        case "chauffage-actuel":
          await saveCurrentHeatingData(projectId, data)
          break
        case "projet-pac":
          await saveHeatPumpProjectData(projectId, data)
          break
        case "couts":
          await saveCostsData(projectId, data)
          break
        case "aides":
          await saveFinancialAidData(projectId, data)
          break
        case "financement":
          await saveFinancingData(projectId, data)
          break
        case "evolutions":
          await saveEvolutionsData(projectId, data)
          break
        default:
          throw new Error("Invalid step")
      }

      // Update project step to next step (step numbers start at 1)
      const nextStepNumber = currentStepIndex + 2 // +1 for array index, +1 for next step
      await updateProjectStep(projectId, nextStepNumber)

      // Navigate to next step or results
      if (currentStepIndex < STEPS.length - 1) {
        const nextStep = STEPS[currentStepIndex + 1]
        router.push(`/projects/new/${projectId}/${nextStep.key}`)
      } else {
        router.push(`/projects/${projectId}/results`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      // You could add toast notification here
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const previousStep = STEPS[currentStepIndex - 1]
      router.push(`/projects/new/${projectId}/${previousStep.key}`)
    } else {
      router.push("/projects")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{currentStep.title}</h1>
            <p className="text-muted-foreground mt-2">{currentStep.description}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Étape {currentStepIndex + 1} / {STEPS.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step explanation */}
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          {STEP_EXPLANATIONS[step as string] || currentStep.description}
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              {step === "chauffage-actuel" && <ChauffageActuelFields form={form as any} defaultPrices={defaultPrices} />}
              {step === "projet-pac" && <ProjetPacFields form={form as any} watchBallonEcs={watchBallonEcs as boolean} />}
              {step === "couts" && <CoutsFields form={form as any} />}
              {step === "aides" && <AidesFields form={form as any} />}
              {step === "financement" && <FinancementFields form={form as any} watchModeFinancement={watchModeFinancement as string} />}
              {step === "evolutions" && <EvolutionsFields form={form as any} typeChauffage={typeChauffage} />}
            </CardContent>
          </Card>

          <div className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStepIndex === 0 ? "Annuler" : "Précédent"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentStepIndex < STEPS.length - 1 ? (
                <>
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Calculer les résultats"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
