import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil } from "lucide-react"
import { getFirstStepKey } from "@/lib/wizardSteps"

interface ResultsHeaderProps {
  projectName: string
  projectId: string
}

export function ResultsHeader({ projectName, projectId }: ResultsHeaderProps) {
  const firstStepKey = getFirstStepKey()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Analyse de rentabilité</h1>
        <p className="text-muted-foreground mt-2">
          Résultat de l'analyse de rentabilité de votre projet de PAC
        </p>
      </div>
      <Link href={`/projects/${projectId}/${firstStepKey}`}>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Modifier le projet
        </Button>
      </Link>
    </div>
  )
}
