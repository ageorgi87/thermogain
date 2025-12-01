import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Configuration
export const EMAIL_FROM = 'ThermoGain <noreply@thermogain.fr>'
export const EMAIL_VERIFICATION_EXPIRES_IN = 24 * 60 * 60 * 1000 // 24 hours
