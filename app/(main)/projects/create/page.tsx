"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createProject } from "@/lib/actions/projects/createProject"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"

export default function CreateProjectPage() {
  const router = useRouter()
  const hasCreatedProject = useRef(false)

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasCreatedProject.current) return

    const createNewProject = async () => {
      hasCreatedProject.current = true
      try {
        const project = await createProject({ name: "" })
        // Toujours rediriger vers la première étape du wizard
        const firstStep = WIZARD_STEPS[0].key
        router.push(`/projects/${project.id}/${firstStep}`)
      } catch (error) {
        console.error("Error creating project:", error)
        router.push("/projects")
      }
    }

    createNewProject()
  }, [])

  return (
    <div className="container mx-auto py-8 max-w-4xl flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Initialisation du projet...</p>
      </div>
    </div>
  )
}
