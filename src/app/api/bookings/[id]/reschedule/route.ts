import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBookingRescheduledEmail } from '@/lib/email-service'
import { sendAdminBookingPush } from '@/lib/admin-booking-push'
import { DEFAULT_BOOKING_HORIZON_MONTHS, normalizeBookingHorizonMonths } from '@/lib/booking-calendar'
import { bearerToken, verifyRescheduleToken } from '@/lib/reschedule-token'
import { durationForBooking, validateRescheduleTime } from '@/lib/reschedule-availability'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  return createClient(url, key, { auth: { autoRefreshToken: false } })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!await verifyRescheduleToken(bearerToken(request.headers.get('authorization')), id)) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 })
    }
    const { data: booking, error } = await getSupabaseClient()
      .from('bookings').select('id,name,date,time,service,status,duration_minutes').eq('id', id).maybeSingle()
    if (error) throw error
    if (!booking) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    if (booking.status === 'cancelled') return NextResponse.json({ error: 'Appointment is cancelled' }, { status: 409 })
    return NextResponse.json({
      booking: {
        id: booking.id, name: booking.name, date: booking.date, time: booking.time,
        service: booking.service, duration_minutes: durationForBooking(booking.duration_minutes, booking.service),
      },
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error loading reschedule:', error)
    return NextResponse.json({ error: 'Unable to load appointment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!await verifyRescheduleToken(bearerToken(request.headers.get('authorization')), id)) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 })
    }
    const { newDate, newTime, lang } = await request.json()
    if (typeof newDate !== 'string' || typeof newTime !== 'string' ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(newTime)) {
      return NextResponse.json({ error: 'Invalid date or time' }, { status: 400 })
    }
    const supabase = getSupabaseClient()
    const { data: booking, error: bookingError } = await supabase
      .from('bookings').select('*').eq('id', id).maybeSingle()
    if (bookingError) throw bookingError
    if (!booking) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    if (booking.status === 'cancelled') return NextResponse.json({ error: 'Appointment is cancelled' }, { status: 409 })
    if (booking.date === newDate && booking.time.slice(0, 5) === newTime) {
      return NextResponse.json({ error: 'Choose a different date or time' }, { status: 400 })
    }

    const [horizon, hours, availability, blocked, bookings] = await Promise.all([
      supabase.from('settings').select('value').eq('key', 'booking_horizon_months').maybeSingle(),
      supabase.from('settings').select('value').eq('key', 'opening_hours').maybeSingle(),
      supabase.from('availability_slots').select('start_time,end_time,is_available,is_all_day').eq('date', newDate),
      supabase.from('blocked_time_slots').select('start_time,end_time').eq('date', newDate),
      supabase.from('bookings').select('time,service,duration_minutes,email,status').eq('date', newDate)
        .neq('id', id).in('status', ['confirmed', 'pending']),
    ])
    for (const result of [horizon, hours, availability, blocked, bookings]) {
      if (result.error) {
        console.error('Error checking reschedule availability:', result.error)
        return NextResponse.json({ error: 'Unable to verify availability' }, { status: 500 })
      }
    }
    const duration = durationForBooking(booking.duration_minutes, booking.service)
    const reason = validateRescheduleTime({
      date: newDate, time: newTime, duration,
      horizon: normalizeBookingHorizonMonths(horizon.data?.value ?? DEFAULT_BOOKING_HORIZON_MONTHS),
      hours: hours.data?.value || null,
      availability: availability.data || [],
      blocked: blocked.data || [],
      bookings: bookings.data || [],
      email: booking.email,
    })
    if (reason) return NextResponse.json({ error: reason }, { status: 409 })
    const updateData: { date: string; time: string; updated_at: string; visit_outcome?: null } = {
      date: newDate, time: newTime, updated_at: new Date().toISOString(),
    }
    if (booking.visit_outcome) updateData.visit_outcome = null
    const { data: updated, error: updateError } = await supabase.from('bookings')
      .update(updateData)
      .eq('id', id).eq('date', booking.date).eq('time', booking.time).eq('status', booking.status)
      .select('id').maybeSingle()
    if (updateError) throw updateError
    if (!updated) return NextResponse.json({ error: 'Appointment changed; reload and try again' }, { status: 409 })
    await sendAdminBookingPush(supabase, {
      kind: 'rescheduled', name: booking.name, service: booking.service,
      date: newDate, time: newTime, oldDate: booking.date, oldTime: booking.time,
    })
    const language = lang === 'fr' || lang === 'en' || lang === 'nl'
      ? lang : booking.language === 'en' || booking.language === 'nl' ? booking.language : 'fr'
    const emailResult = await sendBookingRescheduledEmail({
      id: booking.id, name: booking.name, email: booking.email, phone: booking.phone,
      date: newDate, time: newTime, service: booking.service, message: booking.message,
      oldDate: booking.date, oldTime: booking.time, duration_minutes: duration, language,
    }, language)
    if (!emailResult.success) {
      console.error('Rescheduled appointment email failed:', emailResult.error)
      return NextResponse.json({ success: true, emailSent: false })
    }
    return NextResponse.json({ success: true, emailSent: true })
  } catch (error) {
    console.error('Error rescheduling appointment:', error)
    return NextResponse.json({ error: 'Unable to reschedule appointment' }, { status: 500 })
  }
}
