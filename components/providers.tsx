"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"
import { preloadAllModels } from "@/lib/energyModelCache"

export function Providers({ children }: { children: React.ReactNode }) {
  // Preload energy evolution models on app startup
  useEffect(() => {
    preloadAllModels().catch(err =>
      console.error("Failed to preload energy models:", err)
    )
  }, [])

  return <SessionProvider>{children}</SessionProvider>
}
