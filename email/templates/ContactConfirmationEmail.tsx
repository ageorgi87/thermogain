import {
  Heading,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import { EmailLayout } from './EmailLayout'

interface ContactConfirmationEmailProps {
  recipientName: string
  subject: string
  message: string
}

/**
 * Confirmation email sent to users after they submit the contact form
 * Best practices:
 * - Personalized greeting
 * - Confirmation that message was received
 * - Copy of their submission for reference
 * - Clear expectations about response time
 * - Warm, professional tone
 */
export function ContactConfirmationEmail({
  recipientName,
  subject,
  message,
}: ContactConfirmationEmailProps) {
  const previewText = `Nous avons bien reçu votre message`

  return (
    <EmailLayout previewText={previewText}>
      <Preview>{previewText}</Preview>

      {/* Greeting */}
      <Text style={greeting}>
        Bonjour {recipientName},
      </Text>

      {/* Confirmation Message */}
      <Heading style={heading}>
        Merci de nous avoir contactés
      </Heading>

      <Text style={paragraph}>
        Nous avons bien reçu votre message et nous vous en remercions. Notre équipe prendra connaissance de votre demande et vous répondra dans les plus brefs délais, généralement sous 24 à 48 heures ouvrées.
      </Text>

      {/* Message Summary Box */}
      <Section style={summaryBox}>
        <Text style={summaryLabel}>Récapitulatif de votre message</Text>

        <div style={summaryRow}>
          <Text style={summaryFieldLabel}>Objet</Text>
          <Text style={summaryFieldValue}>{subject}</Text>
        </div>

        <Hr style={summaryDivider} />

        <div style={summaryRow}>
          <Text style={summaryFieldLabel}>Message</Text>
          <Text style={summaryMessage}>{message}</Text>
        </div>
      </Section>

      {/* Additional Information */}
      <Text style={paragraph}>
        Si votre demande est urgente ou si vous n'avez pas de réponse dans les délais indiqués, n'hésitez pas à nous relancer via ce même formulaire de contact.
      </Text>

      <Hr style={divider} />

      {/* Closing */}
      <Text style={closingText}>
        Cordialement,<br />
        L'équipe ThermoGain
      </Text>

      {/* Footer Note */}
      <Text style={footerNote}>
        Cet email est une confirmation automatique de la réception de votre message. Merci de ne pas y répondre directement.
      </Text>
    </EmailLayout>
  )
}

// Styles
const greeting = {
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0 0 24px',
  color: '#111827',
  fontWeight: '500',
}

const heading = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 16px',
  lineHeight: '1.3',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
  color: '#374151',
}

const summaryBox = {
  backgroundColor: '#fff7ed',
  border: '2px solid #fed7aa',
  borderRadius: '10px',
  padding: '24px',
  margin: '24px 0',
}

const summaryLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#9a3412',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 16px',
}

const summaryRow = {
  margin: '0',
}

const summaryFieldLabel = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 6px',
}

const summaryFieldValue = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
  lineHeight: '1.5',
}

const summaryMessage = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}

const summaryDivider = {
  borderColor: '#fed7aa',
  margin: '16px 0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0 24px',
}

const closingText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 32px',
}

const footerNote = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#9ca3af',
  margin: '0',
  fontStyle: 'italic' as const,
}
