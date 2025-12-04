import { ReactNode } from "react"

interface StepLayoutProps {
  children: ReactNode
}

/**
 * Layout pour toutes les étapes du wizard
 * Gère la structure commune (container, spacing)
 */
export default function StepLayout({ children }: StepLayoutProps) {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {children}
    </div>
  )
}
