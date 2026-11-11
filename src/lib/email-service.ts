import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { escapeHtml, renderBookingEmail, type BookingDetails, type EmailKind, type EmailLanguage } from './booking-email-template'
import { createRescheduleToken } from './reschedule-token'

export type { EmailLanguage } from './booking-email-template'

// Initialiser Resend (lazy loading pour éviter les erreurs de build)
let resend: Resend | null = null

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

async function getSalonAddress(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Unable to load salon address: Supabase is not configured')
    return ''
  }
  try {
    const client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data, error } = await client.from('settings').select('value').eq('key', 'general').maybeSingle()
    if (error) throw error
    return typeof data?.value?.address === 'string' && data.value.address.trim()
      ? data.value.address.trim()
      : 'Rue Rogier 7A, 5000 Namur'
  } catch (error) {
    console.error('Unable to load salon address for email:', error)
    return ''
  }
}

async function sendClientBookingEmail(booking: BookingDetails, kind: EmailKind, lang: EmailLanguage, oldBooking?: BookingDetails) {
  const resendClient = getResend()
  if (!resendClient) {
    console.log('RESEND_API_KEY not configured - email not sent')
    return { success: false, error: 'Email not configured' }
  }
  const salonName = process.env.NEXT_PUBLIC_SALON_NAME || 'Elite Barbershop'
  const salonEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  if (lang !== 'fr' && lang !== 'en' && lang !== 'nl') {
    console.error('Unsupported booking email language:', lang)
    return { success: false, error: 'Unsupported email language' }
  }
  try {
    const address = await getSalonAddress()
    let rescheduleToken: string | undefined
    if (booking.id && kind !== 'clientCancelled' && kind !== 'salonCancelled') {
      try {
        rescheduleToken = await createRescheduleToken(booking.id)
      } catch (error) {
        console.error('Unable to create reschedule link; sending email without it:', error)
      }
    }
    const { subject, html } = renderBookingEmail({
      booking, oldBooking, kind, lang, salonName, address,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://tareksalon.be',
      rescheduleToken,
    })
    const { data, error } = await resendClient.emails.send({
      from: `${salonName} <${salonEmail}>`, to: booking.email, subject, html,
    })
    if (error) {
      console.error('Error sending client email:', error)
      return { success: false, error: error.message }
    }
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending client email:', error)
    return { success: false, error: String(error) }
  }
}

export async function sendClientConfirmation(booking: BookingDetails) {
  return sendClientBookingEmail(booking, booking.status === 'confirmed' ? 'confirmed' : 'received', booking.language || 'fr')
}

export async function sendAdminNotification(booking: BookingDetails) {
  const resendClient = getResend()
  
  if (!resendClient) {
    console.log('⚠️ RESEND_API_KEY non configurée - notification admin non envoyée')
    return { success: false, error: 'Email non configuré' }
  }

  const salonName = process.env.NEXT_PUBLIC_SALON_NAME || 'Elite Barbershop'
  const salonEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL

  if (!adminEmail) {
    console.log('⚠️ ADMIN_EMAIL non configuré')
    return { success: false, error: 'Admin email non configuré' }
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: `${salonName} <${salonEmail}>`,
      to: adminEmail,
      subject: `🔔 Nouvelle réservation - ${booking.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <h2 style="color: #d4af37; margin-top: 0;">🔔 Nouvelle Réservation</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">👤 Client</td>
                <td style="padding: 8px 0; font-weight: bold;">${booking.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">📧 Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${booking.email}">${booking.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">📱 Téléphone</td>
                <td style="padding: 8px 0;"><a href="tel:${booking.phone}">${booking.phone}</a></td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 8px 0; color: #666;">📅 Date</td>
                <td style="padding: 8px 0; font-weight: bold;">${booking.date}</td>
              </tr>
              <tr style="background-color: #f9f9f9;">
                <td style="padding: 8px 0; color: #666;">⏰ Heure</td>
                <td style="padding: 8px 0; font-weight: bold;">${booking.time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">✂️ Service</td>
                <td style="padding: 8px 0; color: #d4af37; font-weight: bold;">${booking.service}</td>
              </tr>
            </table>
            
            ${booking.message ? `
            <div style="background-color: #f9f9f9; padding: 10px; margin-top: 15px; border-radius: 4px;">
              <strong>Message :</strong><br>
              ${booking.message}
            </div>
            ` : ''}
            
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              Envoyé automatiquement par ${salonName}
            </p>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Erreur envoi notification admin:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('❌ Erreur envoi notification:', error)
    return { success: false, error: String(error) }
  }
}

// Fonction principale pour envoyer tous les emails
export async function sendBookingEmails(booking: BookingDetails) {
  const results = await Promise.all([
    sendClientConfirmation(booking),
    sendAdminNotification(booking)
  ])

  return {
    clientEmail: results[0],
    adminEmail: results[1]
  }
}

// Email de confirmation de rendez-vous (quand admin confirme)
export async function sendBookingConfirmedEmail(booking: BookingDetails, lang: EmailLanguage = booking.language || 'fr') {
  return sendClientBookingEmail(booking, 'confirmed', lang)
}

export async function sendClientCancellationConfirmation(booking: BookingDetails, lang: EmailLanguage = booking.language || 'fr') {
  return sendClientBookingEmail(booking, 'clientCancelled', lang)
}

export async function sendAdminCancellationNotification(booking: BookingDetails, lang: EmailLanguage = booking.language || 'fr') {
  const resendClient = getResend()

  if (!resendClient) {
    console.log('⚠️ RESEND_API_KEY non configurée')
    return { success: false, error: 'Email non configuré' }
  }

  const salonName = process.env.NEXT_PUBLIC_SALON_NAME || 'Elite Barbershop'
  const salonEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tareksalon.be'

  const texts = {
    fr: {
      subject: `❌ Rendez-vous annulé par le client - ${salonName}`,
      greeting: 'Un client a annulé son rendez-vous :',
      details: 'Détails du rendez-vous annulé :',
      date: 'Date',
      time: 'Heure',
      service: 'Service',
      client: 'Client',
      email: 'Email',
      phone: 'Téléphone',
      note: 'Note d\'annulation',
      action: 'Vous pouvez maintenant libérer ce créneau pour d\'autres clients.',
      team: `L'équipe ${salonName}`
    },
    en: {
      subject: `❌ Appointment Cancelled by Client - ${salonName}`,
      greeting: 'A client has cancelled their appointment:',
      details: 'Cancelled appointment details:',
      date: 'Date',
      time: 'Time',
      service: 'Service',
      client: 'Client',
      email: 'Email',
      phone: 'Phone',
      note: 'Cancellation note',
      action: 'You can now free up this time slot for other clients.',
      team: `${salonName} Team`
    }
  }

  const t = texts[lang === 'nl' ? 'en' : lang]

  try {
    const { data, error } = await resendClient.emails.send({
      from: `${salonName} <${salonEmail}>`,
      to: adminEmail,
      subject: t.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #ef4444;">

            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">❌ ${lang === 'fr' ? 'Rendez-vous Annulé' : 'Appointment Cancelled'}</h1>
            </div>

            <div style="padding: 30px;">
              <h2 style="color: #ef4444; margin-top: 0;">${t.greeting}</h2>

              <div style="background-color: #0a0a0a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="color: #ef4444; margin-top: 0;">${t.details}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #888888;">👤 ${t.client}</td>
                    <td style="padding: 8px 0; color: #ffffff; text-align: right; font-weight: bold;">${booking.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888888; border-top: 1px solid #333;">📧 ${t.email}</td>
                    <td style="padding: 8px 0; color: #ffffff; text-align: right; border-top: 1px solid #333;">${booking.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888888; border-top: 1px solid #333;">📞 ${t.phone}</td>
                    <td style="padding: 8px 0; color: #ffffff; text-align: right; border-top: 1px solid #333;">${booking.phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888888; border-top: 1px solid #333;">📅 ${t.date}</td>
                    <td style="padding: 8px 0; color: #888888; text-align: right; text-decoration: line-through; border-top: 1px solid #333;">${booking.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888888; border-top: 1px solid #333;">⏰ ${t.time}</td>
                    <td style="padding: 8px 0; color: #888888; text-align: right; text-decoration: line-through; border-top: 1px solid #333;">${booking.time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888888; border-top: 1px solid #333;">✂️ ${t.service}</td>
                    <td style="padding: 8px 0; color: #888888; text-align: right; text-decoration: line-through; border-top: 1px solid #333;">${booking.service}</td>
                  </tr>
                </table>
              </div>

              ${booking.cancelNote ? `
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 16px;">💬 ${t.note}</h3>
                <p style="color: #cccccc; margin: 0; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(booking.cancelNote)}</p>
              </div>
              ` : ''}

              <p style="color: #cccccc; line-height: 1.6;">
                ${t.action}
              </p>
            </div>

            <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #666666; margin: 0; font-size: 12px;">
                ${t.team}
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Erreur envoi email notification annulation admin:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('❌ Erreur envoi email notification annulation:', error)
    return { success: false, error: String(error) }
  }
}

// Email d'annulation de rendez-vous (quand admin annule)
export async function sendBookingCancelledEmail(booking: BookingDetails, lang: EmailLanguage = booking.language || 'fr') {
  return sendClientBookingEmail(booking, 'salonCancelled', lang)
}

export async function sendBookingRescheduledEmail(booking: BookingDetails, lang: EmailLanguage = booking.language || 'fr') {
  return sendClientBookingEmail(booking, 'rescheduled', lang)
}

export async function sendAdminModifiedBookingEmail(oldBooking: BookingDetails, newBooking: BookingDetails, lang: EmailLanguage = newBooking.language || oldBooking.language || 'fr') {
  return sendClientBookingEmail(newBooking, 'adminModified', lang, oldBooking)
}
