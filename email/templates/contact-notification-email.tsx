import {
  Heading,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components'
import { EmailLayout } from './email-layout'

interface ContactNotificationEmailProps {
  senderName: string
  senderEmail: string
  subject: string
  message: string
  submittedAt: string
}

/**
 * Email template for notifying the admin when someone submits the contact form
 * Best practices:
 * - Clear subject identification
 * - All form data prominently displayed
 * - Easy-to-read formatting
 * - Reply-to information clearly visible
 */
export function ContactNotificationEmail({
  senderName,
  senderEmail,
  subject,
  message,
  submittedAt,
}: ContactNotificationEmailProps) {
  const previewText = `Nouveau message de ${senderName} : ${subject}`

  return (
    <EmailLayout previewText={previewText}>
      <Preview>{previewText}</Preview>

      {/* Title */}
      <Heading style={heading}>
        Nouveau message de contact
      </Heading>

      <Text style={paragraph}>
        Vous avez reçu un nouveau message via le formulaire de contact de ThermoGain.
      </Text>

      {/* Sender Information Box */}
      <Section style={infoBox}>
        <Text style={infoLabel}>De</Text>
        <Text style={infoValue}>
          {senderName}
        </Text>
        <Text style={infoEmail}>
          <Link href={`mailto:${senderEmail}`} style={emailLink}>
            {senderEmail}
          </Link>
        </Text>
      </Section>

      {/* Subject Box */}
      <Section style={infoBox}>
        <Text style={infoLabel}>Objet</Text>
        <Text style={infoValue}>
          {subject}
        </Text>
      </Section>

      {/* Message Box */}
      <Section style={messageBox}>
        <Text style={infoLabel}>Message</Text>
        <Text style={messageContent}>
          {message}
        </Text>
      </Section>

      {/* Metadata */}
      <Hr style={divider} />
      <Text style={metadataText}>
        Message reçu le {submittedAt}
      </Text>
    </EmailLayout>
  )
}

// Styles
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
  margin: '0 0 24px',
  color: '#374151',
}

const infoBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 16px',
}

const infoLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const infoValue = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
  lineHeight: '1.5',
}

const infoEmail = {
  fontSize: '15px',
  color: '#374151',
  margin: '4px 0 0',
  lineHeight: '1.5',
}

const emailLink = {
  color: '#ea580c',
  textDecoration: 'none',
}

const messageBox = {
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 0 24px',
}

const messageContent = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#111827',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0 16px',
}

const metadataText = {
  fontSize: '13px',
  color: '#9ca3af',
  margin: '0',
  fontStyle: 'italic' as const,
}
