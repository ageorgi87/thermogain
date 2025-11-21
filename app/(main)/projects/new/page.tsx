"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { heatingFormSchema, type HeatingFormData } from "@/lib/schemas/heating-form"

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
          {/* Logement Section */}
          <Card>
            <CardHeader>
              <CardTitle>Informations sur le logement</CardTitle>
              <CardDescription>
                Caractéristiques principales de votre habitation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="logement.departement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 75" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="logement.annee_construction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année de construction</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  name="logement.surface_habitable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surface habitable (m²)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                name="logement.nombre_occupants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre d&apos;occupants</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Isolation et équipements</FormLabel>
                <FormField
                  control={form.control}
                  name="logement.isolation_murs"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Isolation des murs
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logement.isolation_combles"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Isolation des combles
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logement.double_vitrage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Double vitrage
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Chauffage Actuel Section */}
          <Card>
            <CardHeader>
              <CardTitle>Chauffage actuel</CardTitle>
              <CardDescription>
                Informations sur votre système de chauffage existant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="chauffage_actuel.type_chauffage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de chauffage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fioul">Fioul</SelectItem>
                        <SelectItem value="Gaz">Gaz</SelectItem>
                        <SelectItem value="GPL">GPL</SelectItem>
                        <SelectItem value="Pellets">Pellets</SelectItem>
                        <SelectItem value="Bois">Bois</SelectItem>
                        <SelectItem value="Electrique">Électrique</SelectItem>
                        <SelectItem value="PAC Air/Air">PAC Air/Air</SelectItem>
                        <SelectItem value="PAC Air/Eau">PAC Air/Eau</SelectItem>
                        <SelectItem value="PAC Eau/Eau">PAC Eau/Eau</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chauffage_actuel.age_installation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Âge de l&apos;installation (années)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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
                  name="chauffage_actuel.etat_installation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>État de l&apos;installation</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bon">Bon</SelectItem>
                          <SelectItem value="Moyen">Moyen</SelectItem>
                          <SelectItem value="Mauvais">Mauvais</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Consommation Section */}
          <Card>
            <CardHeader>
              <CardTitle>Consommation actuelle</CardTitle>
              <CardDescription>
                Votre consommation énergétique annuelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="consommation.type_chauffage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d&apos;énergie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fioul">Fioul</SelectItem>
                        <SelectItem value="Gaz">Gaz</SelectItem>
                        <SelectItem value="GPL">GPL</SelectItem>
                        <SelectItem value="Pellets">Pellets</SelectItem>
                        <SelectItem value="Bois">Bois</SelectItem>
                        <SelectItem value="Electrique">Électrique</SelectItem>
                        <SelectItem value="PAC Air/Air">PAC Air/Air</SelectItem>
                        <SelectItem value="PAC Air/Eau">PAC Air/Eau</SelectItem>
                        <SelectItem value="PAC Eau/Eau">PAC Eau/Eau</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional fields based on type_chauffage */}
              {watchTypeChauffage === "Fioul" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="consommation.conso_fioul_litres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consommation (litres/an)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                    name="consommation.prix_fioul_litre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€/litre)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchTypeChauffage === "Gaz" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="consommation.conso_gaz_kwh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consommation (kWh/an)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                    name="consommation.prix_gaz_kwh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€/kWh)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchTypeChauffage === "GPL" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="consommation.conso_gpl_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consommation (kg/an)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                    name="consommation.prix_gpl_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€/kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchTypeChauffage === "Pellets" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="consommation.conso_pellets_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consommation (kg/an)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                    name="consommation.prix_pellets_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€/kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchTypeChauffage === "Bois" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="consommation.conso_bois_steres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consommation (stères/an)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                    name="consommation.prix_bois_stere"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€/stère)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchTypeChauffage === "Electrique" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="consommation.conso_elec_kwh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consommation (kWh/an)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                    name="consommation.prix_elec_kwh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix (€/kWh)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {(watchTypeChauffage === "PAC Air/Air" ||
                watchTypeChauffage === "PAC Air/Eau" ||
                watchTypeChauffage === "PAC Eau/Eau") && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="consommation.cop_actuel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>COP actuel</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="consommation.conso_pac_kwh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consommation (kWh/an)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projet PAC Section */}
          <Card>
            <CardHeader>
              <CardTitle>Projet de pompe à chaleur</CardTitle>
              <CardDescription>
                Caractéristiques de la PAC envisagée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="projet_pac.type_pac"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de PAC</FormLabel>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projet_pac.puissance_pac_kw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puissance (kW)</FormLabel>
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

                <FormField
                  control={form.control}
                  name="projet_pac.cop_estime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>COP estimé</FormLabel>
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

              <FormField
                control={form.control}
                name="projet_pac.temperature_depart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Température de départ (°C)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="projet_pac.emetteurs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d&apos;émetteurs</FormLabel>
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

              <FormField
                control={form.control}
                name="projet_pac.ballon_ecs"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Ballon d&apos;eau chaude sanitaire (ECS)
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {watchBallonEcs && (
                <FormField
                  control={form.control}
                  name="projet_pac.volume_ballon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume du ballon (litres)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Coûts Section */}
          <Card>
            <CardHeader>
              <CardTitle>Coûts du projet</CardTitle>
              <CardDescription>
                Détail des investissements nécessaires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="couts.cout_pac"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coût de la PAC (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="couts.cout_installation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coût d&apos;installation (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="couts.cout_travaux_annexes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travaux annexes (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Isolation, remplacement radiateurs, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="couts.cout_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Coût total (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Aides Section */}
          <Card>
            <CardHeader>
              <CardTitle>Aides financières</CardTitle>
              <CardDescription>
                Subventions et aides disponibles pour votre projet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="aides.ma_prime_renov"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MaPrimeRénov&apos; (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aides.cee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEE (Certificats d&apos;Économies d&apos;Énergie) (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aides.autres_aides"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autres aides (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Aides locales, régionales, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="aides.total_aides"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Total des aides (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aides.reste_a_charge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Reste à charge (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Financement Section */}
          <Card>
            <CardHeader>
              <CardTitle>Financement</CardTitle>
              <CardDescription>
                Mode de financement du reste à charge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="financement.mode_financement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de financement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Comptant">Comptant</SelectItem>
                        <SelectItem value="Crédit">Crédit</SelectItem>
                        <SelectItem value="Mixte">Mixte</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(watchModeFinancement === "Crédit" || watchModeFinancement === "Mixte") && (
                <>
                  {watchModeFinancement === "Mixte" && (
                    <FormField
                      control={form.control}
                      name="financement.apport_personnel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apport personnel (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="financement.montant_credit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant du crédit (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="financement.taux_interet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taux d&apos;intérêt (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="financement.duree_credit_mois"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée (mois)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number(e.target.value) : undefined)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="financement.mensualite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensualité estimée (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Évolutions Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hypothèses d&apos;évolution</CardTitle>
              <CardDescription>
                Évolution des prix de l&apos;énergie sur la période d&apos;étude
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="evolutions.evolution_prix_energie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Évolution du prix de l&apos;énergie actuelle (%/an)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Augmentation annuelle estimée (ex: 5 pour +5%/an)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="evolutions.evolution_prix_electricite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Évolution du prix de l&apos;électricité (%/an)</FormLabel>
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

              <FormField
                control={form.control}
                name="evolutions.duree_etude_annees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée de l&apos;étude (années)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Période sur laquelle analyser la rentabilité
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
