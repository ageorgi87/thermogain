"use server"

import { render } from '@react-email/components'
import { Resend } from 'resend'
import { ContactNotificationEmail } from '@/email/templates/ContactNotificationEmail'
import { ContactConfirmationEmail } from '@/email/templates/ContactConfirmationEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

interface ContactFormResult {
  success: boolean
  error?: string
}

/**
 * Server action to handle contact form submissions
 * Sends two emails:
 * 1. Notification to admin (contact@thermogain.fr)
 * 2. Confirmation to the user
 */
export async function submitContactForm(
  data: ContactFormData
): Promise<ContactFormResult> {
  try {
    // Validate input
    if (!data.name || !data.email || !data.subject || !data.message) {
      return {
        success: false,
        error: "Tous les champs sont obligatoires",
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        error: "Adresse email invalide",
      }
    }

    // Format submission date
    const submittedAt = new Date().toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    })

    // Render email templates
    const notificationHtml = await render(
      ContactNotificationEmail({
        senderName: data.name,
        senderEmail: data.email,
        subject: data.subject,
        message: data.message,
        submittedAt,
      })
    )

    const confirmationHtml = await render(
      ContactConfirmationEmail({
        recipientName: data.name,
        subject: data.subject,
        message: data.message,
      })
    )

    // Send notification email to admin
    const notificationResult = await resend.emails.send({
      from: 'ThermoGain <contact@thermogain.fr>',
      to: 'contact@thermogain.fr',
      replyTo: data.email, // Allow direct reply to the sender
      subject: `[Contact] ${data.subject}`,
      html: notificationHtml,
    })

    if (!notificationResult.data?.id) {
      console.error('Failed to send notification email:', notificationResult.error)
      return {
        success: false,
        error: "Erreur lors de l'envoi du message. Veuillez réessayer.",
      }
    }

    // Send confirmation email to user
    const confirmationResult = await resend.emails.send({
      from: 'ThermoGain <contact@thermogain.fr>',
      to: data.email,
      subject: 'Confirmation de réception de votre message',
      html: confirmationHtml,
    })

    if (!confirmationResult.data?.id) {
      console.error('Failed to send confirmation email:', confirmationResult.error)
      // Don't fail the entire operation if confirmation email fails
      // The important part (notification to admin) succeeded
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return {
      success: false,
      error: "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
    }
  }
}
