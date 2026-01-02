import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, serviceKey, { auth: { autoRefreshToken: false } })
}

// GET /api/hours - Récupérer les horaires d'ouverture
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'opening_hours')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Erreur DB:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (data) {
      return NextResponse.json({ hours: data.value })
    } else {
      // Retourner les horaires par défaut
      const defaultHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '08:00', close: '17:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true }
      }
      return NextResponse.json({ hours: defaultHours })
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des horaires:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/hours - Sauvegarder les horaires d'ouverture
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hours } = body

    if (!hours) {
      return NextResponse.json(
        { error: 'Données horaires manquantes' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: 'opening_hours',
        value: hours,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })

    if (error) {
      console.error('❌ Erreur DB:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}