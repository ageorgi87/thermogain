import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailLayoutProps {
  children: React.ReactNode
  previewText: string
}

/**
 * Layout réutilisable pour tous les emails ThermoGain
 * Respecte les bonnes pratiques 2025 :
 * - Structure table-based pour compatibilité maximale
 * - Largeur 600px (standard optimal)
 * - Mobile-first avec design responsive
 * - Alt text pour accessibilité
 * - Footer avec informations légales
 */
export const EmailLayout = ({ children, previewText }: EmailLayoutProps) => {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Body style={main}>
        <Container style={container}>
          {/* Header avec logo */}
          <Section style={header}>
            <Link href="https://thermogain.fr" style={logoLink}>
              <Img
                src="https://thermogain.fr/logo.png"
                width="48"
                height="48"
                alt="ThermoGain Logo"
                style={logo}
              />
              <Img
                src="https://thermogain.fr/nomLogo.png"
                width="200"
                alt="ThermoGain"
                style={logoText}
              />
            </Link>
          </Section>

          {/* Contenu principal */}
          <Section style={contentSection}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} ThermoGain. Tous droits réservés.
            </Text>
            <Text style={footerText}>
              Études thermiques intelligentes pour professionnels
            </Text>
            <Text style={footerLinks}>
              <a href="https://thermogain.fr/legal/mentions-legales" style={link}>
                Mentions légales
              </a>
              {' · '}
              <a href="https://thermogain.fr/legal/politique-confidentialite" style={link}>
                Confidentialité
              </a>
              {' · '}
              <a href="https://thermogain.fr" style={link}>
                Nous contacter
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default EmailLayout

// ============================================================================
// STYLES - Inline CSS pour compatibilité maximale
// ============================================================================

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  WebkitFontSmoothing: 'antialiased' as const,
  MozOsxFontSmoothing: 'grayscale' as const,
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  width: '100%',
  border: '1px solid #e5e7eb',
}

const header = {
  backgroundColor: 'transparent',
  padding: '32px 32px 24px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e5e7eb',
}

const logoLink = {
  display: 'block',
  textDecoration: 'none',
}

const logo = {
  margin: '0 auto',
  display: 'block',
}

const logoText = {
  margin: '12px auto 0',
  display: 'block',
}

const contentSection = {
  padding: '32px',
}

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px 32px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '4px 0',
  padding: '0',
}

const footerLinks = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '12px 0 0',
  padding: '0',
}

const link = {
  color: '#ea580c',
  textDecoration: 'none',
}
