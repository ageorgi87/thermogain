"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const BackToProjectsButton = () => {
  const pathname = usePathname()

  // Afficher le bouton uniquement si on est sur une page de projet
  // Les URLs de projets suivent le pattern: /{projectId}/... où projectId est un UUID
  // On vérifie qu'on n'est pas sur /dashboard ou d'autres pages racine
  const isOnProjectPage =
    pathname &&
    pathname !== "/" &&
    pathname !== "/dashboard" &&
    !pathname.startsWith("/profil") &&
    // Vérifie que le premier segment ressemble à un UUID (format: 8-4-4-4-12 caractères)
    /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(pathname)

  if (!isOnProjectPage) {
    return null
  }

  return (
    <Link href="/dashboard">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux projets
      </Button>
    </Link>
  )
}
