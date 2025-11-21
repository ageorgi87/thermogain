import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, TrendingDown, TrendingUp, Calculator, Home, Zap, Euro, Calendar } from "lucide-react"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Helper function to calculate annual costs
function calculateAnnualCost(project: any) {
  let currentAnnualCost = 0

  // Calculate current energy cost based on type
  switch (project.type_energie) {
    case "Fioul":
      currentAnnualCost = (project.conso_fioul_litres || 0) * (project.prix_fioul_litre || 0)
      break
    case "Gaz":
      currentAnnualCost = (project.conso_gaz_kwh || 0) * (project.prix_gaz_kwh || 0)
      break
    case "GPL":
      currentAnnualCost = (project.conso_gpl_kg || 0) * (project.prix_gpl_kg || 0)
      break
    case "Pellets":
      currentAnnualCost = (project.conso_pellets_kg || 0) * (project.prix_pellets_kg || 0)
      break
    case "Bois":
      currentAnnualCost = (project.conso_bois_steres || 0) * (project.prix_bois_stere || 0)
      break
    case "Electrique":
      currentAnnualCost = (project.conso_elec_kwh || 0) * (project.prix_elec_kwh || 0)
      break
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      currentAnnualCost = (project.conso_pac_kwh || 0) * (project.prix_elec_kwh || 0.17)
      break
  }

  return currentAnnualCost
}

// Helper function to calculate PAC annual consumption and cost
function calculatePACCost(project: any) {
  // Get current energy consumption in kWh equivalent
  let currentEnergyKwh = 0

  switch (project.type_energie) {
    case "Fioul":
      currentEnergyKwh = (project.conso_fioul_litres || 0) * 10 // 1L fioul ≈ 10 kWh
      break
    case "Gaz":
      currentEnergyKwh = project.conso_gaz_kwh || 0
      break
    case "GPL":
      currentEnergyKwh = (project.conso_gpl_kg || 0) * 12.8 // 1kg GPL ≈ 12.8 kWh
      break
    case "Pellets":
      currentEnergyKwh = (project.conso_pellets_kg || 0) * 4.8 // 1kg pellets ≈ 4.8 kWh
      break
    case "Bois":
      currentEnergyKwh = (project.conso_bois_steres || 0) * 2000 // 1 stère ≈ 2000 kWh
      break
    case "Electrique":
      currentEnergyKwh = project.conso_elec_kwh || 0
      break
  }

  // Calculate PAC consumption using COP
  const pacConsumptionKwh = currentEnergyKwh / (project.cop_estime || 3.5)
  const pacAnnualCost = pacConsumptionKwh * (project.prix_elec_kwh || 0.17)

  return { pacConsumptionKwh, pacAnnualCost }
}

// Helper function to calculate payback period
function calculatePaybackPeriod(
  investmentCost: number,
  annualSavings: number,
  priceEvolutionDiff: number
) {
  if (annualSavings <= 0) return null

  let cumulativeSavings = 0
  let year = 0
  let currentSavings = annualSavings

  while (cumulativeSavings < investmentCost && year < 50) {
    year++
    cumulativeSavings += currentSavings
    currentSavings *= (1 + priceEvolutionDiff / 100) // Apply price evolution difference
  }

  return year <= 50 ? year : null
}

export default async function HeatingResultsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect("/login")
  }

  const { id } = await params

  const project = await prisma.heatingProject.findUnique({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!project) {
    redirect("/projects")
  }

  // Calculate results
  const currentAnnualCost = calculateAnnualCost(project)
  const { pacConsumptionKwh, pacAnnualCost } = calculatePACCost(project)
  const annualSavings = currentAnnualCost - pacAnnualCost
  const priceEvolutionDiff = project.evolution_prix_energie - project.evolution_prix_electricite
  const paybackPeriod = calculatePaybackPeriod(
    project.reste_a_charge,
    annualSavings,
    priceEvolutionDiff
  )

  // Calculate savings over study period
  let totalSavingsOverPeriod = 0
  let currentYearSavings = annualSavings
  for (let year = 1; year <= project.duree_etude_annees; year++) {
    totalSavingsOverPeriod += currentYearSavings
    currentYearSavings *= (1 + priceEvolutionDiff / 100)
  }

  const netBenefit = totalSavingsOverPeriod - project.reste_a_charge

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux projets
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Résultats de l&apos;analyse</h1>
        <p className="text-muted-foreground mt-2">
          Analyse détaillée de votre projet de pompe à chaleur
        </p>
      </div>

      {/* Summary Alert */}
      <Alert className={netBenefit > 0 ? "border-green-500" : "border-orange-500"}>
        <Calculator className="h-4 w-4" />
        <AlertTitle className="text-lg font-semibold">
          {netBenefit > 0 ? "Projet rentable" : "Rentabilité limitée"}
        </AlertTitle>
        <AlertDescription className="mt-2">
          {netBenefit > 0 ? (
            <p>
              Sur {project.duree_etude_annees} ans, ce projet vous permettra d&apos;économiser{" "}
              <strong className="text-green-600">{totalSavingsOverPeriod.toFixed(0)} €</strong> avec un
              bénéfice net de <strong className="text-green-600">{netBenefit.toFixed(0)} €</strong>{" "}
              après déduction de l&apos;investissement.
              {paybackPeriod && ` Retour sur investissement en ${paybackPeriod} ans.`}
            </p>
          ) : (
            <p>
              Sur {project.duree_etude_annees} ans, les économies générées ({totalSavingsOverPeriod.toFixed(0)} €)
              ne couvrent pas entièrement l&apos;investissement. Déficit de{" "}
              <strong className="text-orange-600">{Math.abs(netBenefit).toFixed(0)} €</strong>.
              Envisagez d&apos;augmenter les aides ou de prolonger la durée d&apos;étude.
            </p>
          )}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {/* Housing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Logement
            </CardTitle>
            <CardDescription>Caractéristiques de votre habitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Département</span>
              <Badge variant="outline">{project.departement}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Année de construction</span>
              <span className="font-medium">{project.annee_construction}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Surface habitable</span>
              <span className="font-medium">{project.surface_habitable} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Occupants</span>
              <span className="font-medium">{project.nombre_occupants}</span>
            </div>
            <Separator className="my-3" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Isolation</p>
              <div className="flex gap-2 flex-wrap">
                {project.isolation_murs && <Badge variant="secondary">Murs</Badge>}
                {project.isolation_combles && <Badge variant="secondary">Combles</Badge>}
                {project.double_vitrage && <Badge variant="secondary">Double vitrage</Badge>}
                {!project.isolation_murs && !project.isolation_combles && !project.double_vitrage && (
                  <span className="text-sm text-muted-foreground">Aucune isolation déclarée</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current vs Future Consumption */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Consommation
            </CardTitle>
            <CardDescription>Comparaison actuel vs PAC</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Chauffage actuel</span>
                <Badge>{project.type_chauffage_actuel}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Coût annuel actuel</span>
                <span className="text-2xl font-bold text-red-600">
                  {currentAnnualCost.toFixed(0)} €
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">PAC {project.type_pac}</span>
                <Badge variant="secondary">COP {project.cop_estime}</Badge>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Consommation</span>
                <span className="text-sm font-medium">{pacConsumptionKwh.toFixed(0)} kWh/an</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Coût annuel PAC</span>
                <span className="text-2xl font-bold text-green-600">
                  {pacAnnualCost.toFixed(0)} €
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Économies annuelles</span>
              <div className="flex items-center gap-2">
                {annualSavings > 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-2xl font-bold ${annualSavings > 0 ? "text-green-600" : "text-red-600"}`}>
                  {annualSavings.toFixed(0)} €
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Financement
            </CardTitle>
            <CardDescription>Coûts et aides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coût PAC</span>
              <span className="font-medium">{project.cout_pac.toFixed(0)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Installation</span>
              <span className="font-medium">{project.cout_installation.toFixed(0)} €</span>
            </div>
            {project.cout_travaux_annexes && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Travaux annexes</span>
                <span className="font-medium">{project.cout_travaux_annexes.toFixed(0)} €</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Coût total</span>
              <span className="font-bold">{project.cout_total.toFixed(0)} €</span>
            </div>

            <Separator className="my-3" />

            {project.ma_prime_renov && (
              <div className="flex justify-between text-green-600">
                <span>MaPrimeRénov&apos;</span>
                <span className="font-medium">-{project.ma_prime_renov.toFixed(0)} €</span>
              </div>
            )}
            {project.cee && (
              <div className="flex justify-between text-green-600">
                <span>CEE</span>
                <span className="font-medium">-{project.cee.toFixed(0)} €</span>
              </div>
            )}
            {project.autres_aides && (
              <div className="flex justify-between text-green-600">
                <span>Autres aides</span>
                <span className="font-medium">-{project.autres_aides.toFixed(0)} €</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total des aides</span>
              <span className="font-bold text-green-600">-{project.total_aides.toFixed(0)} €</span>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between">
              <span className="text-lg font-semibold">Reste à charge</span>
              <span className="text-2xl font-bold">{project.reste_a_charge.toFixed(0)} €</span>
            </div>

            {project.mode_financement !== "Comptant" && project.mensualite && (
              <>
                <Separator className="my-3" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensualité ({project.mode_financement})</span>
                  <span className="font-semibold">{project.mensualite.toFixed(2)} €/mois</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payback Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rentabilité
            </CardTitle>
            <CardDescription>Analyse sur {project.duree_etude_annees} ans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paybackPeriod && (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Retour sur investissement</div>
                <div className="text-3xl font-bold text-green-600">{paybackPeriod} ans</div>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Économies totales sur la période</span>
              <span className="font-semibold text-green-600">
                {totalSavingsOverPeriod.toFixed(0)} €
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Investissement (reste à charge)</span>
              <span className="font-semibold text-red-600">
                -{project.reste_a_charge.toFixed(0)} €
              </span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Bénéfice net</span>
              <span className={`text-2xl font-bold ${netBenefit > 0 ? "text-green-600" : "text-orange-600"}`}>
                {netBenefit > 0 ? "+" : ""}{netBenefit.toFixed(0)} €
              </span>
            </div>

            <Separator className="my-3" />

            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Évolution prix énergie actuelle</span>
                <span>+{project.evolution_prix_energie}% /an</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Évolution prix électricité</span>
                <span>+{project.evolution_prix_electricite}% /an</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Details */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Détails techniques du projet PAC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Type de PAC</p>
              <p className="font-semibold">{project.type_pac}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Puissance</p>
              <p className="font-semibold">{project.puissance_pac_kw} kW</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">COP estimé</p>
              <p className="font-semibold">{project.cop_estime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Température de départ</p>
              <p className="font-semibold">{project.temperature_depart}°C</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Émetteurs</p>
              <p className="font-semibold">{project.emetteurs}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ballon ECS</p>
              <p className="font-semibold">
                {project.ballon_ecs ? `Oui (${project.volume_ballon}L)` : "Non"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex gap-4">
        <Link href="/projects/heating-calculator">
          <Button variant="outline">Nouveau calcul</Button>
        </Link>
        <Link href="/projects">
          <Button>Retour aux projets</Button>
        </Link>
      </div>
    </div>
  )
}
