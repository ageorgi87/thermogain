"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function BackToProjectsButton() {
  const pathname = usePathname()

  // Afficher le bouton uniquement si on est sur une page de projet
  // (commence par /projects/ et a au moins un autre segment après)
  const isOnProjectPage = pathname?.startsWith("/projects/") && pathname !== "/projects/"

  if (!isOnProjectPage) {
    return null
  }

  return (
    <Link href="/projects">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux projets
      </Button>
    </Link>
  )
}
