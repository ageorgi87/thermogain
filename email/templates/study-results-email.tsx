import {
  Heading,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components'
import { EmailLayout } from './email-layout'

interface StudyResultsEmailProps {
  // Client info
  recipientFirstName?: string

  // Professional info
  professionalName?: string
  professionalCompany?: string
  professionalAddress?: string
  professionalPhone?: string
  professionalCity?: string
  professionalPostalCode?: string
  professionalWebsite?: string

  // Project info
  projectName: string
  currentHeatingType: string
  pacType: string

  // Financial results
  investmentTotal: number
  aidesTotal: number
  investmentNet: number

  annualSavings: number
  roi: number
  benefitNet17Years: number

  // Link to full results
  resultsUrl: string
}

export function StudyResultsEmail({
  recipientFirstName,
  professionalName,
  professionalCompany,
  professionalAddress,
  professionalPhone,
  professionalCity,
  professionalPostalCode,
  professionalWebsite,
  projectName,
  currentHeatingType,
  pacType,
  investmentTotal,
  aidesTotal,
  investmentNet,
  annualSavings,
  roi,
  benefitNet17Years,
  resultsUrl,
}: StudyResultsEmailProps) {
  const previewText = `Votre étude PAC : ${Math.round(annualSavings).toLocaleString('fr-FR')}€ d'économies/an`

  // Determine who performed the study
  const hasProfessional = professionalName || professionalCompany
  const professionalDisplay = professionalCompany || professionalName || 'votre conseiller'

  // Build full address if available
  const hasAddress = professionalAddress || professionalCity || professionalPostalCode
  const fullAddress = [
    professionalAddress,
    professionalPostalCode && professionalCity ? `${professionalPostalCode} ${professionalCity}` : professionalPostalCode || professionalCity
  ].filter(Boolean).join(', ')

  return (
    <EmailLayout previewText={previewText}>
      <Preview>{previewText}</Preview>

      {/* Greeting */}
      <Text style={greeting}>
        {recipientFirstName ? `Bonjour ${recipientFirstName},` : 'Bonjour,'}
      </Text>

      <Text style={paragraph}>
        Nous avons le plaisir de vous transmettre l'analyse de rentabilité pour l'installation d'une pompe à chaleur <strong>{pacType}</strong> en remplacement de votre système de chauffage actuel <strong>{currentHeatingType}</strong>. Cette étude a été réalisée sur la base des informations spécifiques que vous avez fournies concernant votre logement et vos besoins énergétiques.
      </Text>

      {/* Professional Attribution */}
      {hasProfessional && (
        <Section style={professionalBox}>
          <Text style={professionalLabel}>
            Étude réalisée avec
          </Text>
          <Text style={professionalNameStyle}>
            {professionalDisplay}
          </Text>
          {professionalCompany && professionalName && (
            <Text style={professionalRoleStyle}>
              {professionalName}
            </Text>
          )}
          {hasAddress && (
            <Text style={professionalContactStyle}>
              📍 {fullAddress}
            </Text>
          )}
          {professionalPhone && (
            <Text style={professionalContactStyle}>
              📞 {professionalPhone}
            </Text>
          )}
          {professionalWebsite && (
            <Text style={professionalContactStyle}>
              🌐 <Link href={professionalWebsite} style={professionalLinkStyle}>{professionalWebsite}</Link>
            </Text>
          )}
        </Section>
      )}

      {/* Key Results - Hero Metrics */}
      <Section style={heroMetrics}>
        <Text style={heroLabel}>Économies annuelles</Text>
        <Text style={heroValue}>+{Math.round(annualSavings).toLocaleString('fr-FR')} €</Text>
        <Text style={heroSubtext}>par an</Text>
      </Section>

      {/* Investment Summary Card */}
      <Section style={summaryCard}>
        <Text style={cardTitle}>💰 Investissement</Text>

        <table style={tableStyle} cellPadding="0" cellSpacing="0">
          <tr>
            <td style={tableCellLabel}>Coût du projet</td>
            <td style={tableCellValue}>{investmentTotal.toLocaleString('fr-FR')} €</td>
          </tr>
          <tr>
            <td style={tableCellLabel}>Aides financières</td>
            <td style={tableCellValueGreen}>-{aidesTotal.toLocaleString('fr-FR')} €</td>
          </tr>
          <tr style={tableRowDivider}>
            <td colSpan={2}><Hr style={tableDivider} /></td>
          </tr>
          <tr>
            <td style={tableCellLabelBold}>Reste à financer</td>
            <td style={tableCellValueBold}>{investmentNet.toLocaleString('fr-FR')} €</td>
          </tr>
        </table>
      </Section>

      {/* ROI Summary Card */}
      <Section style={summaryCard}>
        <Text style={cardTitle}>📈 Rentabilité</Text>

        <table style={tableStyle} cellPadding="0" cellSpacing="0">
          <tr>
            <td style={tableCellLabel}>Retour sur investissement</td>
            <td style={tableCellValue}>{roi.toFixed(1)} ans</td>
          </tr>
          <tr>
            <td style={tableCellLabel}>Bénéfice net sur 17 ans</td>
            <td style={tableCellValueSuccess}>+{Math.round(benefitNet17Years).toLocaleString('fr-FR')} €</td>
          </tr>
        </table>
      </Section>

      {/* Legal Disclaimers */}
      <Hr style={divider} />

      <Text style={disclaimerText}>
        Nature de l'étude : Cette analyse est une simulation indicative et approximative basée sur les informations que vous avez fournies et les données moyennes du marché. Les montants, économies et délais affichés sont des projections estimatives à titre informatif uniquement et n'ont aucune valeur contractuelle.
      </Text>

      <Text style={disclaimerText}>
        Non-engagement : Ni ThermoGain, ni {professionalDisplay}, ni aucune partie impliquée dans la réalisation de cette étude ne s'engagent sur l'exactitude, la fiabilité ou la garantie des résultats affichés. Les chiffres présentés ne constituent en aucun cas une promesse de résultat. Les économies réelles dépendront de nombreux facteurs variables : évolution imprévisible des prix de l'énergie, conditions climatiques, usage effectif du logement, comportement des occupants, performance réelle de l'installation, qualité de la mise en œuvre, etc.
      </Text>

      <Text style={disclaimerText}>
        Aides financières : Les montants d'aides indiqués sont donnés à titre purement informatif et indicatif. Leur obtention effective est soumise à de nombreuses conditions (niveau de ressources, éligibilité du logement et des équipements, conformité des travaux, respect des procédures administratives). Ces aides peuvent évoluer ou être supprimées à tout moment. Consultez impérativement les organismes officiels (ANAH, fournisseurs d'énergie) pour connaître vos droits réels et les démarches à effectuer.
      </Text>

      <Text style={disclaimerText}>
        Responsabilité : L'utilisation de cette étude se fait sous votre seule et entière responsabilité. Aucune réclamation ne pourra être formulée en cas d'écart entre les estimations présentées et les résultats effectivement constatés.
      </Text>
    </EmailLayout>
  )
}

// Styles
const greeting = {
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0 0 16px',
  color: '#111827',
  fontWeight: '500',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  color: '#374151',
}

// Hero metrics - Big number at the top
const heroMetrics = {
  backgroundColor: '#ea580c',
  borderRadius: '12px',
  padding: '32px 24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const heroLabel = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#fed7aa',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const heroValue = {
  fontSize: '42px',
  fontWeight: '700',
  color: '#ffffff',
  lineHeight: '1.2',
  margin: '0',
}

const heroSubtext = {
  fontSize: '16px',
  color: '#fed7aa',
  margin: '8px 0 0',
}

// Summary cards
const summaryCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const cardTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 16px',
}

// Table layout for clean data presentation
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const tableCellLabel = {
  fontSize: '15px',
  color: '#6b7280',
  padding: '10px 0',
  textAlign: 'left' as const,
}

const tableCellLabelBold = {
  fontSize: '15px',
  color: '#111827',
  fontWeight: '600',
  padding: '10px 0',
  textAlign: 'left' as const,
}

const tableCellValue = {
  fontSize: '16px',
  color: '#111827',
  fontWeight: '500',
  padding: '10px 0',
  textAlign: 'right' as const,
}

const tableCellValueBold = {
  fontSize: '18px',
  color: '#111827',
  fontWeight: '700',
  padding: '10px 0',
  textAlign: 'right' as const,
}

const tableCellValueGreen = {
  fontSize: '16px',
  color: '#059669',
  fontWeight: '500',
  padding: '10px 0',
  textAlign: 'right' as const,
}

const tableCellValueSuccess = {
  fontSize: '18px',
  color: '#059669',
  fontWeight: '700',
  padding: '10px 0',
  textAlign: 'right' as const,
}

const tableRowDivider = {
  height: '1px',
}

const tableDivider = {
  borderColor: '#e5e7eb',
  margin: '8px 0',
}

// Professional attribution box
const professionalBox = {
  backgroundColor: '#fff7ed',
  border: '2px solid #fed7aa',
  borderRadius: '10px',
  padding: '20px 24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const professionalLabel = {
  fontSize: '13px',
  color: '#9a3412',
  margin: '0 0 8px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const professionalNameStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#ea580c',
  margin: '0 0 4px',
}

const professionalRoleStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#c2410c',
  margin: '0 0 12px',
}

const professionalContactStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#92400e',
  margin: '6px 0 0',
  lineHeight: '20px',
}

const professionalLinkStyle: React.CSSProperties = {
  color: '#ea580c',
  textDecoration: 'none',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const disclaimerText = {
  fontSize: '11px',
  lineHeight: '16px',
  color: '#6b7280',
  margin: '0 0 4px',
}
