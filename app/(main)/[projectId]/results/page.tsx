import { getProject } from "@/app/(main)/[projectId]/results/actions/getProject";
import { notFound, redirect } from "next/navigation";
import { ResultsHeader } from "./components/ResultsHeader";
import { CumulativeCostChart } from "./components/CumulativeCostChart";
import { ConsumptionCard } from "./components/ConsumptionCard";
import { FinancialSummaryCard } from "./components/FinancialSummaryCard";
import { ProfitabilityCard } from "./components/ProfitabilityCard";
import { YearlyBreakdownTable } from "./components/YearlyBreakdownTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getProjectResults } from "@/app/(main)/[projectId]/results/actions/getProjectResults";
import { formatPaybackPeriod } from "@/app/(main)/[projectId]/results/lib/formatPaybackPeriod";

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ResultsPage({ params }: PageProps) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  // Check if all required data is present
  if (
    !project.logement ||
    !project.chauffageActuel ||
    !project.projetPac ||
    !project.couts ||
    !project.aides
  ) {
    redirect(`/projects/${projectId}/logement`);
  }

  // Mark project as completed when accessing results page
  if (!project.completed) {
    await prisma.project.update({
      where: { id: projectId },
      data: { completed: true },
    });
  }

  // Get results from database (calculated when last step was completed)
  const results = await getProjectResults(projectId);

  // Results should always exist at this point (calculated during form completion)
  if (!results) {
    throw new Error(
      "Les résultats n'ont pas été calculés. Veuillez compléter toutes les étapes du formulaire."
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-8">
      <ResultsHeader
        projectId={project.id}
        userId={project.userId}
        hasRecipientEmails={
          project.recipientEmails && project.recipientEmails.length > 0
        }
      />

      {/* Summary Card */}
      <Card
        className={
          results.netBenefitLifetime > 0
            ? "border-brand-teal-200 bg-brand-teal-50 dark:bg-brand-teal-950"
            : "border-red-200 bg-red-50 dark:bg-red-950"
        }
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {results.netBenefitLifetime > 0 ? (
              <CheckCircle2 className="h-5 w-5 text-brand-teal-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {results.netBenefitLifetime > 0
              ? "Projet rentable"
              : "Projet non rentable"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Phrase de synthèse uniquement */}
          {results.netBenefitLifetime > 0 ? (
            <>
              {results.paybackPeriod && results.paybackYear ? (
                <p className="text-lg text-foreground">
                  Votre investissement sera rentabilisé en{" "}
                  <strong className="text-brand-teal-600 font-semibold">
                    {formatPaybackPeriod(results.paybackPeriod)}
                  </strong>{" "}
                  (en {results.paybackYear}), pour un bénéfice net de{" "}
                  <strong className="text-brand-teal-600 font-semibold">
                    {results.netBenefitLifetime.toLocaleString("fr-FR")} €
                  </strong>{" "}
                  sur {project.projetPac.duree_vie_pac} ans.
                </p>
              ) : (
                <p className="text-lg text-foreground">
                  Ce projet génère un bénéfice net de{" "}
                  <strong className="text-brand-teal-600 font-semibold">
                    {results.netBenefitLifetime.toLocaleString("fr-FR")} €
                  </strong>{" "}
                  sur {project.projetPac.duree_vie_pac} ans.
                </p>
              )}
            </>
          ) : (
            <p className="text-lg text-foreground">
              Ce projet génère un déficit de{" "}
              <strong className="text-red-600 font-semibold">
                {Math.abs(results.netBenefitLifetime).toLocaleString("fr-FR")} €
              </strong>{" "}
              sur une durée de {project.projetPac.duree_vie_pac} ans. Les
              économies générées ne couvrent pas l&apos;investissement.
            </p>
          )}
        </CardContent>
      </Card>

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
        projectData={project}
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
          economiesAnnuelles={results.economiesAnnuelles}
          coutTotalActuelLifetime={results.coutTotalActuelLifetime}
          coutTotalPacLifetime={results.coutTotalPacLifetime}
          dureeVie={project.projetPac.duree_vie_pac}
        />
        <FinancialSummaryCard
          resteACharge={project.couts.cout_total - project.aides.total_aides}
          modeFinancement={project.financement?.mode_financement || undefined}
          mensualite={results.mensualiteCredit}
          dureeCreditMois={project.financement?.duree_credit_mois || undefined}
        />
        <ProfitabilityCard
          paybackPeriod={results.paybackPeriod}
          paybackYear={results.paybackYear}
          netBenefit={results.netBenefitLifetime}
          dureeVie={project.projetPac.duree_vie_pac}
          tauxRentabilite={results.tauxRentabilite}
        />
      </div>
    </div>
  );
}
