"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function ProjectPage() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Redirect to results page
    if (params.id) {
      router.replace(`/projects/${params.id}/results`)
    }
  }, [params.id, router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
