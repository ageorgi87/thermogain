"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Eye, Loader2, Calculator } from "lucide-react"
import { getProjects, deleteProject } from "@/lib/actions/projects"
import { WIZARD_STEPS, getTotalSteps, getStepNumber, getProjectStatus, getStepKey } from "@/lib/wizardSteps"

type Project = {
  id: string
  name: string
  currentStep: number
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      await deleteProject(deleteId)
      setProjects(projects.filter((p) => p.id !== deleteId))
      setDeleteId(null)
    } catch (error) {
      console.error("Failed to delete project:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getProjectEditUrl = (project: Project) => {
    const totalSteps = getTotalSteps()

    // Si toutes les étapes sont complétées, aller à la première étape
    if (project.completed || project.currentStep > totalSteps) {
      return `/projects/${project.id}/${WIZARD_STEPS[0].key}`
    }

    // Sinon, aller à l'étape courante (currentStep est 1-indexed)
    const stepKey = getStepKey(project.currentStep) || WIZARD_STEPS[0].key
    return `/projects/${project.id}/${stepKey}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Vos Projets
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gérez vos études de rentabilité pompes à chaleur
          </p>
        </div>
        <Button
          onClick={() => router.push("/projects/create")}
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nouveau Projet PAC
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="shadow-2xl border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-950 rounded-full">
              <Calculator className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun projet pour le moment</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Créez votre premier projet pour commencer à évaluer la rentabilité des pompes à chaleur pour vos clients
            </p>
            <Button
              onClick={() => router.push("/projects/create")}
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Créer votre premier projet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-2xl border-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du projet</TableHead>
                <TableHead>Étape</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-bold">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      Étape {getStepNumber(project.currentStep)}/{getTotalSteps()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getProjectStatus(project.currentStep) === "Terminé" ? (
                      <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
                        Terminé
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">
                        En cours
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/projects/${project.id}/results`)}
                      title="Voir les résultats"
                      className="hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(getProjectEditUrl(project))}
                      title="Continuer le projet"
                      className="hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(project.id)}
                      title="Supprimer le projet"
                      className="hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le projet</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
