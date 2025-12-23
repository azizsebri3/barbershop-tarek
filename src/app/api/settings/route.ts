import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Client Supabase avec clé service (côté serveur uniquement)
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'general')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur lecture settings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings: data?.value || null })
  } catch (error) {
    console.error('Erreur API settings:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { settings } = await request.json()

    if (!settings) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: 'general',
        value: settings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })

    if (error) {
      console.error('Erreur sauvegarde settings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur API settings POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}