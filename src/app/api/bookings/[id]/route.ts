import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBookingConfirmedEmail, sendBookingCancelledEmail } from '@/lib/email-service'

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
    const { status, lang = 'fr', cancel_note, cancelled_by, name, email, phone, date, time, service, message, notifyClient } = body

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

    // Check if it's a full booking edit (admin modification) or status update
    const isFullEdit = name && email && phone && date && time && service
    
    if (isFullEdit) {
      // Admin is editing booking details
      const updateData: any = {
        name,
        email,
        phone,
        date,
        time,
        service,
        message,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Send admin modification email notification ONLY if notifyClient is true
      try {
        if (notifyClient) {
          const { sendAdminModifiedBookingEmail } = await import('@/lib/email-service')
          await sendAdminModifiedBookingEmail(booking, { ...booking, ...updateData }, lang)
        }
      } catch (emailError) {
        console.error('⚠️ Email notification failed:', emailError)
        // Don't fail the request if email fails
      }

      return NextResponse.json({ success: true, modified: true })
    } else {
      // Status update only
      if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { error: 'Statut invalide' },
          { status: 400 }
        )
      }

      // Mettre à jour le statut
      const updateData: any = { status, updated_at: new Date().toISOString() }
      if (status === 'cancelled') {
        if (cancel_note) {
          updateData.cancel_note = cancel_note
        }
        if (cancelled_by) {
          updateData.cancelled_by = cancelled_by
        }
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Envoyer l'email approprié selon le nouveau statut
      if (status === 'confirmed') {
        await sendBookingConfirmedEmail({
          id: booking.id,
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          date: booking.date,
          time: booking.time,
          service: booking.service,
          message: booking.message
        }, lang)
      } else if (status === 'cancelled') {
        await sendBookingCancelledEmail({
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          date: booking.date,
          time: booking.time,
          service: booking.service,
          message: booking.message,
          cancelNote: cancel_note
        }, lang)
      }

      return NextResponse.json({ success: true })
    }
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
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Erreur Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
