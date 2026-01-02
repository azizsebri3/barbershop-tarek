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

// GET /api/services - Récupérer les services depuis la table services
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Erreur DB:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (data && data.length > 0) {
      return NextResponse.json({ services: data })
    } else {
      return NextResponse.json({ services: [] })
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des services:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/services - Sauvegarder les services dans la table services
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { services } = body

    if (!services || !Array.isArray(services)) {
      return NextResponse.json(
        { error: 'Données services manquantes ou invalides' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    // Supprimer tous les anciens services
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deleteError) {
      console.error('❌ Erreur suppression:', deleteError)
    }

    // Insérer les nouveaux services avec de vrais UUIDs
    const servicesToInsert = services.map((service: { id?: string; name: string; description: string; price: number; duration: number }) => ({
      id: crypto.randomUUID(), // Toujours générer un UUID valide
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { error: insertError } = await supabase
      .from('services')
      .insert(servicesToInsert)

    if (insertError) {
      console.error('❌ Erreur insertion:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
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