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

    // Insert booking into Supabase
    const supabase = getSupabaseClient()
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
    await sendBookingEmails({ name, email, phone, date, time, service, message })

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
        .select('date, time, service')
        .eq('date', date)
        .eq('status', 'confirmed')

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
