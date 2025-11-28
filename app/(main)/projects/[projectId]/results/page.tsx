import { getProject } from "@/lib/actions/projects"
import { notFound, redirect } from "next/navigation"
import { calculateAllResults, ProjectData } from "../calculations"
import { calculatePacConsumptionKwh } from "../calculations/pacConsumption/pacConsumption"
import { validatePacPower } from "@/lib/copAdjustments"
import { ResultsHeader } from "./components/ResultsHeader"
import { CumulativeCostChart } from "./components/CumulativeCostChart"
import { ConsumptionCard } from "./components/ConsumptionCard"
import { FinancialSummaryCard } from "./components/FinancialSummaryCard"
import { ProfitabilityCard } from "./components/ProfitabilityCard"
import { YearlyBreakdownTable } from "./components/YearlyBreakdownTable"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calculator, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

interface PageProps {
  params: Promise<{
    projectId: string
  }>
}

// Helper function to format payback period
function formatPaybackPeriod(period: number | null): string {
  if (!period) return ""

  const years = Math.floor(period)
  const months = Math.round((period - years) * 12)

  if (months === 0) {
    return `${years} an${years > 1 ? 's' : ''}`
  }

  return `${years} an${years > 1 ? 's' : ''} et ${months} mois`
}

export default async function ResultsPage({ params }: PageProps) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    notFound()
  }

  // Check if all required data is present
  if (
    !project.logement ||
    !project.chauffageActuel ||
    !project.projetPac ||
    !project.couts ||
    !project.aides
  ) {
    redirect(`/projects/${projectId}/logement`)
  }

  // Validate PAC power based on housing characteristics
  const powerValidation = validatePacPower(
    project.projetPac.puissance_pac_kw,
    project.logement.surface_habitable,
    project.logement.annee_construction,
    project.logement.qualite_isolation,
    project.logement.code_postal
  )

  // Le prix de l'électricité est maintenant renseigné dans "Projet PAC"
  // (obligatoire, nécessaire pour calculer le coût de la PAC)
  const prixElecKwh = project.projetPac.prix_elec_kwh || 0

  // Prepare data for calculations
  const projectData: ProjectData = {
    type_chauffage: project.chauffageActuel.type_chauffage,
    conso_fioul_litres: project.chauffageActuel.conso_fioul_litres || undefined,
    prix_fioul_litre: project.chauffageActuel.prix_fioul_litre || undefined,
    conso_gaz_kwh: project.chauffageActuel.conso_gaz_kwh || undefined,
    prix_gaz_kwh: project.chauffageActuel.prix_gaz_kwh || undefined,
    conso_gpl_kg: project.chauffageActuel.conso_gpl_kg || undefined,
    prix_gpl_kg: project.chauffageActuel.prix_gpl_kg || undefined,
    conso_pellets_kg: project.chauffageActuel.conso_pellets_kg || undefined,
    prix_pellets_kg: project.chauffageActuel.prix_pellets_kg || undefined,
    conso_bois_steres: project.chauffageActuel.conso_bois_steres || undefined,
    prix_bois_stere: project.chauffageActuel.prix_bois_stere || undefined,
    conso_elec_kwh: project.chauffageActuel.conso_elec_kwh || undefined,
    prix_elec_kwh: prixElecKwh,
    cop_actuel: project.chauffageActuel.cop_actuel || undefined,
    conso_pac_kwh: project.chauffageActuel.conso_pac_kwh || undefined,

    // Nouveaux champs pour coûts fixes système actuel (Novembre 2024)
    puissance_souscrite_actuelle: project.projetPac.puissance_souscrite_actuelle || undefined,
    abonnement_gaz: project.chauffageActuel.abonnement_gaz || undefined,
    entretien_annuel: project.chauffageActuel.entretien_annuel || undefined,

    type_pac: project.projetPac.type_pac,
    puissance_pac_kw: project.projetPac.puissance_pac_kw,
    cop_estime: project.projetPac.cop_estime,
    temperature_depart: project.projetPac.temperature_depart || 45, // Fallback si null
    emetteurs: project.projetPac.emetteurs || "Radiateurs basse température", // Fallback si null
    duree_vie_pac: project.projetPac.duree_vie_pac,

    // Nouveaux champs pour coûts fixes PAC (Novembre 2024)
    puissance_souscrite_pac: project.projetPac.puissance_souscrite_pac || undefined,
    entretien_pac_annuel: project.projetPac.entretien_pac_annuel || undefined,
    prix_elec_pac: project.projetPac.prix_elec_pac || undefined,

    code_postal: project.logement.code_postal || undefined,
    cout_total: project.couts.cout_total,
    reste_a_charge: project.couts.cout_total - project.aides.total_aides,
    // Les taux d'évolution ne sont plus passés ici - ils sont calculés automatiquement
    // via le modèle Mean Reversion depuis l'API DIDO dans les fonctions de calcul
    mode_financement: project.financement?.mode_financement || undefined,
    montant_credit: project.financement?.montant_credit || undefined,
    taux_interet: project.financement?.taux_interet || undefined,
    duree_credit_mois: project.financement?.duree_credit_mois || undefined,
    apport_personnel: project.financement?.apport_personnel || undefined,
  }

  // Calculate all results
  const results = calculateAllResults(projectData)

  // Calculate PAC consumption for ConsumptionCard
  const pacConsumptionKwh = calculatePacConsumptionKwh(projectData)

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-8">
      <ResultsHeader projectName={project.name} projectId={project.id} />

      {/* Power Validation Warning */}
      {!powerValidation.isValid && (
        <Alert className="border-2 bg-white text-foreground relative md:pr-24">
          <AlertTriangle className="h-5 w-5 !text-red-600" />
          <AlertTitle className="text-lg font-semibold">Attention : Dimensionnement de la PAC</AlertTitle>
          <AlertDescription className="mt-1.5 text-foreground whitespace-pre-line">
            {powerValidation.message}
          </AlertDescription>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none">
            <AlertTriangle className="h-16 w-16 text-red-600 opacity-60" />
          </div>
        </Alert>
      )}

      {/* Summary Alert */}
      <Alert className="border-2 bg-white text-foreground relative md:pr-24">
        {results.netBenefitLifetime > 0 ? (
          <CheckCircle2 className="h-5 w-5 !text-brand-teal-600" />
        ) : (
          <XCircle className="h-5 w-5 !text-red-600" />
        )}
        <AlertTitle className="text-lg font-semibold">
          {results.netBenefitLifetime > 0 ? "Projet rentable" : "Rentabilité limitée"}
        </AlertTitle>
        <AlertDescription className="mt-1.5 text-foreground">
          {results.netBenefitLifetime > 0 ? (
            <p>
              {results.paybackPeriod && results.paybackYear ? (
                <>
                  Votre investissement sera rentabilisé en <strong className="text-lg">{formatPaybackPeriod(results.paybackPeriod)}</strong> (en {results.paybackYear}),
                  pour un bénéfice net de <strong className="text-lg">{results.netBenefitLifetime.toLocaleString("fr-FR")} €</strong> sur <strong className="text-lg">{projectData.duree_vie_pac} ans</strong>.
                </>
              ) : (
                <>
                  Bénéfice net sur <strong className="text-lg">{projectData.duree_vie_pac} ans</strong> : <strong className="text-lg">{results.netBenefitLifetime.toLocaleString("fr-FR")} €</strong>
                </>
              )}
            </p>
          ) : (
            <p>
              Les économies générées sur <strong className="text-lg">{projectData.duree_vie_pac} ans</strong> ne couvrent pas entièrement l&apos;investissement,
              avec un déficit de <strong className="text-lg">{Math.abs(results.netBenefitLifetime).toLocaleString("fr-FR")} €</strong>.
            </p>
          )}
        </AlertDescription>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none">
          {results.netBenefitLifetime > 0 ? (
            <CheckCircle2 className="h-16 w-16 text-brand-teal-600 opacity-60" />
          ) : (
            <XCircle className="h-16 w-16 text-red-600 opacity-60" />
          )}
        </div>
      </Alert>

      {/* Graphique principal des coûts cumulés */}
      <CumulativeCostChart
        yearlyData={results.yearlyData}
        investmentCost={results.investissementReel}
        paybackYear={results.paybackYear}
        paybackPeriod={results.paybackPeriod}
        modeFinancement={project.financement?.mode_financement}
        montantCredit={project.financement?.montant_credit || undefined}
        dureeCreditMois={project.financement?.duree_credit_mois || undefined}
        apportPersonnel={project.financement?.apport_personnel || undefined}
      />

      {/* Tableau détaillé année par année */}
      <YearlyBreakdownTable
        yearlyData={results.yearlyData}
        projectData={projectData}
        investissementReel={results.investissementReel}
        modeFinancement={project.financement?.mode_financement}
        montantCredit={project.financement?.montant_credit || undefined}
        tauxInteret={project.financement?.taux_interet || undefined}
        dureeCreditMois={project.financement?.duree_credit_mois || undefined}
        apportPersonnel={project.financement?.apport_personnel || undefined}
      />

      {/* Cartes détaillées */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ConsumptionCard
          typeChauffage={projectData.type_chauffage}
          typePac={project.projetPac.type_pac}
          copEstime={projectData.cop_estime}
          coutAnnuelActuel={results.coutAnnuelActuel}
          coutAnnuelPac={results.coutAnnuelPac}
          economiesAnnuelles={results.economiesAnnuelles}
          pacConsumptionKwh={pacConsumptionKwh}
          coutTotalActuelLifetime={results.coutTotalActuelLifetime}
          coutTotalPacLifetime={results.coutTotalPacLifetime}
          dureeVie={projectData.duree_vie_pac}
        />
        <FinancialSummaryCard
          coutPac={project.couts.cout_pac}
          coutInstallation={project.couts.cout_installation}
          coutTravauxAnnexes={project.couts.cout_travaux_annexes || undefined}
          coutTotal={project.couts.cout_total}
          maPrimeRenov={project.aides.ma_prime_renov || undefined}
          cee={project.aides.cee || undefined}
          autresAides={project.aides.autres_aides || undefined}
          totalAides={project.aides.total_aides}
          resteACharge={project.couts.cout_total - project.aides.total_aides}
          modeFinancement={project.financement?.mode_financement || undefined}
          mensualite={results.mensualiteCredit}
        />
        <ProfitabilityCard
          paybackPeriod={results.paybackPeriod}
          paybackYear={results.paybackYear}
          totalSavingsLifetime={results.totalSavingsLifetime}
          resteACharge={projectData.reste_a_charge}
          netBenefit={results.netBenefitLifetime}
          dureeVie={projectData.duree_vie_pac}
          tauxRentabilite={results.tauxRentabilite}
        />
      </div>
    </div>
  )
}
