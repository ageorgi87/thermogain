"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Pencil, Loader2, CheckCircle2 } from "lucide-react"

type Project = {
  id: string
  name: string
  description: string | null
  clientName: string | null
  clientCompany: string | null
  textField: string | null
  numberField: number | null
  radioChoice: string | null
  checkboxes: string[]
  createdAt: string
  updatedAt: string
}

export default function ProjectPage() {
  const router = useRouter()
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Button onClick={() => router.push("/projects")} className="mt-4">
          Back to Projects
        </Button>
      </div>
    )
  }

  const getRadioLabel = (value: string) => {
    const labels: Record<string, string> = {
      option1: "Option 1 - Standard",
      option2: "Option 2 - Premium",
      option3: "Option 3 - Enterprise",
    }
    return labels[value] || value
  }

  const getCheckboxLabel = (value: string) => {
    const labels: Record<string, string> = {
      feature1: "Advanced Analytics",
      feature2: "API Access",
      feature3: "Custom Reports",
      feature4: "Priority Support",
    }
    return labels[value] || value
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Button onClick={() => router.push(`/projects/${project.id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{project.name}</CardTitle>
              {project.description && (
                <CardDescription className="mt-2 text-base">
                  {project.description}
                </CardDescription>
              )}
            </div>
            <Badge variant="secondary" className="ml-4">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Information */}
          {(project.clientName || project.clientCompany) && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  {project.clientName && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Client Name</p>
                      <p className="font-medium">{project.clientName}</p>
                    </div>
                  )}
                  {project.clientCompany && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Company</p>
                      <p className="font-medium">{project.clientCompany}</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Technical Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
            <div className="space-y-4">
              {project.textField && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Text Field</p>
                  <p className="font-medium">{project.textField}</p>
                </div>
              )}

              {project.numberField !== null && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Number Field</p>
                  <p className="font-medium">{project.numberField}</p>
                </div>
              )}

              {project.radioChoice && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Selected Option</p>
                  <Badge variant="outline">{getRadioLabel(project.radioChoice)}</Badge>
                </div>
              )}

              {project.checkboxes && project.checkboxes.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Selected Features</p>
                  <div className="flex flex-wrap gap-2">
                    {project.checkboxes.map((checkbox) => (
                      <Badge key={checkbox} variant="secondary">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {getCheckboxLabel(checkbox)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Created</p>
              <p className="font-medium">
                {new Date(project.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Last Updated</p>
              <p className="font-medium">
                {new Date(project.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
