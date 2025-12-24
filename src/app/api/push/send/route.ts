import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, serviceKey, { auth: { autoRefreshToken: false } })
}

// Configure VAPID
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:admin@elitebarbershop.com',
    vapidPublicKey,
    vapidPrivateKey
  )
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
}

// POST /api/push/send - Envoyer une notification à tous les abonnés
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, data } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Titre et message requis' },
        { status: 400 }
      )
    }

    console.log('📤 Envoi de notification push:', { title, message })

    const supabase = getSupabaseClient()

    // Récupérer toutes les subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) {
      console.error('❌ Erreur récupération subscriptions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ Aucune subscription trouvée')
      return NextResponse.json({ 
        success: true, 
        sent: 0,
        message: 'Aucun appareil enregistré pour les notifications'
      })
    }

    const payload: NotificationPayload = {
      title,
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'booking-notification',
      data: data || { url: '/admin/dashboard' }
    }

    let successCount = 0
    let failCount = 0
    const failedEndpoints: string[] = []

    // Envoyer à chaque subscription
    for (const sub of subscriptions) {
      try {
        const pushSubscription: PushSubscription = sub.subscription
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        )
        successCount++
        console.log('✅ Notification envoyée à:', sub.endpoint.substring(0, 50) + '...')
      } catch (err) {
        failCount++
        failedEndpoints.push(sub.endpoint)
        console.error('❌ Erreur envoi notification:', err)
        
        // Si la subscription n'est plus valide, la supprimer
        const webPushError = err as { statusCode?: number }
        if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
          console.log('🗑️ Subscription expirée supprimée')
        }
      }
    }

    console.log(`📊 Résultat: ${successCount} envoyées, ${failCount} échouées`)

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      total: subscriptions.length
    })
  } catch (error) {
    console.error('❌ Erreur envoi notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
