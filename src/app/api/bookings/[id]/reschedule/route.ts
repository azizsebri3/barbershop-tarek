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
    const { newDate, newTime, lang = 'fr' } = body

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

    // Check if booking is cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot reschedule a cancelled booking' },
        { status: 400 }
      )
    }

    const oldDate = booking.date
    const oldTime = booking.time

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
