"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import {
  housingSchema as logementSchema,
  type HousingData as LogementData,
} from "./sections/housing/housingSchema"
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
import { HousingFields } from "./sections/housing/housingFields"
import { ChauffageActuelFields } from "./sections/currentHeating/currentHeatingFields"
import { ProjetPacFields } from "./sections/heatPumpProject/heatPumpProjectFields"
import { CoutsFields } from "./sections/costs/costsFields"
import { AidesFields } from "./sections/financialAid/financialAidFields"
import { FinancementFields } from "./sections/financing/financingFields"
import { EvolutionsFields } from "./sections/evolutions/evolutionsFields"
import { Card, CardContent } from "@/components/ui/card"
import { saveHousingData } from "./sections/housing/housingActions"
import { saveCurrentHeatingData } from "./sections/currentHeating/currentHeatingActions"
import { saveHeatPumpProjectData } from "./sections/heatPumpProject/heatPumpProjectActions"
import { saveCostsData } from "./sections/costs/costsActions"
import { saveFinancialAidData } from "./sections/financialAid/financialAidActions"
import { saveFinancingData } from "./sections/financing/financingActions"
import { saveEvolutionsData } from "./sections/evolutions/evolutionsActions"
import { getProject } from "@/lib/actions/projects"
import { fetchEnergyPriceEvolutions } from "@/lib/actions/energyPrices"

const STEPS = [
  { key: "logement", title: "Logement", description: "Informations sur votre logement" },
  { key: "chauffage-actuel", title: "Chauffage actuel", description: "Votre système de chauffage actuel et consommation" },
  { key: "projet-pac", title: "Projet PAC", description: "Caractéristiques de la pompe à chaleur" },
  { key: "couts", title: "Coûts", description: "Coûts d'installation et travaux" },
  { key: "aides", title: "Aides", description: "Aides financières disponibles" },
  { key: "financement", title: "Financement", description: "Mode de financement du projet" },
  { key: "evolutions", title: "Évolutions", description: "Évolution des prix de l'énergie" },
]

const DEFAULT_VALUES = {
  logement: {
    code_postal: "",
    annee_construction: 2000,
    surface_habitable: 100,
    nombre_occupants: 2,
    isolation_murs: false,
    isolation_combles: false,
    double_vitrage: false,
  },
  "chauffage-actuel": {
    type_chauffage: "Gaz",
    age_installation: 10,
    etat_installation: "Moyen",
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
  logement: logementSchema,
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

        if (project) {
          // Store type_chauffage for evolutions step
          if (project.chauffageActuel?.type_chauffage) {
            setTypeChauffage(project.chauffageActuel.type_chauffage)
          }

          // Map step key to database field name
          const sectionMap: Record<string, string> = {
            "logement": "logement",
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
            form.reset(data)
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

  const onSubmit = async (data: any) => {
    console.log('=== FORM SUBMIT DEBUG ===')
    console.log('Step:', step)
    console.log('Form data:', JSON.stringify(data, null, 2))
    console.log('Form errors:', form.formState.errors)
    console.log('Form isValid:', form.formState.isValid)
    console.log('=========================')

    setIsSubmitting(true)
    try {
      // Call the appropriate Server Action based on current step
      switch (step) {
        case "logement":
          await saveHousingData(projectId, data)
          break
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              {step === "logement" && <HousingFields form={form as any} />}
              {step === "chauffage-actuel" && <ChauffageActuelFields form={form as any} />}
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
