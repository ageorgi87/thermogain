import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ThermoGain : Simulateur de rentabilité pour pompes à chaleur",
  description: "Analysez la rentabilité des pompes à chaleur pour vos clients avec des calculs personnalisés et des visualisations claires. Rassurez vos clients avec des chiffres précis.",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
