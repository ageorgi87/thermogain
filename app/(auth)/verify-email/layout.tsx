import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vérification email - ThermoGain",
  robots: {
    index: false,
    follow: false,
  },
}

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
