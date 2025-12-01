"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  // Note: Energy models are now loaded on-demand from DB cache (server-side)
  // No need for client-side preloading since Prisma only works server-side
  // Models will be loaded automatically when needed, with 3-tier caching:
  // 1. Memory cache (in-process)
  // 2. Database cache (persists across restarts, 30 days TTL)
  // 3. DIDO API (fallback when cache expired)

  return <SessionProvider>{children}</SessionProvider>
}
