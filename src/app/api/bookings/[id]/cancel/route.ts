import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendClientCancellationConfirmation, sendAdminCancellationNotification } from '@/lib/email-service'
import { sendAdminBookingPush } from '@/lib/admin-booking-push'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false } }
    )
    const { data, error } = await supabase
      .from('bookings')
      .select('id, name, date, time, service, status')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }
    return NextResponse.json({ booking: data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET booking for cancellation error:', error)
    return NextResponse.json({ error: 'A server error occurred' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { cancelNote, email } = body

    // ✨ FIX 7: Vérifier que le client fournit son email pour autoriser l'annulation
    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email required to cancel booking' },
        { status: 400 }
      )
    }
    if (cancelNote != null && typeof cancelNote !== 'string') {
      return NextResponse.json({ error: 'Invalid cancellation reason' }, { status: 400 })
    }
    const cancellationReason = typeof cancelNote === 'string' ? cancelNote.trim() : ''

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false } }
    )

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

    // ✨ FIX 7: Vérifier que l'email du client correspond à la réservation
    if (booking.email.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: Email does not match booking' },
        { status: 403 }
      )
    }

    // Vérifier que la réservation n'est pas déjà annulée
    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cette réservation est déjà annulée' }, { status: 400 })
    }

    // Mettre à jour le statut à annulé avec la note
    const updateData: any = {
      status: 'cancelled',
      cancelled_by: 'client',
      cancel_note: cancellationReason || null,
      updated_at: new Date().toISOString()
    }
    if (booking.visit_outcome) updateData.visit_outcome = null

    const { data: updated, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id).eq('status', booking.status).eq('date', booking.date).eq('time', booking.time)
      .select('id').maybeSingle()

    if (error) {
      console.error('❌ Erreur Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!updated) {
      return NextResponse.json({ error: 'Le rendez-vous a changé. Rechargez la page et réessayez.' }, { status: 409 })
    }

    await sendAdminBookingPush(supabase, {
      kind: 'cancelled', name: booking.name, service: booking.service, date: booking.date, time: booking.time,
    })

    // Envoyer les emails appropriés
    // 1. Confirmation au client que son annulation a été prise en compte
    const clientNotification = await sendClientCancellationConfirmation({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      service: booking.service,
      message: booking.message,
      language: booking.language,
      cancelNote: cancellationReason || undefined
    }).catch((error) => {
      console.error('Client cancellation email failed:', error)
      return { success: false }
    })

    // 2. Notification à l'admin qu'un client a annulé (toujours en anglais)
    const adminNotification = await sendAdminCancellationNotification({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      service: booking.service,
      message: booking.message,
      cancelNote: cancellationReason || undefined
    }, 'en').catch((error) => {
      console.error('Admin cancellation email failed:', error)
      return { success: false }
    })
    if (!clientNotification.success || !adminNotification.success) {
      console.error('Cancellation notification was not sent', {
        clientNotified: clientNotification.success,
        adminNotified: adminNotification.success
      })
    }

    return NextResponse.json({
      success: true,
      clientNotified: clientNotification.success,
      adminNotified: adminNotification.success
    })
  } catch (error) {
    console.error('❌ Erreur lors de l\'annulation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}