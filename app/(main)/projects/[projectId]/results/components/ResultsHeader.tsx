import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil } from "lucide-react"

interface ResultsHeaderProps {
  projectName: string
  projectId: string
}

export function ResultsHeader({ projectName, projectId }: ResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux projets
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{projectName}</h1>
        <p className="text-muted-foreground mt-2">
          Analyse des économies et rentabilité de votre projet PAC
        </p>
      </div>
      <Link href={`/projects/${projectId}/logement`}>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Modifier le projet
        </Button>
      </Link>
    </div>
  )
}
