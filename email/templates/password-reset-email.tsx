import {
  Button,
  Heading,
  Hr,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout } from './email-layout'

interface PasswordResetEmailProps {
  resetUrl: string
  firstName?: string
}

/**
 * Email de réinitialisation de mot de passe
 *
 * Bonnes pratiques appliquées :
 * - Sujet clair et direct
 * - CTA proéminent (bouton 44px+ mobile-friendly)
 * - Lien alternatif pour accessibilité
 * - Message de sécurité si non concerné
 * - Urgence claire (expiration 1h)
 * - Ton professionnel et rassurant
 */
export const PasswordResetEmail = ({
  resetUrl,
  firstName,
}: PasswordResetEmailProps) => {
  const displayName = firstName || 'là'

  return (
    <EmailLayout previewText="Réinitialisez votre mot de passe ThermoGain">
      <Preview>Réinitialisez votre mot de passe ThermoGain</Preview>

      {/* Titre principal */}
      <Heading style={h1}>
        Réinitialisation de mot de passe
      </Heading>

      {/* Salutation personnalisée */}
      <Text style={text}>
        Bonjour {displayName},
      </Text>

      {/* Message principal - court et direct */}
      <Text style={text}>
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte ThermoGain.
        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
      </Text>

      {/* CTA principal - bouton proéminent */}
      <Section style={buttonContainer}>
        <Button style={button} href={resetUrl}>
          Réinitialiser mon mot de passe
        </Button>
      </Section>

      {/* Délimitation visuelle */}
      <Hr style={divider} />

      {/* Instructions alternatives - accessibilité */}
      <Text style={textSmall}>
        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
      </Text>

      <Text style={linkContainer}>
        <Link href={resetUrl} style={linkStyle}>
          {resetUrl}
        </Link>
      </Text>

      {/* Délimitation visuelle */}
      <Hr style={divider} />

      {/* Informations importantes - urgence */}
      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>⏱ Ce lien expire dans 1 heure</strong>
        </Text>
        <Text style={infoText}>
          Pour votre sécurité, ce lien ne peut être utilisé qu'une seule fois.
          Si vous avez besoin d'un nouveau lien, vous pouvez en demander un autre.
        </Text>
      </Section>

      {/* Message de sécurité - si non concerné */}
      <Text style={securityText}>
        🔒 Vous n'avez pas demandé de réinitialisation ? Ignorez cet email en toute sécurité.
        Votre mot de passe actuel reste inchangé. Si vous recevez des demandes répétées non sollicitées,
        contactez-nous immédiatement.
      </Text>

      {/* Signature */}
      <Text style={signature}>
        L'équipe ThermoGain
      </Text>
    </EmailLayout>
  )
}

export default PasswordResetEmail

// ============================================================================
// STYLES - Inline pour compatibilité maximale clients email
// ============================================================================

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700' as const,
  lineHeight: '36px',
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
  padding: '0',
}

const textSmall = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0 8px',
  padding: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
  padding: '0',
}

const button = {
  backgroundColor: '#ea580c',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
  lineHeight: '24px',
  minHeight: '44px', // Mobile-friendly tappable area
  boxSizing: 'border-box' as const,
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const linkContainer = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '12px 16px',
  margin: '0 0 16px',
  wordBreak: 'break-all' as const,
}

const linkStyle = {
  color: '#ea580c',
  fontSize: '14px',
  lineHeight: '20px',
  textDecoration: 'underline',
}

const infoBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
}

const infoText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
  padding: '0',
}

const securityText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0 0',
  padding: '16px',
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
}

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
  padding: '0',
  fontWeight: '500' as const,
}
