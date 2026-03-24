import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { sendBookingEmails } from '@/lib/email-service'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, serviceKey, { auth: { autoRefreshToken: false } })
}

// Configure VAPID for push notifications
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@elitebarbershop.com',
    vapidPublicKey,
    vapidPrivateKey
  )
}

// Fonction pour envoyer une notification push à tous les admins
async function sendPushNotification(booking: { name: string; service: string; date: string; time: string }) {
  try {
    const supabase = getSupabaseClient()
    
    // Récupérer toutes les subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
    
    if (!subscriptions || subscriptions.length === 0) {
      return
    }

    const payload = JSON.stringify({
      title: '🔔 Nouvelle Réservation!',
      body: `${booking.name} - ${booking.service}\n📅 ${booking.date} à ${booking.time}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'booking-' + Date.now(),
      data: { url: '/admin/dashboard' }
    })

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub.subscription, payload)
      } catch (err) {
        console.error('❌ Erreur envoi push:', err)
        // Si subscription expirée, la supprimer
        const webPushError = err as { statusCode?: number }
        if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur notification push:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, date, time, service, message } = body

    // Validation
    if (!name || !email || !phone || !date || !time || !service) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Vérifier la disponibilité en tenant compte de la durée du service
    const services = [
      { name: 'Coupe Homme', duration: 30 },
      { name: 'Barbe + Coupe', duration: 60 },
      { name: 'Barbe', duration: 30 }
    ]
    
    const selectedService = services.find(s => s.name === service)
    const serviceDuration = selectedService?.duration || 30
    
    // Calculer les créneaux que cette réservation occuperait
    const [startHour, startMin] = time.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = startMinutes + serviceDuration
    
    // Récupérer les réservations existantes pour cette date
    const { data: existingBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('time, service, status')
      .eq('date', date)
      .in('status', ['confirmed', 'pending'])
    
    if (fetchError) {
      console.error('Error fetching existing bookings:', fetchError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des disponibilités' },
        { status: 500 }
      )
    }
    
    // Vérifier les conflits
    for (const booking of existingBookings || []) {
      // Ne vérifier les conflits qu'avec les réservations confirmées
      if (booking.status !== 'confirmed') continue
      
      const existingService = services.find(s => s.name === booking.service)
      const existingDuration = existingService?.duration || 30
      
      const [existingHour, existingMin] = booking.time.split(':').map(Number)
      const existingStartMinutes = existingHour * 60 + existingMin
      const existingEndMinutes = existingStartMinutes + existingDuration
      
      // Vérifier si les créneaux se chevauchent
      if (startMinutes < existingEndMinutes && endMinutes > existingStartMinutes) {
        return NextResponse.json(
          { error: 'Ce créneau n\'est pas disponible. Veuillez choisir un autre horaire.' },
          { status: 409 }
        )
      }
    }

    // ✨ Vérifier que le client ne prend pas 2 RDV rapidement (minimum 1h après le précédent)
    const { data: clientBookings, error: clientError } = await supabase
      .from('bookings')
      .select('date, time, service, status')
      .eq('email', email.toLowerCase())
      .eq('status', 'confirmed')

    if (clientError) {
      console.error('Error checking client bookings:', clientError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des réservations client' },
        { status: 500 }
      )
    }

    // Vérifier chaque réservation confirmée du client
    for (const clientBooking of clientBookings || []) {
      // Ignorer les réservations passées
      const bookingDateTime = new Date(`${clientBooking.date}T${clientBooking.time}`)
      if (bookingDateTime < new Date()) continue

      const clientService = services.find(s => s.name === clientBooking.service)
      const clientDuration = clientService?.duration || 30

      const [clientHour, clientMin] = clientBooking.time.split(':').map(Number)
      const clientStartMinutes = clientHour * 60 + clientMin
      const clientEndMinutes = clientStartMinutes + clientDuration

      // Calcul de la date du nouveau RDV
      const newBookingDate = new Date(date)
      const clientBookingDate = new Date(clientBooking.date)

      // Si c'est le même jour, vérifier la proximité en minutes
      if (newBookingDate.toDateString() === clientBookingDate.toDateString()) {
        // Vérifier si nouveau RDV est pendant ou moins de 60 min après le RDV existant
        const minGapMinutes = 60
        if (startMinutes >= clientStartMinutes - minGapMinutes && startMinutes < clientEndMinutes + minGapMinutes) {
          const earliestNextTime = new Date(0, 0, 0, clientHour, clientMin + clientDuration + minGapMinutes)
          
          return NextResponse.json(
            { 
              error: `Vous avez déjà un RDV ce jour. Vous pouvez reprendre un RDV à partir de ${earliestNextTime.getHours().toString().padStart(2, '0')}:${earliestNextTime.getMinutes().toString().padStart(2, '0')}.` 
            },
            { status: 409 }
          )
        }
      }
    }

    // Insert booking into Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        name,
        email,
        phone,
        date,
        time,
        service,
        message,
        status: 'pending',
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la réservation' },
        { status: 500 }
      )
    }

    // Envoyer une notification push aux admins
    await sendPushNotification({ name, service, date, time })

    // Envoyer les emails de confirmation
    await sendBookingEmails({ 
      id: data?.[0]?.id,
      name, 
      email, 
      phone, 
      date, 
      time, 
      service, 
      message 
    })

    return NextResponse.json(
      {
        message: 'Réservation créée avec succès',
        booking: data?.[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: 'Une erreur serveur s\'est produite' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    
    const supabase = getSupabaseClient()
    
    // Si une date est spécifiée, retourner seulement les réservations de ce jour
    if (date) {
      const { data, error } = await supabase
        .from('bookings')
        .select('date, time, service, status')
        .eq('date', date)
        .in('status', ['confirmed', 'pending'])

      if (error) {
        return NextResponse.json(
          { error: 'Erreur lors de la récupération des créneaux' },
          { status: 500 }
        )
      }

      return NextResponse.json(data || [], { status: 200 })
    }

    // Sinon, retourner toutes les réservations (pour l'admin)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des réservations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: data }, { status: 200 })
  } catch (error) {
    console.error('GET bookings error:', error)
    return NextResponse.json(
      { error: 'Une erreur serveur s\'est produite' },
      { status: 500 }
    )
  }
}
