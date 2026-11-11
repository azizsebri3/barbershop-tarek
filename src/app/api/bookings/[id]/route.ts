import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBookingConfirmedEmail, sendBookingCancelledEmail } from '@/lib/email-service'
import { verifyAdminToken } from '@/lib/admin-session'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, serviceKey, { auth: { autoRefreshToken: false } })
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function isMissingAvailabilityTable(error: { code?: string; message?: string }): boolean {
  return error.code === '42P01' ||
    error.code === 'PGRST205' ||
    error.message?.toLowerCase().includes('availability_slots') === true
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking: data }, { status: 200 })
  } catch (error) {
    console.error('GET booking error:', error)
    return NextResponse.json(
      { error: 'A server error occurred' },
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
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { status, lang, cancel_note, name, email, phone, date, time, service, message, duration_minutes, notifyClient } = body

    // Check if it's a full booking edit (admin modification)
    const isFullEdit = name && email && phone && date && time && service
    
    const supabase = getSupabaseClient()
    
    // Récupérer les détails de la réservation avant mise à jour
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      console.error('❌ Réservation non trouvée:', fetchError)
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // ✨ FIX 3: Si admin modifie le RDV, vérifier la validation 1h aussi
    if (isFullEdit) {
      // Vérifier la disponibilité (comme en POST)
      const services = [
        { name: 'Coupe Homme', duration: 30 },
        { name: 'Barbe + Coupe', duration: 60 },
        { name: 'Barbe', duration: 30 }
      ]
      
      const selectedService = services.find(s => s.name === service)
      const serviceDuration = Number(duration_minutes) || Number(booking.duration_minutes) || selectedService?.duration || 30
      
      const [startHour, startMin] = time.split(':').map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = startMinutes + serviceDuration

      const { data: availabilitySlots, error: availabilityError } = await supabase
        .from('availability_slots')
        .select('start_time, end_time, is_available, is_all_day')
        .eq('date', date)

      if (availabilityError && !isMissingAvailabilityTable(availabilityError)) {
        console.error('Error fetching configured availability:', availabilityError)
        return NextResponse.json(
          { error: 'Unable to verify availability' },
          { status: 500 }
        )
      }

      if (availabilitySlots && availabilitySlots.length > 0) {
        const isWithinAvailableSlot = availabilitySlots.some(slot => {
          if (!slot.is_available) return false
          const slotStart = slot.is_all_day ? 0 : toMinutes(slot.start_time)
          const slotEnd = slot.is_all_day ? 24 * 60 : toMinutes(slot.end_time)
          return startMinutes >= slotStart && endMinutes <= slotEnd
        })
        const overlapsUnavailableSlot = availabilitySlots.some(slot => {
          if (slot.is_available) return false
          const slotStart = slot.is_all_day ? 0 : toMinutes(slot.start_time)
          const slotEnd = slot.is_all_day ? 24 * 60 : toMinutes(slot.end_time)
          return startMinutes < slotEnd && endMinutes > slotStart
        })

        if (!isWithinAvailableSlot || overlapsUnavailableSlot) {
          return NextResponse.json(
            { error: 'The appointment must remain entirely within the configured availability.' },
            { status: 409 }
          )
        }
      }

      const { data: blockedSlots, error: blockedSlotsError } = await supabase
        .from('blocked_time_slots')
        .select('start_time, end_time')
        .eq('date', date)

      if (blockedSlotsError) {
        console.error('Error fetching blocked time slots:', blockedSlotsError)
        return NextResponse.json({ error: 'Unable to verify blocked time slots.' }, { status: 500 })
      }

      if ((blockedSlots || []).some(slot =>
        startMinutes < toMinutes(slot.end_time) && endMinutes > toMinutes(slot.start_time)
      )) {
        return NextResponse.json(
          { error: 'This appointment overlaps a blocked time slot. Please unblock it first.' },
          { status: 409 }
        )
      }

      // Récupérer les conflits (SAUF cette réservation)
      const { data: existingBookings, error: fetchError2 } = await supabase
        .from('bookings')
        .select('time, service, duration_minutes, status')
        .eq('date', date)
        .neq('id', id)
        .in('status', ['confirmed', 'pending'])
      
      if (!fetchError2 && existingBookings) {
        for (const existingBooking of existingBookings) {
          const existingService = services.find(s => s.name === existingBooking.service)
          const existingDuration = existingBooking.duration_minutes || existingService?.duration || 30
          
          const [existingHour, existingMin] = existingBooking.time.split(':').map(Number)
          const existingStartMinutes = existingHour * 60 + existingMin
          const existingEndMinutes = existingStartMinutes + existingDuration
          
          if (startMinutes < existingEndMinutes && endMinutes > existingStartMinutes) {
            return NextResponse.json(
              { error: 'This time conflicts with another appointment.' },
              { status: 409 }
            )
          }
        }
      }
      
      // Vérifier validation 1h du client aussi
      const { data: clientBookings, error: clientError } = await supabase
        .from('bookings')
        .select('date, time, service, status')
        .eq('email', email.toLowerCase())
        .neq('id', id)
        .eq('status', 'confirmed')

      if (!clientError && clientBookings) {
        for (const clientBooking of clientBookings) {
          const bookingService = services.find(s => s.name === clientBooking.service)
          const bookingDuration = bookingService?.duration || 30
          
          const [bookingHour, bookingMin] = clientBooking.time.split(':').map(Number)
          const bookingEndMinutes = bookingHour * 60 + bookingMin + bookingDuration

          const newBookingDate = new Date(date)
          const existingDate = new Date(clientBooking.date)

          if (newBookingDate.toDateString() === existingDate.toDateString()) {
            const minGapMinutes = 60
            if (startMinutes >= (bookingHour * 60 + bookingMin) - minGapMinutes && startMinutes < bookingEndMinutes + minGapMinutes) {
              return NextResponse.json(
                { error: 'This client already has an appointment that day. A minimum one-hour gap is required.' },
                { status: 409 }
              )
            }
          }
        }
      }
    }
    
    if (isFullEdit) {
      // Admin is editing booking details
      const updateData: any = {
        name,
        email,
        phone,
        date,
        time,
        service,
        duration_minutes: Number(duration_minutes) || undefined,
        message,
        updated_at: new Date().toISOString()
      }
      if (booking.visit_outcome && (booking.date !== date || booking.time.slice(0, 5) !== time.slice(0, 5))) {
        updateData.visit_outcome = null
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
          await sendAdminModifiedBookingEmail(booking, {
            ...booking,
            ...updateData,
            duration_minutes: updateData.duration_minutes ?? booking.duration_minutes,
          }, lang)
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
          { error: 'Invalid status' },
          { status: 400 }
        )
      }

      if (status === 'cancelled' && cancel_note != null && typeof cancel_note !== 'string') {
        return NextResponse.json({ error: 'Invalid cancellation reason' }, { status: 400 })
      }
      const cancellationReason = typeof cancel_note === 'string' ? cancel_note.trim() : ''

      // Mettre à jour le statut
      const updateData: any = { status, updated_at: new Date().toISOString() }
      if (booking.visit_outcome && status !== 'confirmed') {
        updateData.visit_outcome = null
      }
      if (status === 'cancelled') {
        updateData.cancel_note = cancellationReason || null
        updateData.cancelled_by = 'admin'
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
          message: booking.message,
          duration_minutes: booking.duration_minutes,
          language: booking.language
        }, lang)
      } else if (status === 'cancelled') {
        const notification = await sendBookingCancelledEmail({
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          date: booking.date,
          time: booking.time,
          service: booking.service,
          message: booking.message,
          cancelNote: cancellationReason || undefined,
          language: booking.language
        }, lang).catch((error) => {
          console.error('Cancellation email failed:', error)
          return { success: false }
        })
        if (!notification.success) console.error('Cancellation email was not sent')
        return NextResponse.json({ success: true, clientNotified: notification.success })
      }

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
