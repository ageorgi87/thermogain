import type { Metadata } from "next"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
  title: "ThermoGain - Études de Rentabilité Pompe à Chaleur",
  description: "Analysez la rentabilité des pompes à chaleur pour vos clients avec des calculs personnalisés et des visualisations claires. Rassurez vos clients avec des chiffres précis.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <Footer alwaysShow />
    </div>
  )
}
