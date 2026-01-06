import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendClientCancellationConfirmation, sendAdminCancellationNotification } from '@/lib/email-service'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, serviceKey, { auth: { autoRefreshToken: false } })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { cancelNote } = body

    const supabase = getSupabaseClient()

    // Récupérer les détails de la réservation avant mise à jour
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      console.error('❌ Réservation non trouvée:', fetchError)
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }

    // Vérifier que la réservation n'est pas déjà annulée
    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cette réservation est déjà annulée' }, { status: 400 })
    }

    // Mettre à jour le statut à annulé avec la note
    const updateData: any = {
      status: 'cancelled',
      cancelled_by: 'client',
      updated_at: new Date().toISOString()
    }
    if (cancelNote && cancelNote.trim()) {
      updateData.cancel_note = cancelNote.trim()
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('❌ Erreur Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Envoyer les emails appropriés
    // 1. Confirmation au client que son annulation a été prise en compte
    await sendClientCancellationConfirmation({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      service: booking.service,
      message: booking.message,
      cancelNote: cancelNote
    })

    // 2. Notification à l'admin qu'un client a annulé (toujours en anglais)
    await sendAdminCancellationNotification({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      service: booking.service,
      message: booking.message,
      cancelNote: cancelNote
    }, 'en')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur lors de l\'annulation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}