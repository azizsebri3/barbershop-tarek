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

// GET /api/push/subscribe - Récupérer la clé publique VAPID
export async function GET() {
  return NextResponse.json({
    publicKey: vapidPublicKey
  })
}

// POST /api/push/subscribe - Enregistrer une subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription } = body

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription manquante' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Vérifier si cette subscription existe déjà
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .single()

    if (existing) {
      // Mettre à jour la subscription existante
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          subscription: subscription,
          updated_at: new Date().toISOString()
        })
        .eq('endpoint', subscription.endpoint)

      if (error) {
        console.error('❌ Erreur mise à jour subscription:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Créer une nouvelle subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          id: crypto.randomUUID(),
          endpoint: subscription.endpoint,
          subscription: subscription,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Erreur création subscription:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur subscription:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/push/subscribe - Supprimer une subscription
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint manquant' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)

    if (error) {
      console.error('❌ Erreur suppression subscription:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur suppression:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
