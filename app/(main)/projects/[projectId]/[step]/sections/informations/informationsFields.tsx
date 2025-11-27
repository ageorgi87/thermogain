"use client"

import { useState } from "react"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { InformationsData } from "./informationsSchema"

interface InformationsFieldsProps {
  form: UseFormReturn<InformationsData>
}

export function InformationsFields({ form }: InformationsFieldsProps) {
  const [emailInput, setEmailInput] = useState("")
  const [emailError, setEmailError] = useState("")

  const currentEmails = form.watch("recipient_emails") || []

  const addEmail = () => {
    setEmailError("")

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailInput)) {
      setEmailError("Email invalide")
      return
    }

    // Check for duplicates
    if (currentEmails.includes(emailInput)) {
      setEmailError("Cet email est déjà dans la liste")
      return
    }

    // Add email to the list
    form.setValue("recipient_emails", [...currentEmails, emailInput])
    setEmailInput("")
  }

  const removeEmail = (emailToRemove: string) => {
    form.setValue(
      "recipient_emails",
      currentEmails.filter((email) => email !== emailToRemove)
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addEmail()
    }
  }

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="project_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom du projet</FormLabel>
            <FormControl>
              <Input
                placeholder="ex: Installation PAC - Maison Dupont"
                maxLength={100}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Donnez un nom explicite à votre projet pour le retrouver facilement
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="recipient_emails"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email(s) pour recevoir les résultats</FormLabel>
            <FormDescription>
              Saisissez les adresses email qui recevront le rapport de simulation
            </FormDescription>

            <div className="space-y-3">
              {/* Email input */}
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    type="email"
                    placeholder="exemple@email.com"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value)
                      setEmailError("")
                    }}
                    onKeyDown={handleKeyDown}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEmail}
                  disabled={!emailInput}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Email error */}
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}

              {/* Email list */}
              {currentEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                  {currentEmails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="pl-3 pr-2 py-1.5 text-sm"
                    >
                      {email}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 hover:bg-destructive/20"
                        onClick={() => removeEmail(email)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
