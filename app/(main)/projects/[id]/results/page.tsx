import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, TrendingDown, TrendingUp, Calculator, Zap, Euro, Calendar } from "lucide-react"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Helper function to calculate annual costs
function calculateAnnualCost(project: any) {
  let currentAnnualCost = 0

  // Calculate current energy cost based on type
  switch (project.type_chauffage) {
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

  switch (project.type_chauffage) {
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
  const session = await auth()

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

  const project = await prisma.project.findUnique({
    where: {
      id,
      userId: user.id,
    },
    include: {
      logement: true,
      chauffageActuel: true,
      projetPac: true,
      couts: true,
      aides: true,
      financement: true,
      evolutions: true,
    },
  })

  if (!project || !project.completed) {
    redirect("/projects")
  }

  // Flatten project data for calculations
  const flatProject = {
    ...project,
    ...project.logement,
    ...project.chauffageActuel,
    ...project.projetPac,
    ...project.couts,
    ...project.aides,
    ...project.financement,
    ...project.evolutions,
    // Map old field names if needed
    type_energie: project.chauffageActuel?.type_chauffage,
    type_chauffage_actuel: project.chauffageActuel?.type_chauffage,
    prix_elec_kwh: 0.17, // Default electricity price
  }

  // Calculate results
  const currentAnnualCost = calculateAnnualCost(flatProject)
  const { pacConsumptionKwh, pacAnnualCost } = calculatePACCost(flatProject)
  const annualSavings = currentAnnualCost - pacAnnualCost

  // Get current energy price evolution based on heating type
  let currentEnergyEvolution = 0
  switch (flatProject.type_chauffage) {
    case "Fioul":
      currentEnergyEvolution = flatProject.evolution_prix_fioul || 0
      break
    case "Gaz":
      currentEnergyEvolution = flatProject.evolution_prix_gaz || 0
      break
    case "GPL":
      currentEnergyEvolution = flatProject.evolution_prix_gpl || 0
      break
    case "Pellets":
    case "Bois":
      currentEnergyEvolution = flatProject.evolution_prix_bois || 0
      break
    case "Electrique":
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      currentEnergyEvolution = flatProject.evolution_prix_electricite || 0
      break
  }

  const priceEvolutionDiff = currentEnergyEvolution - (flatProject.evolution_prix_electricite || 0)
  const paybackPeriod = calculatePaybackPeriod(
    flatProject.reste_a_charge || 0,
    annualSavings,
    priceEvolutionDiff
  )

  // Calculate savings over study period
  const STUDY_PERIOD_YEARS = 15
  let totalSavingsOverPeriod = 0
  let currentYearSavings = annualSavings
  for (let year = 1; year <= STUDY_PERIOD_YEARS; year++) {
    totalSavingsOverPeriod += currentYearSavings
    currentYearSavings *= (1 + priceEvolutionDiff / 100)
  }

  const netBenefit = totalSavingsOverPeriod - (flatProject.reste_a_charge || 0)

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
              Sur {STUDY_PERIOD_YEARS} ans, ce projet vous permettra d&apos;économiser{" "}
              <strong className="text-green-600">{totalSavingsOverPeriod.toFixed(0)} €</strong> avec un
              bénéfice net de <strong className="text-green-600">{netBenefit.toFixed(0)} €</strong>{" "}
              après déduction de l&apos;investissement.
              {paybackPeriod && ` Retour sur investissement en ${paybackPeriod} ans.`}
            </p>
          ) : (
            <p>
              Sur {STUDY_PERIOD_YEARS} ans, les économies générées ({totalSavingsOverPeriod.toFixed(0)} €)
              ne couvrent pas entièrement l&apos;investissement. Déficit de{" "}
              <strong className="text-orange-600">{Math.abs(netBenefit).toFixed(0)} €</strong>.
              Envisagez d&apos;augmenter les aides ou de prolonger la durée d&apos;étude.
            </p>
          )}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
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
                <Badge>{flatProject.type_chauffage_actuel}</Badge>
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
                <span className="text-sm text-muted-foreground">PAC {flatProject.type_pac}</span>
                <Badge variant="secondary">COP {flatProject.cop_estime}</Badge>
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
              <span className="font-medium">{(flatProject.cout_pac || 0).toFixed(0)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Installation</span>
              <span className="font-medium">{(flatProject.cout_installation || 0).toFixed(0)} €</span>
            </div>
            {flatProject.cout_travaux_annexes && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Travaux annexes</span>
                <span className="font-medium">{(flatProject.cout_travaux_annexes || 0).toFixed(0)} €</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Coût total</span>
              <span className="font-bold">{(flatProject.cout_total || 0).toFixed(0)} €</span>
            </div>

            <Separator className="my-3" />

            {flatProject.ma_prime_renov && (
              <div className="flex justify-between text-green-600">
                <span>MaPrimeRénov&apos;</span>
                <span className="font-medium">-{(flatProject.ma_prime_renov || 0).toFixed(0)} €</span>
              </div>
            )}
            {flatProject.cee && (
              <div className="flex justify-between text-green-600">
                <span>CEE</span>
                <span className="font-medium">-{(flatProject.cee || 0).toFixed(0)} €</span>
              </div>
            )}
            {flatProject.autres_aides && (
              <div className="flex justify-between text-green-600">
                <span>Autres aides</span>
                <span className="font-medium">-{(flatProject.autres_aides || 0).toFixed(0)} €</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total des aides</span>
              <span className="font-bold text-green-600">-{(flatProject.total_aides || 0).toFixed(0)} €</span>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between">
              <span className="text-lg font-semibold">Reste à charge</span>
              <span className="text-2xl font-bold">{(flatProject.reste_a_charge || 0).toFixed(0)} €</span>
            </div>

            {flatProject.mode_financement !== "Comptant" && flatProject.mensualite && (
              <>
                <Separator className="my-3" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensualité ({flatProject.mode_financement})</span>
                  <span className="font-semibold">{(flatProject.mensualite || 0).toFixed(2)} €/mois</span>
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
            <CardDescription>Analyse sur {STUDY_PERIOD_YEARS} ans</CardDescription>
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
                -{(flatProject.reste_a_charge || 0).toFixed(0)} €
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
                <span>+{currentEnergyEvolution}% /an</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Évolution prix électricité</span>
                <span>+{flatProject.evolution_prix_electricite}% /an</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
