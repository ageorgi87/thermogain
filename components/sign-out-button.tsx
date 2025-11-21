"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-red-600 hover:text-red-700 dark:text-red-400"
    >
      Sign Out
    </Button>
  )
}
