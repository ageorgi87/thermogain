"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createProject } from "@/lib/actions/projects"

export default function NewProjectPage() {
  const router = useRouter()

  useEffect(() => {
    const createNewProject = async () => {
      try {
        const project = await createProject({ name: "Projet PAC" })
        router.push(`/projects/new/${project.id}/logement`)
      } catch (error) {
        console.error("Error creating project:", error)
        router.push("/projects")
      }
    }

    createNewProject()
  }, [router])

  return (
    <div className="container mx-auto py-8 max-w-4xl flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Initialisation du projet...</p>
      </div>
    </div>
  )
}
