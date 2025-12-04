"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

interface FooterProps {
  /**
   * Si true, affiche toujours le footer sans vérification de route
   * Utile pour les layouts où le footer doit toujours être visible (ex: auth)
   */
  alwaysShow?: boolean
}

export const Footer = ({ alwaysShow = false }: FooterProps) => {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()

  // Si alwaysShow est false, vérifier si on doit masquer le footer
  if (!alwaysShow) {
    // Hide footer on form pages and results page
    // Form pages: /projects/[id]/logement, /projects/[id]/chauffage-actuel, etc.
    // Results page: /projects/[id]/results
    const isFormPage = /\/projects\/[^/]+\/(logement|chauffage-actuel|projet-pac|couts|aides|evolutions|financement)/.test(pathname)
    const isResultsPage = pathname.includes("/results")

    if (isFormPage || isResultsPage) {
      return null
    }
  }

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} ThermoGain. Tous droits réservés.
          </p>

          {/* Legal Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link
              href="/legal/mentions-legales"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Mentions légales
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link
              href="/legal/cgv"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              CGU
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link
              href="/legal/politique-confidentialite"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Confidentialité
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link
              href="/legal/cookies"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <Link
              href="/legal/methodologie"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Méthodologie
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
