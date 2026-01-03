import { Resend } from 'resend'

// Initialiser Resend (lazy loading pour éviter les erreurs de build)
let resend: Resend | null = null

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface BookingDetails {
  id?: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  service: string
  message?: string
  cancelNote?: string
}

// Email de confirmation au client
export async function sendClientConfirmation(booking: BookingDetails) {
  const resendClient = getResend()
  
  if (!resendClient) {
    console.log('⚠️ RESEND_API_KEY non configurée - email non envoyé')
    return { success: false, error: 'Email non configuré' }
  }

  const salonName = process.env.NEXT_PUBLIC_SALON_NAME || 'Elite Barbershop'
  const salonEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  try {
    const { data, error } = await resendClient.emails.send({
      from: `${salonName} <${salonEmail}>`,
      to: booking.email,
      subject: `✅ Confirmation de votre réservation - ${salonName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #d4af37;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px; text-align: center;">
              <h1 style="color: #0a0a0a; margin: 0; font-size: 28px;">✂️ ${salonName}</h1>
              <p style="color: #0a0a0a; margin: 10px 0 0 0; font-size: 16px;">Confirmation de réservation</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <h2 style="color: #d4af37; margin-top: 0;">Bonjour ${booking.name} ! 👋</h2>
              
              <p style="color: #cccccc; line-height: 1.6;">
                Votre réservation a bien été enregistrée. Voici les détails :
              </p>
              
              <!-- Booking Details Card -->
              <div style="background-color: #0a0a0a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #888888;">📅 Date</td>
                    <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${booking.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #888888; border-top: 1px solid #333;">⏰ Heure</td>
                    <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold; border-top: 1px solid #333;">${booking.time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #888888; border-top: 1px solid #333;">✂️ Service</td>
                    <td style="padding: 10px 0; color: #d4af37; text-align: right; font-weight: bold; border-top: 1px solid #333;">${booking.service}</td>
                  </tr>
                </table>
              </div>
              
              ${booking.message ? `
              <div style="background-color: #0a0a0a; border-radius: 12px; padding: 15px; margin: 20px 0;">
                <p style="color: #888888; margin: 0 0 5px 0; font-size: 14px;">💬 Votre message :</p>
                <p style="color: #ffffff; margin: 0;">${booking.message}</p>
              </div>
              ` : ''}
              
              ${booking.id ? `
              <!-- Cancellation Section -->
              <div style="background-color: #2a2a3e; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #444;">
                <h3 style="color: #d4af37; margin: 0 0 15px 0; font-size: 16px;">❌ Besoin d'annuler ?</h3>
                <p style="color: #cccccc; margin: 0 0 15px 0; font-size: 14px; line-height: 1.5;">
                  Si vous devez annuler votre rendez-vous, cliquez sur le bouton ci-dessous. 
                  Vous pourrez ajouter une note expliquant la raison de l'annulation.
                </p>
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-site.vercel.app'}/fr/booking/cancel/${booking.id}" 
                     style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; transition: background-color 0.3s;">
                    Annuler mon rendez-vous
                  </a>
                </div>
                <p style="color: #888888; margin: 15px 0 0 0; font-size: 12px;">
                  ⚠️ Nous vous recommandons d'annuler au moins 24h à l'avance.
                </p>
              </div>
              ` : ''}
              
              <p style="color: #cccccc; line-height: 1.6;">
                À très bientôt ! 🙌
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #666666; margin: 0; font-size: 12px;">
                ${salonName} - Votre salon de coiffure premium
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Erreur envoi email client:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return { success: false, error: String(error) }
  }
}

// Email de notification à l'admin
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
export async function sendBookingConfirmedEmail(booking: BookingDetails, lang: 'fr' | 'en' = 'fr') {
  const resendClient = getResend()
  
  if (!resendClient) {
    console.log('⚠️ RESEND_API_KEY non configurée')
    return { success: false, error: 'Email non configuré' }
  }

  const salonName = process.env.NEXT_PUBLIC_SALON_NAME || 'Elite Barbershop'
  const salonEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  const texts = {
    fr: {
      subject: `✅ Rendez-vous confirmé - ${salonName}`,
      greeting: `Bonjour ${booking.name} !`,
      message: 'Votre rendez-vous a été confirmé par notre équipe.',
      details: 'Détails de votre rendez-vous :',
      date: 'Date',
      time: 'Heure',
      service: 'Service',
      reminder: 'N\'oubliez pas de venir quelques minutes en avance.',
      seeYou: 'À très bientôt !',
      footer: 'Votre salon de coiffure premium'
    },
    en: {
      subject: `✅ Appointment Confirmed - ${salonName}`,
      greeting: `Hello ${booking.name}!`,
      message: 'Your appointment has been confirmed by our team.',
      details: 'Appointment details:',
      date: 'Date',
      time: 'Time',
      service: 'Service',
      reminder: 'Please arrive a few minutes early.',
      seeYou: 'See you soon!',
      footer: 'Your premium barbershop'
    }
  }

  const t = texts[lang]

  try {
    const { data, error } = await resendClient.emails.send({
      from: `${salonName} <${salonEmail}>`,
      to: booking.email,
      subject: t.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #22c55e;">
            
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ ${lang === 'fr' ? 'Rendez-vous Confirmé' : 'Appointment Confirmed'}</h1>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #22c55e; margin-top: 0;">${t.greeting} 👋</h2>
              
              <p style="color: #cccccc; line-height: 1.6; font-size: 16px;">
                ${t.message}
              </p>
              
              <div style="background-color: #0a0a0a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #22c55e;">
                <h3 style="color: #22c55e; margin-top: 0;">${t.details}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #888888;">📅 ${t.date}</td>
                    <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold;">${booking.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #888888; border-top: 1px solid #333;">⏰ ${t.time}</td>
                    <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: bold; border-top: 1px solid #333;">${booking.time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #888888; border-top: 1px solid #333;">✂️ ${t.service}</td>
                    <td style="padding: 10px 0; color: #22c55e; text-align: right; font-weight: bold; border-top: 1px solid #333;">${booking.service}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #cccccc; line-height: 1.6;">
                💡 ${t.reminder}
              </p>
              
              <p style="color: #cccccc; line-height: 1.6;">
                ${t.seeYou} 🙌
              </p>
            </div>
            
            <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #666666; margin: 0; font-size: 12px;">
                ${salonName} - ${t.footer}
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Erreur envoi email confirmation:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return { success: false, error: String(error) }
  }
}

// Email d'annulation de rendez-vous (quand admin annule)
export async function sendBookingCancelledEmail(booking: BookingDetails, lang: 'fr' | 'en' = 'fr') {
  const resendClient = getResend()
  
  if (!resendClient) {
    console.log('⚠️ RESEND_API_KEY non configurée')
    return { success: false, error: 'Email non configuré' }
  }

  const salonName = process.env.NEXT_PUBLIC_SALON_NAME || 'Elite Barbershop'
  const salonEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  const texts = {
    fr: {
      subject: `❌ Rendez-vous annulé - ${salonName}`,
      greeting: `Bonjour ${booking.name},`,
      sorry: 'Nous sommes vraiment désolés',
      message: 'Malheureusement, nous devons annuler votre rendez-vous prévu :',
      date: 'Date',
      time: 'Heure',
      service: 'Service',
      reason: 'Nous nous excusons sincèrement pour ce désagrément. Cela peut être dû à des circonstances imprévues ou à une indisponibilité exceptionnelle.',
      reschedule: 'Nous vous invitons à reprendre un nouveau rendez-vous sur notre site. En compensation, nous vous offrirons une attention particulière lors de votre prochaine visite.',
      button: 'Reprendre un rendez-vous',
      contact: 'Pour toute question, n\'hésitez pas à nous contacter.',
      apologies: 'Encore toutes nos excuses,',
      team: `L'équipe ${salonName}`,
      footer: 'Votre salon de coiffure premium'
    },
    en: {
      subject: `❌ Appointment Cancelled - ${salonName}`,
      greeting: `Hello ${booking.name},`,
      sorry: 'We are truly sorry',
      message: 'Unfortunately, we have to cancel your scheduled appointment:',
      date: 'Date',
      time: 'Time',
      service: 'Service',
      reason: 'We sincerely apologize for any inconvenience. This may be due to unforeseen circumstances or exceptional unavailability.',
      reschedule: 'We invite you to book a new appointment on our website. As compensation, we will give you special attention during your next visit.',
      button: 'Book a new appointment',
      contact: 'If you have any questions, please don\'t hesitate to contact us.',
      apologies: 'Once again, our sincere apologies,',
      team: `The ${salonName} Team`,
      footer: 'Your premium barbershop'
    }
  }

  const t = texts[lang]
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://votre-site.vercel.app'

  try {
    const { data, error } = await resendClient.emails.send({
      from: `${salonName} <${salonEmail}>`,
      to: booking.email,
      subject: t.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #ef4444;">
            
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">😔 ${t.sorry}</h1>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #ef4444; margin-top: 0;">${t.greeting}</h2>
              
              <p style="color: #cccccc; line-height: 1.6; font-size: 16px;">
                ${t.message}
              </p>
              
              <div style="background-color: #0a0a0a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; opacity: 0.8;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #888888;">📅 ${t.date}</td>
                    <td style="padding: 10px 0; color: #888888; text-align: right; text-decoration: line-through;">${booking.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #888888; border-top: 1px solid #333;">⏰ ${t.time}</td>
                    <td style="padding: 10px 0; color: #888888; text-align: right; text-decoration: line-through; border-top: 1px solid #333;">${booking.time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #888888; border-top: 1px solid #333;">✂️ ${t.service}</td>
                    <td style="padding: 10px 0; color: #888888; text-align: right; text-decoration: line-through; border-top: 1px solid #333;">${booking.service}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #cccccc; line-height: 1.6;">
                ${t.reason}
              </p>
              
              ${booking.cancelNote ? `
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 16px;">💬 Note d'annulation</h3>
                <p style="color: #cccccc; margin: 0; line-height: 1.6;">${booking.cancelNote}</p>
              </div>
              ` : ''}
              
              <p style="color: #cccccc; line-height: 1.6;">
                ${t.reschedule}
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${siteUrl}/booking" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #0a0a0a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  📅 ${t.button}
                </a>
              </div>
              
              <p style="color: #cccccc; line-height: 1.6;">
                ${t.contact}
              </p>
              
              <p style="color: #cccccc; line-height: 1.6; margin-top: 30px;">
                ${t.apologies}<br>
                <strong style="color: #d4af37;">${t.team}</strong>
              </p>
            </div>
            
            <div style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #666666; margin: 0; font-size: 12px;">
                ${salonName} - ${t.footer}
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ Erreur envoi email annulation:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return { success: false, error: String(error) }
  }
}
