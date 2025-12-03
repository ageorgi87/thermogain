import {
  Button,
  Heading,
  Hr,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout } from './emailLayout'

interface VerificationEmailProps {
  verificationUrl: string
  firstName?: string
}

/**
 * Email de vérification d'adresse email
 *
 * Bonnes pratiques appliquées :
 * - Sujet court et clair (< 50 caractères)
 * - CTA proéminent avec bouton de 44px+ (mobile-friendly)
 * - Lien alternatif pour accessibilité
 * - Message de sécurité (ignorer si pas concerné)
 * - Urgence modérée (expiration 24h)
 * - Ton professionnel et rassurant
 * - Ratio texte/image 60:40 respecté
 */
export const VerificationEmail = ({
  verificationUrl,
  firstName,
}: VerificationEmailProps) => {
  const displayName = firstName || 'là'

  return (
    <EmailLayout previewText="Confirmez votre email pour activer votre compte ThermoGain">
      <Preview>Confirmez votre email pour activer votre compte ThermoGain</Preview>

      {/* Titre principal */}
      <Heading style={h1}>
        Confirmez votre adresse email
      </Heading>

      {/* Salutation personnalisée */}
      <Text style={text}>
        Bonjour {displayName},
      </Text>

      {/* Message principal - court et direct */}
      <Text style={text}>
        Bienvenue sur ThermoGain ! Pour commencer à créer vos études de rentabilité
        pompes à chaleur, veuillez confirmer votre adresse email.
      </Text>

      {/* CTA principal - bouton proéminent */}
      <Section style={buttonContainer}>
        <Button style={button} href={verificationUrl}>
          Confirmer mon adresse email
        </Button>
      </Section>

      {/* Délimitation visuelle */}
      <Hr style={divider} />

      {/* Instructions alternatives - accessibilité */}
      <Text style={textSmall}>
        Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
      </Text>

      <Text style={linkContainer}>
        <Link href={verificationUrl} style={linkStyle}>
          {verificationUrl}
        </Link>
      </Text>

      {/* Délimitation visuelle */}
      <Hr style={divider} />

      {/* Informations importantes */}
      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>⏱ Ce lien expire dans 24 heures</strong>
        </Text>
        <Text style={infoText}>
          Vous pouvez demander un nouveau lien si celui-ci expire.
        </Text>
      </Section>

      {/* Message de sécurité */}
      <Text style={securityText}>
        🔒 Vous n'avez pas créé de compte ? Ignorez cet email en toute sécurité.
        Aucune action n'est nécessaire de votre part.
      </Text>

      {/* Signature */}
      <Text style={signature}>
        L'équipe ThermoGain
      </Text>
    </EmailLayout>
  )
}

export default VerificationEmail

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
