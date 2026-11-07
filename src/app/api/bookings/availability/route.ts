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

    // Apply the availability configured by the admin for this date.
    // If no override exists, preserve the normal 09:30-18:30 schedule.
    const { data: availabilitySlots, error: availabilityError } = await supabase
      .from('availability_slots')
      .select('start_time, end_time, is_available, is_all_day')
      .eq('date', date)

    if (availabilityError) {
      if (isMissingAvailabilityTable(availabilityError)) {
        console.warn('availability_slots is not available; using default booking hours')
      } else {
        console.error('❌ Supabase availability error:', availabilityError)
        return NextResponse.json({ error: availabilityError.message }, { status: 500 })
      }
    }

    const availableSlots = generateTimeSlots(
      occupiedTimes,
      availabilitySlots || []
    )

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

  function isMissingAvailabilityTable(error: { code?: string; message?: string }): boolean {
    return error.code === '42P01' ||
      error.code === 'PGRST205' ||
      error.message?.toLowerCase().includes('availability_slots') === true
  }
}

function generateTimeSlots(
  occupiedTimes: string[],
  availabilitySlots: Array<{
    start_time: string
    end_time: string
    is_available: boolean
    is_all_day: boolean
  }>
): string[] {
  const slots: string[] = []
  const startHour = 9
  const endHour = 19 // 19:00

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes of hour === startHour ? [30] : [0, 30]) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      const isWithinAvailability = availabilitySlots.length === 0
        ? true
        : availabilitySlots.some(slot => {
            const slotStart = slot.is_all_day ? '00:00' : slot.start_time
            const slotEnd = slot.is_all_day ? '23:59' : slot.end_time
            const isInSlot = timeStr >= slotStart && timeStr < slotEnd
            return slot.is_available ? isInSlot : !isInSlot
          })

      const isBlockedByUnavailableSlot = availabilitySlots.some(slot => {
        if (slot.is_available) return false
        const slotStart = slot.is_all_day ? '00:00' : slot.start_time
        const slotEnd = slot.is_all_day ? '23:59' : slot.end_time
        return timeStr >= slotStart && timeStr < slotEnd
      })

      if (!occupiedTimes.includes(timeStr) && isWithinAvailability && !isBlockedByUnavailableSlot) {
        slots.push(timeStr)
      }
    }
  }

  return slots
}
