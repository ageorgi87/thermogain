"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, Loader2 } from "lucide-react"
import { sendStudyResults } from "@/lib/actions/send-study-results"

interface SendResultsButtonProps {
  projectId: string
  userId: string
  userEmail: string
  onStatusChange?: (status: { emailSent: boolean; error: string | null }) => void
}

export function SendResultsButton({ projectId, userId, onStatusChange }: SendResultsButtonProps) {
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSendEmail = async () => {
    setIsSending(true)
    onStatusChange?.({ emailSent: false, error: null })

    try {
      const result = await sendStudyResults({
        projectId,
        userId,
      })

      if (result.success) {
        setEmailSent(true)
        onStatusChange?.({ emailSent: true, error: null })
        // Reset success message after 5 seconds
        setTimeout(() => {
          setEmailSent(false)
          onStatusChange?.({ emailSent: false, error: null })
        }, 5000)
      } else {
        const errorMsg = result.error || 'Erreur lors de l\'envoi de l\'email'
        onStatusChange?.({ emailSent: false, error: errorMsg })
      }
    } catch (err) {
      console.error('Error sending email:', err)
      const errorMsg = 'Erreur inattendue lors de l\'envoi de l\'email'
      onStatusChange?.({ emailSent: false, error: errorMsg })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Button
      onClick={handleSendEmail}
      disabled={isSending || emailSent}
      variant={emailSent ? "outline" : "default"}
      className="h-10"
    >
      {isSending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Envoi...
        </>
      ) : emailSent ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
          Envoyé
        </>
      ) : (
        <>
          <Mail className="mr-2 h-4 w-4" />
          Recevoir par email
        </>
      )}
    </Button>
  )
}
