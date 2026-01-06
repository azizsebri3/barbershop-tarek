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

// Get available time slots for a given date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const excludeBookingId = searchParams.get('excludeBookingId') // For rescheduling, exclude current booking

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Get all confirmed and pending bookings for this date
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, time')
      .eq('date', date)
      .in('status', ['confirmed', 'pending'])

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter out the current booking if provided (for rescheduling)
    const occupiedTimes = bookings
      ?.filter(b => b.id !== excludeBookingId)
      .map(b => b.time) || []

    // Generate available time slots (every 30 minutes from 09:00 to 19:00)
    const availableSlots = generateTimeSlots(occupiedTimes)

    return NextResponse.json({
      date,
      availableSlots,
      occupiedTimes
    })
  } catch (error) {
    console.error('❌ Error getting availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateTimeSlots(occupiedTimes: string[]): string[] {
  const slots: string[] = []
  const startHour = 9 // 09:00
  const endHour = 19 // 19:00

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes of [0, 30]) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      if (!occupiedTimes.includes(timeStr)) {
        slots.push(timeStr)
      }
    }
  }

  return slots
}
