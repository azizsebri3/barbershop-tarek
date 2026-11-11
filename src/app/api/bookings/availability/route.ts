import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { openingHours as defaultOpeningHours } from '@/lib/data'
import { DEFAULT_BOOKING_HORIZON_MONTHS, normalizeBookingHorizonMonths, weekdayKeyForDate } from '@/lib/booking-calendar'
import { verifyAdminToken } from '@/lib/admin-session'
import { bearerToken, verifyRescheduleToken } from '@/lib/reschedule-token'
import { durationForBooking, overlapping, validateRescheduleTime } from '@/lib/reschedule-availability'

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
    const requestedDuration = Number(searchParams.get('duration') || '30')
    let serviceDuration = Number.isFinite(requestedDuration) && requestedDuration > 0
      ? requestedDuration
      : 30

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }

    const authorizedReschedule = excludeBookingId
      ? await verifyRescheduleToken(bearerToken(request.headers.get('authorization')), excludeBookingId)
      : false
    if (excludeBookingId && !authorizedReschedule &&
      !await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseClient()
    let reschedulingBooking: { email: string; duration_minutes: number | null; service: string; status: string } | null = null
    let bookingHorizon = DEFAULT_BOOKING_HORIZON_MONTHS
    if (authorizedReschedule && excludeBookingId) {
      const [current, horizon] = await Promise.all([
        supabase.from('bookings').select('email,duration_minutes,service,status').eq('id', excludeBookingId).maybeSingle(),
        supabase.from('settings').select('value').eq('key', 'booking_horizon_months').maybeSingle(),
      ])
      if (current.error || horizon.error) {
        console.error('Unable to verify reschedule availability:', current.error || horizon.error)
        return NextResponse.json({ error: 'Unable to verify availability' }, { status: 500 })
      }
      if (!current.data || current.data.status === 'cancelled') {
        return NextResponse.json({ error: 'Appointment unavailable' }, { status: 409 })
      }
      reschedulingBooking = current.data
      serviceDuration = durationForBooking(current.data.duration_minutes, current.data.service)
      bookingHorizon = normalizeBookingHorizonMonths(horizon.data?.value ?? DEFAULT_BOOKING_HORIZON_MONTHS)
    }

    // Get all confirmed and pending bookings for this date
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, time, service, duration_minutes, email, status')
      .eq('date', date)
      .in('status', ['confirmed', 'pending'])

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter out the current booking if provided (for rescheduling)
    const occupiedTimes = bookings
      ?.filter(b => b.id !== excludeBookingId)
      .flatMap(b => {
        const duration = b.duration_minutes || getServiceDuration(b.service)
        return createTimeRange(b.time, duration)
      }) || []

    const { data: blockedSlots, error: blockedSlotsError } = await supabase
      .from('blocked_time_slots')
      .select('start_time, end_time')
      .eq('date', date)

    if (blockedSlotsError) {
      console.error('❌ Supabase blocked slots error:', blockedSlotsError)
      return NextResponse.json({ error: blockedSlotsError.message }, { status: 500 })
    }
    const manuallyOccupiedTimes = (blockedSlots || []).flatMap(slot =>
      createTimeRange(slot.start_time, toMinutes(slot.end_time) - toMinutes(slot.start_time))
    )
    const allOccupiedTimes = Array.from(new Set([...occupiedTimes, ...manuallyOccupiedTimes]))

    // Apply the availability configured by the admin for this date.
    // If no override exists, preserve the normal 09:30-18:30 schedule.
    const { data: availabilitySlots, error: availabilityError } = await supabase
      .from('availability_slots')
      .select('start_time, end_time, is_available, is_all_day')
      .eq('date', date)

    if (availabilityError) {
      console.error('❌ Supabase availability error:', availabilityError)
      return NextResponse.json({ error: availabilityError.message }, { status: 500 })
    }

    const { data: hoursSetting, error: hoursError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'opening_hours')
      .maybeSingle()

    if (hoursError) {
      console.error('❌ Supabase opening hours error:', hoursError)
      return NextResponse.json({ error: 'Unable to verify opening hours' }, { status: 500 })
    }

    const openingHours = hoursSetting?.value || defaultOpeningHours
    const weekday = weekdayKeyForDate(date)
    if (!weekday) {
      return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 })
    }

    const allSlots = generateTimeSlots(
      availabilitySlots || [],
      serviceDuration,
      openingHours[weekday],
    )
    const remainingBookings = (bookings || []).filter(booking => booking.id !== excludeBookingId)
    const availableSlots = allSlots.filter(time => {
      if (reschedulingBooking) {
        return validateRescheduleTime({
          date, time, duration: serviceDuration, horizon: bookingHorizon,
          availability: availabilitySlots || [], blocked: blockedSlots || [],
          bookings: remainingBookings, email: reschedulingBooking.email, hours: openingHours,
        }) === null
      }
      const start = toMinutes(time)
      const end = start + serviceDuration
      return !remainingBookings.some(booking =>
        overlapping(start, end, toMinutes(booking.time),
          toMinutes(booking.time) + (booking.duration_minutes || getServiceDuration(booking.service)))) &&
        !(blockedSlots || []).some(slot => overlapping(start, end, toMinutes(slot.start_time), toMinutes(slot.end_time)))
    })

    return NextResponse.json(
      { date, availableSlots, allSlots, occupiedTimes: allOccupiedTimes },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('❌ Error getting availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateTimeSlots(
  availabilitySlots: Array<{
    start_time: string
    end_time: string
    is_available: boolean
    is_all_day: boolean
  }>,
  serviceDuration: number,
  weeklyHours: { open: string; close: string; closed: boolean },
): string[] {
  const slots: string[] = []
  const availableRanges = availabilitySlots
    .filter(slot => slot.is_available)
    .map(slot => ({
      start: slot.is_all_day ? 0 : toMinutes(slot.start_time),
      end: slot.is_all_day ? 24 * 60 : toMinutes(slot.end_time),
    }))
  if (availabilitySlots.length === 0 && weeklyHours.closed) return slots

  const startMinutes = availabilitySlots.length > 0
    ? Math.min(...availableRanges.map(range => range.start))
    : toMinutes(weeklyHours.open)
  const endMinutes = availabilitySlots.length > 0
    ? Math.max(...availableRanges.map(range => range.end))
    : toMinutes(weeklyHours.close)

  for (let totalMinutes = startMinutes; totalMinutes < endMinutes; totalMinutes += 15) {
    const hour = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      const slotEndMinutes = totalMinutes + serviceDuration
      const isWithinAvailability = availabilitySlots.length === 0
        ? totalMinutes >= startMinutes && slotEndMinutes <= endMinutes
        : availabilitySlots.some(slot => {
            if (!slot.is_available) return false
            const slotStart = slot.is_all_day ? 0 : toMinutes(slot.start_time)
            const slotEnd = slot.is_all_day ? 24 * 60 : toMinutes(slot.end_time)
            return totalMinutes >= slotStart && slotEndMinutes <= slotEnd
          })

      const overlapsUnavailableSlot = availabilitySlots.some(slot => {
        if (slot.is_available) return false
        const slotStart = slot.is_all_day ? 0 : toMinutes(slot.start_time)
        const slotEnd = slot.is_all_day ? 24 * 60 : toMinutes(slot.end_time)
        return totalMinutes < slotEnd && slotEndMinutes > slotStart
      })

      if (isWithinAvailability && !overlapsUnavailableSlot) {
        slots.push(timeStr)
      }
  }

  return slots
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function createTimeRange(time: string, duration: number): string[] {
  const start = toMinutes(time)
  return Array.from({ length: Math.ceil(duration / 15) }, (_, index) => {
    const value = start + index * 15
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
  })
}

function getServiceDuration(service: string): number {
  if (service === 'Barbe + Coupe') return 60
  return 30
}
