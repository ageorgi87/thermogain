"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import {
  logementSchema,
  chauffageActuelSchema,
  consommationSchema,
  projetPacSchema,
  coutsSchema,
  aidesSchema,
  financementSchema,
  evolutionsSchema,
  type LogementData,
  type ChauffageActuelData,
  type ConsommationData,
  type ProjetPacData,
  type CoutsData,
  type AidesData,
  type FinancementData,
  type EvolutionsData,
} from "@/lib/schemas/heating-form"
import { LogementFields } from "./sections/housingFields"
import { ChauffageActuelFields } from "./sections/chauffageActuelFields"
import { ConsommationFields } from "./sections/consommationFields"
import { ProjetPacFields } from "./sections/heatPumpProjectFields"
import { CoutsFields } from "./sections/coutsFields"
import { AidesFields } from "./sections/aidesFields"
import { FinancementFields } from "./sections/financingFields"
import { EvolutionsFields } from "./sections/evolutionsFields"
import { Card, CardContent } from "@/components/ui/card"

const STEPS = [
  { key: "logement", title: "Logement", description: "Informations sur votre logement" },
  { key: "chauffage-actuel", title: "Chauffage actuel", description: "Votre système de chauffage actuel" },
  { key: "consommation", title: "Consommation", description: "Votre consommation énergétique" },
  { key: "projet-pac", title: "Projet PAC", description: "Caractéristiques de la pompe à chaleur" },
  { key: "couts", title: "Coûts", description: "Coûts d'installation et travaux" },
  { key: "aides", title: "Aides", description: "Aides financières disponibles" },
  { key: "financement", title: "Financement", description: "Mode de financement du projet" },
  { key: "evolutions", title: "Évolutions", description: "Évolution des prix de l'énergie" },
]

const DEFAULT_VALUES = {
  logement: {
    departement: "",
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
  },
  consommation: {
    type_chauffage: "Gaz",
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
    mensualite: 70,
  },
  evolutions: {
    evolution_prix_energie: 5,
    evolution_prix_electricite: 3,
    duree_etude_annees: 15,
  },
}

const SCHEMAS = {
  logement: logementSchema,
  "chauffage-actuel": chauffageActuelSchema,
  consommation: consommationSchema,
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

  const currentStepIndex = STEPS.findIndex((s) => s.key === step)
  const currentStep = STEPS[currentStepIndex]

  if (!currentStep) {
    router.push("/projects")
    return null
  }

  const form = useForm({
    resolver: zodResolver(SCHEMAS[step as keyof typeof SCHEMAS]),
    defaultValues: DEFAULT_VALUES[step as keyof typeof DEFAULT_VALUES],
  })

  const watchTypeChauffage = form.watch("type_chauffage")
  const watchModeFinancement = form.watch("mode_financement")
  const watchBallonEcs = form.watch("ballon_ecs")

  // Load existing data if any
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/heating-projects`)
        if (response.ok) {
          const projects = await response.json()
          const project = projects.find((p: any) => p.id === projectId)

          if (project) {
            const sectionKey = step.replace(/-/g, "")
            const sectionData = project[sectionKey === "chauffageactuel" ? "chauffageActuel" : sectionKey === "projetpac" ? "projetPac" : sectionKey]

            if (sectionData) {
              // Remove the ID and relations fields before resetting
              const { id, heatingProjectId, createdAt, updatedAt, ...data } = sectionData
              form.reset(data)
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
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/heating-projects/${step}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ heatingProjectId: projectId, ...data }),
      })

      if (response.ok) {
        if (currentStepIndex < STEPS.length - 1) {
          // Go to next step
          const nextStep = STEPS[currentStepIndex + 1]
          router.push(`/projects/new/${projectId}/${nextStep.key}`)
        } else {
          // Final step, go to results
          router.push(`/projects/${projectId}/results`)
        }
      } else {
        console.error("Failed to save section data")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
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
              {step === "logement" && <LogementFields form={form as any} />}
              {step === "chauffage-actuel" && <ChauffageActuelFields form={form as any} />}
              {step === "consommation" && <ConsommationFields form={form as any} watchTypeChauffage={watchTypeChauffage as string} />}
              {step === "projet-pac" && <ProjetPacFields form={form as any} watchBallonEcs={watchBallonEcs as boolean} />}
              {step === "couts" && <CoutsFields form={form as any} />}
              {step === "aides" && <AidesFields form={form as any} />}
              {step === "financement" && <FinancementFields form={form as any} watchModeFinancement={watchModeFinancement as string} />}
              {step === "evolutions" && <EvolutionsFields form={form as any} />}
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
