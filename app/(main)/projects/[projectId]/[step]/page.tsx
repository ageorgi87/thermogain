"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Info } from "lucide-react"
import {
  informationsSchema,
  type InformationsData,
} from "./sections/informations/informationsSchema"
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
import { InformationsFields } from "./sections/informations/informationsFields"
import { HousingFields } from "./sections/housing/housingFields"
import { ChauffageActuelFields } from "./sections/currentHeating/currentHeatingFields"
import { ProjetPacFields } from "./sections/heatPumpProject/heatPumpProjectFields"
import { CoutsFields } from "./sections/costs/costsFields"
import { AidesFields } from "./sections/financialAid/financialAidFields"
import { FinancementFields } from "./sections/financing/financingFields"
import { Card, CardContent } from "@/components/ui/card"
import { saveInformationsData } from "./sections/informations/informationsActions"
import { saveHousingData } from "./sections/housing/housingActions"
import { saveCurrentHeatingData, getDefaultEnergyPrices } from "./sections/currentHeating/currentHeatingActions"
import { saveHeatPumpProjectData } from "./sections/heatPumpProject/heatPumpProjectActions"
import { saveCostsData } from "./sections/costs/costsActions"
import { saveFinancialAidData } from "./sections/financialAid/financialAidActions"
import { saveFinancingData } from "./sections/financing/financingActions"
import { getProject } from "@/lib/actions/projects"
import { updateProjectStep } from "./updateProjectStep"
import { WIZARD_STEPS as STEPS } from "@/lib/wizardSteps"

const STEP_EXPLANATIONS: Record<string, string> = {
  "informations": "Le nom du projet vous permet de le retrouver facilement dans votre liste. Les adresses email recevront automatiquement le rapport de simulation une fois l'analyse terminée.",
  "logement": "Les caractéristiques de votre logement (surface, isolation, année de construction) sont essentielles pour estimer avec précision vos besoins en chauffage, dimensionner correctement la pompe à chaleur, et calculer les économies potentielles.",
  "chauffage-actuel": "Ces informations nous permettent d'évaluer votre consommation énergétique actuelle, son coût annuel, et le rendement de votre installation. Cette analyse servira de référence pour comparer les économies potentielles avec une pompe à chaleur.",
  "projet-pac": "Les caractéristiques de la pompe à chaleur (type, puissance, COP) déterminent son efficacité et sa compatibilité avec votre logement. Ces données sont essentielles pour estimer précisément vos futures consommations et économies.",
  "couts": "Le détail des coûts (équipement, installation, travaux annexes) permet de calculer votre investissement total et d'évaluer la rentabilité de votre projet sur le long terme.",
  "aides": "Les aides financières disponibles (MaPrimeRénov', CEE, etc.) réduisent significativement votre reste à charge. Nous les prenons en compte pour calculer le retour sur investissement réel de votre projet.",
  "financement": "Votre mode de financement (comptant, crédit) impacte directement le coût total du projet et les mensualités. Ces informations permettent d'évaluer l'effort financier mensuel et le coût global incluant les intérêts.",
}

const DEFAULT_VALUES = {
  "informations": {
    project_name: "",
    recipient_emails: [],
  },
  "logement": {
    // No defaults - all values must be entered by user
  },
  "chauffage-actuel": {
    connait_consommation: true,
    // All other values must be entered by user
    // prix_*_kwh will be set by useEffect from API defaults if not in DB
  },
  "projet-pac": {
    duree_vie_pac: 17, // Technical default based on ADEME studies
    // All other values must be entered by user
    // prix_elec_kwh will be set by useEffect from API defaults if not in DB
  },
  couts: {
    cout_pac: 0,
    cout_installation: 0,
    cout_travaux_annexes: 0,
    cout_total: 0,
  },
  aides: {
    ma_prime_renov: 0,
    cee: 0,
    autres_aides: 0,
    total_aides: 0,
  },
  financement: {
    mode_financement: "Comptant", // Most common default
    apport_personnel: 0,
    montant_credit: 0,
    taux_interet: 0,
    duree_credit_mois: 0,
    // mensualite is calculated automatically
  },
}

const SCHEMAS = {
  "informations": informationsSchema,
  "logement": logementSchema,
  "chauffage-actuel": chauffageActuelSchema,
  "projet-pac": projetPacSchema,
  couts: coutsSchema,
  aides: aidesSchema,
  financement: financementSchema,
}

export default function WizardStepPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const step = params.step as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showExplanation, setShowExplanation] = useState(false)
  const [typeChauffage, setTypeChauffage] = useState<string | undefined>(undefined)
  const [prixElecKwhActuel, setPrixElecKwhActuel] = useState<number | undefined>(undefined)
  const [puissanceSouscriteActuelle, setPuissanceSouscriteActuelle] = useState<number | undefined>(undefined)
  const [defaultPrices, setDefaultPrices] = useState<{
    fioul: number
    gaz: number
    gpl: number
    bois: number
    electricite: number
  } | undefined>(undefined)
  const [totalCouts, setTotalCouts] = useState<number>(0)
  const [totalAides, setTotalAides] = useState<number>(0)

  // Données pour les calculateurs d'aides
  const [typePac, setTypePac] = useState<string | undefined>(undefined)
  const [anneeConstruction, setAnneeConstruction] = useState<number | undefined>(undefined)
  const [codePostal, setCodePostal] = useState<string | undefined>(undefined)
  const [surfaceHabitable, setSurfaceHabitable] = useState<number | undefined>(undefined)
  const [nombreOccupants, setNombreOccupants] = useState<number | undefined>(undefined)

  const currentStepIndex = STEPS.findIndex((s) => s.key === step)
  const currentStep = STEPS[currentStepIndex]

  if (!currentStep) {
    router.push("/projects")
    return null
  }

  // State pour le formulaire
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Helper pour mettre à jour un champ dans le state
  const updateField = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }))
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }

  // Load existing data if any
  useEffect(() => {
    const loadData = async () => {
      try {
        const project = await getProject(projectId)

        // Load default prices for chauffage-actuel and projet-pac steps
        if (step === "chauffage-actuel" || step === "projet-pac") {
          const prices = await getDefaultEnergyPrices()
          setDefaultPrices(prices)
        }

        if (project) {
          // Store type_chauffage and electricity data for projet-pac step
          if (project.chauffageActuel?.type_chauffage) {
            setTypeChauffage(project.chauffageActuel.type_chauffage)
          }
          if (project.chauffageActuel?.prix_elec_kwh) {
            setPrixElecKwhActuel(project.chauffageActuel.prix_elec_kwh)
          }
          if (project.chauffageActuel?.puissance_souscrite_actuelle) {
            setPuissanceSouscriteActuelle(project.chauffageActuel.puissance_souscrite_actuelle)
          }

          // Store total costs and aids for financing step
          if (project.couts?.cout_total) {
            setTotalCouts(project.couts.cout_total)
          }
          if (project.aides?.total_aides) {
            setTotalAides(project.aides.total_aides)
          }

          // Store data for aid calculators (aides step)
          if (project.projetPac?.type_pac) {
            setTypePac(project.projetPac.type_pac)
          }
          if (project.logement?.annee_construction) {
            setAnneeConstruction(project.logement.annee_construction)
          }
          if (project.logement?.code_postal) {
            setCodePostal(project.logement.code_postal)
          }
          if (project.logement?.surface_habitable) {
            setSurfaceHabitable(project.logement.surface_habitable)
          }
          if (project.logement?.nombre_occupants) {
            setNombreOccupants(project.logement.nombre_occupants)
          }

          // Load form data based on current step
          if (step === "informations") {
            // Informations step: load from Project table directly (no separate table)
            const informationsData = {
              project_name: project.name || "",
              recipient_emails: project.recipientEmails || [],
            }
            setFormData(informationsData)
          } else {
            // Other steps: load from their respective section tables
            const sectionMap: Record<string, string> = {
              "logement": "logement",
              "chauffage-actuel": "chauffageActuel",
              "projet-pac": "projetPac",
              "couts": "couts",
              "aides": "aides",
              "financement": "financement",
            }

            const sectionKey = sectionMap[step]
            const sectionData = project[sectionKey as keyof typeof project]

            if (sectionData && typeof sectionData === 'object') {
              // Remove the ID, projectId, and timestamp fields before resetting
              const { id, projectId: _projectId, createdAt, updatedAt, ...data } = sectionData as any
              // Convert null values appropriately:
              // - For number fields: convert to undefined (not 0, to allow optional validation)
              // - For boolean fields: keep as null or undefined
              // - For string fields: keep as is
              const cleanedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) => {
                  if (value === null) {
                    return [key, undefined]
                  }
                  return [key, value]
                })
              )

              setFormData(cleanedData)
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
  }, [projectId, step])

  // Load default energy prices when user changes heating type (only on chauffage-actuel step)
  useEffect(() => {
    if (step !== "chauffage-actuel" || !formData.type_chauffage || isLoading || !defaultPrices) {
      return
    }

    // Only update the price field if it's undefined or null (never set)
    const typeChauffage = formData.type_chauffage
    switch (typeChauffage) {
      case "Fioul":
        if (formData.prix_fioul_litre === undefined || formData.prix_fioul_litre === null) {
          updateField("prix_fioul_litre", Math.round(defaultPrices.fioul * 1000) / 1000)
        }
        break
      case "Gaz":
        if (formData.prix_gaz_kwh === undefined || formData.prix_gaz_kwh === null) {
          updateField("prix_gaz_kwh", Math.round(defaultPrices.gaz * 1000) / 1000)
        }
        break
      case "GPL":
        if (formData.prix_gpl_kg === undefined || formData.prix_gpl_kg === null) {
          updateField("prix_gpl_kg", Math.round(defaultPrices.gpl * 1000) / 1000)
        }
        break
      case "Pellets":
        if (formData.prix_pellets_kg === undefined || formData.prix_pellets_kg === null) {
          updateField("prix_pellets_kg", Math.round(defaultPrices.bois * 1000) / 1000)
        }
        break
      case "Bois":
        // Pour le bois en stères: prix pellets/kg * 2000 kWh/stère / 4.8 kWh/kg ≈ prix/kg * 416
        const prixBoisStere = Math.round(defaultPrices.bois * 416.67 * 1000) / 1000
        if (formData.prix_bois_stere === undefined || formData.prix_bois_stere === null) {
          updateField("prix_bois_stere", prixBoisStere)
        }
        break
      case "Electrique":
      case "PAC Air/Air":
      case "PAC Air/Eau":
      case "PAC Eau/Eau":
        if (formData.prix_elec_kwh === undefined || formData.prix_elec_kwh === null) {
          updateField("prix_elec_kwh", Math.round(defaultPrices.electricite * 1000) / 1000)
        }
        break
    }
  }, [formData.type_chauffage, step, isLoading, defaultPrices])

  // Auto-fill prix_elec_kwh on projet-pac step
  useEffect(() => {
    if (step !== "projet-pac" || !defaultPrices || isLoading) {
      return
    }

    // Only update if it's undefined (never set)
    if (formData.prix_elec_kwh === undefined) {
      updateField("prix_elec_kwh", Math.round(defaultPrices.electricite * 1000) / 1000)
    }
  }, [step, defaultPrices, isLoading, formData.prix_elec_kwh])

  const onSubmit = async (data: any) => {
    console.log("🚀 Form submission started", { step, data })
    setIsSubmitting(true)
    try {
      let validatedData = data

      // Manual validation for refactored steps
      const refactoredSteps = ["informations", "logement", "chauffage-actuel", "projet-pac", "couts", "aides", "financement"]
      if (refactoredSteps.includes(step)) {
        const schema = SCHEMAS[step as keyof typeof SCHEMAS]
        const result = schema.safeParse(formData)

        const errorMap: Record<string, string> = {}

        // Collect Zod validation errors
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            if (issue.path.length > 0) {
              const fieldName = issue.path[0].toString()
              if (!errorMap[fieldName]) {
                errorMap[fieldName] = issue.message
              }
            }
          })
        }

        // For projet-pac step, add manual validation for conditional fields
        if (step === "projet-pac") {
          const typePac = formData.type_pac
          const isWaterBased = typePac === "Air/Eau" || typePac === "Eau/Eau"

          if (isWaterBased) {
            if (formData.temperature_depart === undefined) {
              errorMap.temperature_depart = "La température de départ est requise pour les PAC hydrauliques"
            }
            if (formData.emetteurs === undefined) {
              errorMap.emetteurs = "Le type d'émetteurs est requis pour les PAC hydrauliques"
            }
          }
        }

        // If there are any errors (from Zod or manual), show them
        if (Object.keys(errorMap).length > 0) {
          setErrors(errorMap)
          setIsSubmitting(false)
          return
        }

        validatedData = result.data
      }

      // Call the appropriate Server Action based on current step
      switch (step) {
        case "informations":
          await saveInformationsData(projectId, validatedData)
          break
        case "logement":
          await saveHousingData(projectId, validatedData)
          break
        case "chauffage-actuel":
          console.log("💾 Saving current heating data...")
          await saveCurrentHeatingData(projectId, validatedData)
          break
        case "projet-pac":
          await saveHeatPumpProjectData(projectId, validatedData)
          break
        case "couts":
          await saveCostsData(projectId, validatedData)
          break
        case "aides":
          await saveFinancialAidData(projectId, validatedData)
          break
        case "financement":
          await saveFinancingData(projectId, validatedData)
          break
        default:
          throw new Error("Invalid step")
      }

      console.log("✅ Data saved successfully")

      // Update project step to next step (step numbers start at 1)
      const nextStepNumber = currentStepIndex + 2 // +1 for array index, +1 for next step
      await updateProjectStep(projectId, nextStepNumber)

      console.log("📍 Navigating to next step...")

      // Navigate to next step or results
      if (currentStepIndex < STEPS.length - 1) {
        const nextStep = STEPS[currentStepIndex + 1]
        router.push(`/projects/${projectId}/${nextStep.key}`)
      } else {
        router.push(`/projects/${projectId}/results`)
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error)
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const previousStep = STEPS[currentStepIndex - 1]
      router.push(`/projects/${projectId}/${previousStep.key}`)
    } else {
      router.push("/projects")
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Section titre - toujours visible immédiatement */}
      <Card className="shadow-2xl border-2 mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{currentStep.title}</h1>
              <p className="text-muted-foreground mt-2">{currentStep.description}</p>
            </div>
            <div className="text-sm text-muted-foreground ml-4 whitespace-nowrap">
              Étape {currentStepIndex + 1} / {STEPS.length}
            </div>
          </div>

          {/* Help button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 mb-4 -ml-2"
          >
            <Info className="h-4 w-4 mr-2" />
            Pourquoi ces informations ?
            {showExplanation ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>

          {/* Collapsible explanation */}
          {showExplanation && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground flex-1">
                  {STEP_EXPLANATIONS[step as string] || currentStep.description}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExplanation(false)}
                  className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-foreground h-2 rounded-full transition-all"
              style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section questions - avec loader si données en chargement */}
      {isLoading ? (
        <Card className="shadow-2xl border-2">
          <CardContent className="pt-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        // All steps now use custom state management without React Hook Form
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit({})
          }}
          className="space-y-8"
        >
          <Card className="shadow-2xl border-2">
            <CardContent className="pt-6">
              {step === "informations" && (
                <InformationsFields
                  formData={formData}
                  errors={errors}
                  onChange={updateField}
                />
              )}
              {step === "logement" && (
                <HousingFields
                  formData={formData}
                  errors={errors}
                  onChange={updateField}
                />
              )}
              {step === "chauffage-actuel" && (
                <ChauffageActuelFields
                  formData={formData}
                  errors={errors}
                  onChange={updateField}
                  defaultPrices={defaultPrices}
                />
              )}
              {step === "projet-pac" && (
                <ProjetPacFields
                  formData={formData}
                  errors={errors}
                  onChange={updateField}
                  currentElectricPower={puissanceSouscriteActuelle}
                  defaultElectricityPrice={defaultPrices?.electricite}
                  prixElecKwhActuel={prixElecKwhActuel}
                  typeChauffageActuel={typeChauffage}
                />
              )}
              {step === "couts" && (
                <CoutsFields
                  formData={formData}
                  errors={errors}
                  onChange={updateField}
                />
              )}
              {step === "aides" && (
                <AidesFields
                  formData={formData}
                  errors={errors}
                  onChange={updateField}
                  typePac={typePac}
                  anneeConstruction={anneeConstruction}
                  codePostal={codePostal}
                  surfaceHabitable={surfaceHabitable}
                  nombreOccupants={nombreOccupants}
                />
              )}
              {step === "financement" && (
                <FinancementFields
                  formData={formData}
                  errors={errors}
                  onChange={updateField}
                  totalCouts={totalCouts}
                  totalAides={totalAides}
                />
              )}
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
      )}
    </div>
  )
}
