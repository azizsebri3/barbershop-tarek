import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBookingRescheduledEmail } from '@/lib/email-service'

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
    
    // Get booking details
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Return booking info without sensitive data
    return NextResponse.json({
      booking: {
        id: booking.id,
        name: booking.name,
        email: booking.email,
        date: booking.date,
        time: booking.time,
        service: booking.service
      }
    })
  } catch (error) {
    console.error('❌ Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Server error' },
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
    const { newDate, newTime, email, lang = 'fr' } = body

    // ✨ FIX 8: Vérifier que le client fournit son email pour reschedule
    if (!email) {
      return NextResponse.json(
        { error: 'Email required to reschedule booking' },
        { status: 400 }
      )
    }

    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Get current booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // ✨ FIX 8: Vérifier que l'email du client correspond à la réservation
    if (booking.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: Email does not match booking' },
        { status: 403 }
      )
    }

    // Check if booking is cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot reschedule a cancelled booking' },
        { status: 400 }
      )
    }

    const oldDate = booking.date
    const oldTime = booking.time

    // ✨ FIX 9: Vérifier la validation 1h entre RDVs lors d'une reschedulisation
    // Récupérer les détails du service pour calculer la durée
    const services = [
      { name: 'Coupe Homme', duration: 30 },
      { name: 'Barbe + Coupe', duration: 60 },
      { name: 'Barbe', duration: 30 }
    ]
    
    const selectedService = services.find(s => s.name === booking.service)
    const serviceDuration = selectedService?.duration || 30
    
    // Vérifier que la nouvelle date n'a pas de conflit avec le créneau horaire
    const [startHour, startMin] = newTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = startMinutes + serviceDuration
    
    const { data: existingBookings, error: fetchError2 } = await supabase
      .from('bookings')
      .select('time, service, status')
      .eq('date', newDate)
      .neq('id', id) // Exclure cette réservation
      .in('status', ['confirmed', 'pending'])
    
    if (!fetchError2 && existingBookings) {
      for (const existingBooking of existingBookings) {
        const existingService = services.find(s => s.name === existingBooking.service)
        const existingDuration = existingService?.duration || 30
        
        const [existingHour, existingMin] = existingBooking.time.split(':').map(Number)
        const existingStartMinutes = existingHour * 60 + existingMin
        const existingEndMinutes = existingStartMinutes + existingDuration
        
        // Vérifier conflit de créneau
        if (startMinutes < existingEndMinutes && endMinutes > existingStartMinutes) {
          return NextResponse.json(
            { error: 'This time slot is not available' },
            { status: 409 }
          )
        }
      }
    }
    
    // Vérifier la règle 1h minimum entre RDVs du même client (SAUF si dates différentes)
    if (newDate === booking.date) {
      // Même jour - vérifier l'écart 1h
      const { data: clientBookings, error: fetchError3 } = await supabase
        .from('bookings')
        .select('time, service, status')
        .eq('email', booking.email.toLowerCase())
        .eq('date', newDate)
        .neq('id', id) // Exclure cette réservation
        .eq('status', 'confirmed')
      
      if (!fetchError3 && clientBookings && clientBookings.length > 0) {
        for (const otherBooking of clientBookings) {
          const otherService = services.find(s => s.name === otherBooking.service)
          const otherDuration = otherService?.duration || 30
          
          const [otherHour, otherMin] = otherBooking.time.split(':').map(Number)
          const otherStartMinutes = otherHour * 60 + otherMin
          const otherEndMinutes = otherStartMinutes + otherDuration
          
          // Vérifier écart minimum de 1h (60 minutes)
          const gapBefore = otherStartMinutes - endMinutes
          const gapAfter = startMinutes - otherEndMinutes
          
          if ((gapBefore >= 0 && gapBefore < 60) || (gapAfter >= 0 && gapAfter < 60)) {
            return NextResponse.json(
              { error: `Minimum 1 hour gap required between appointments. Next available: ${String(Math.floor(otherEndMinutes / 60)).padStart(2, '0')}:${String(otherEndMinutes % 60).padStart(2, '0')}` },
              { status: 409 }
            )
          }
        }
      }
    }

    // Update booking with new date/time
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        date: newDate,
        time: newTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('❌ Error updating booking:', updateError)
      return NextResponse.json(
        { error: 'Failed to reschedule' },
        { status: 500 }
      )
    }

    // Send confirmation email to client
    await sendBookingRescheduledEmail(
      {
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        date: newDate,
        time: newTime,
        service: booking.service,
        message: booking.message,
        oldDate,
        oldTime
      },
      lang as 'fr' | 'en'
    )

    console.log(`✅ Booking ${id} rescheduled from ${oldDate} ${oldTime} to ${newDate} ${newTime}`)

    return NextResponse.json({
      success: true,
      message: 'Booking rescheduled successfully'
    })
  } catch (error) {
    console.error('❌ Error rescheduling booking:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
