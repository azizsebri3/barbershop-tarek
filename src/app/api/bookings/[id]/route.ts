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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking: data }, { status: 200 })
  } catch (error) {
    console.error('GET booking error:', error)
    return NextResponse.json(
      { error: 'Une erreur serveur s\'est produite' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    console.log('🔄 Mise à jour du statut de la réservation:', id, '->', status)

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('❌ Erreur Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Statut de la réservation mis à jour avec succès')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    console.log('🗑️ Suppression de la réservation:', id)

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Erreur Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Réservation supprimée avec succès')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
