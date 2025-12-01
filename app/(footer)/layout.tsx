import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ConditionalFooter } from "@/components/ConditionalFooter"

export default function FooterPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <div className="container mx-auto py-8 max-w-4xl px-4">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </div>
        <ConditionalFooter />
      </div>
    </>
  )
}
