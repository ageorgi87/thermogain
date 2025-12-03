"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Mail, AlertCircle, Loader2 } from "lucide-react"
import { submitContactForm } from "@/lib/actions/submitContactForm"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est obligatoire"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Adresse email invalide"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "L'objet est obligatoire"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Le message est obligatoire"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Le message doit contenir au moins 10 caractères"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus({ type: null, message: "" })

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitContactForm(formData)

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message:
            "Merci pour votre message ! Nous avons bien reçu votre demande et nous vous répondrons dans les plus brefs délais (généralement sous 24 à 48 heures ouvrées). Un email de confirmation vous a été envoyé.",
        })
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        })
        setErrors({})
      } else {
        setSubmitStatus({
          type: "error",
          message:
            result.error ||
            "Une erreur s'est produite lors de l'envoi de votre message. Veuillez réessayer.",
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-orange-100 mb-6">
            <Mail className="w-8 h-8 text-brand-orange-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Une question, une demande de devis ou besoin d'assistance ? Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
          </p>
        </div>

        {/* Success/Error Alert */}
        {submitStatus.type && (
          <Alert
            className={`mb-8 ${
              submitStatus.type === "success"
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            {submitStatus.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <AlertDescription
              className={
                submitStatus.type === "success"
                  ? "text-green-900"
                  : "text-red-900"
              }
            >
              {submitStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Nom complet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Jean Dupont"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`h-12 ${errors.name ? "border-red-500" : ""}`}
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Adresse email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@exemple.fr"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`h-12 ${errors.email ? "border-red-500" : ""}`}
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-base font-semibold">
                Objet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="Demande d'information sur les pompes à chaleur"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className={`h-12 ${errors.subject ? "border-red-500" : ""}`}
                disabled={isSubmitting}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? "subject-error" : undefined}
              />
              {errors.subject && (
                <p id="subject-error" className="text-sm text-red-600">
                  {errors.subject}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-base font-semibold">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Décrivez votre demande en détail..."
                value={formData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("message", e.target.value)}
                className={`min-h-[180px] resize-y ${
                  errors.message ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && (
                <p id="message-error" className="text-sm text-red-600">
                  {errors.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Minimum 10 caractères
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Envoyer le message
                </>
              )}
            </Button>

            {/* Required Fields Note */}
            <p className="text-sm text-muted-foreground text-center">
              <span className="text-red-500">*</span> Champs obligatoires
            </p>
          </form>
        </div>
    </div>
  )
}
