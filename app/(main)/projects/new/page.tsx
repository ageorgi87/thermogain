"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { heatingFormSchema, type HeatingFormData } from "@/lib/schemas/heating-form"
import { LogementSection } from "@/components/heating-form/logement-section"
import { ChauffageActuelSection } from "@/components/heating-form/chauffage-actuel-section"
import { ConsommationSection } from "@/components/heating-form/consommation-section"
import { ProjetPacSection } from "@/components/heating-form/projet-pac-section"
import { CoutsSection } from "@/components/heating-form/couts-section"
import { AidesSection } from "@/components/heating-form/aides-section"
import { FinancementSection } from "@/components/heating-form/financement-section"
import { EvolutionsSection } from "@/components/heating-form/evolutions-section"

export default function NewProjectPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<HeatingFormData>({
    resolver: zodResolver(heatingFormSchema),
    defaultValues: {
      logement: {
        departement: "",
        annee_construction: 2000,
        surface_habitable: 100,
        nombre_occupants: 2,
        isolation_murs: false,
        isolation_combles: false,
        double_vitrage: false,
      },
      chauffage_actuel: {
        type_chauffage: "Gaz",
        age_installation: 10,
        etat_installation: "Moyen",
      },
      consommation: {
        type_chauffage: "Gaz",
        conso_gaz_kwh: 12000,
        prix_gaz_kwh: 0.09,
      },
      projet_pac: {
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
    },
  })

  const watchTypeChauffage = form.watch("consommation.type_chauffage")
  const watchModeFinancement = form.watch("financement.mode_financement")
  const watchBallonEcs = form.watch("projet_pac.ballon_ecs")

  const onSubmit = async (data: HeatingFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/heating-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/projects/${result.id}/results`)
      } else {
        console.error("Failed to save project")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calculateur de Pompe à Chaleur</h1>
        <p className="text-muted-foreground mt-2">
          Analysez votre projet de remplacement de chauffage par une pompe à chaleur
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <LogementSection form={form} />
          <ChauffageActuelSection form={form} />
          <ConsommationSection form={form} watchTypeChauffage={watchTypeChauffage} />
          <ProjetPacSection form={form} watchBallonEcs={watchBallonEcs} />
          <CoutsSection form={form} />
          <AidesSection form={form} />
          <FinancementSection form={form} watchModeFinancement={watchModeFinancement} />
          <EvolutionsSection form={form} />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/projects")}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Calculer les résultats
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
