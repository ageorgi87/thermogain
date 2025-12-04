"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export const SignOutButton = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      // Clear session by calling the API
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Redirect to login page
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Sign out error:", error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-red-600 hover:text-red-700 dark:text-red-400"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Se déconnecter
    </Button>
  )
}
