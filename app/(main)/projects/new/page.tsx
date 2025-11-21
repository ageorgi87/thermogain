"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function NewProjectPage() {
  const router = useRouter()

  useEffect(() => {
    const createProject = async () => {
      try {
        const response = await fetch("/api/heating-projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: "Projet PAC" }),
        })

        if (response.ok) {
          const project = await response.json()
          router.push(`/projects/new/${project.id}/logement`)
        } else {
          console.error("Failed to create project")
          router.push("/projects")
        }
      } catch (error) {
        console.error("Error creating project:", error)
        router.push("/projects")
      }
    }

    createProject()
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
