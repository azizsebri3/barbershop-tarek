import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/admin-session'
import { openingHours as defaultOpeningHours } from '@/lib/data'
import { isPastDateKey, isValidDateKey, weekdayKeyForDate } from '@/lib/booking-calendar'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase environment variables')
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false } })
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

export async function GET(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(request.url)
    const supabase = getSupabaseClient()
    let query = supabase.from('blocked_time_slots').select('*').order('date').order('start_time')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [], { headers: { 'Cache-Control': 'no-store, max-age=0' } })
  } catch (error) {
    console.error('GET blocked slots error:', error)
    return NextResponse.json({ error: 'A server error occurred' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const slots = Array.isArray(body.slots)
      ? body.slots
      : [{ date: body.date, start_time: body.start_time, end_time: body.end_time, reason: body.reason }]
    const unblockIds = Array.isArray(body.unblockIds) ? body.unblockIds.filter((id: unknown): id is string => typeof id === 'string') : []

    if ((slots.length === 0 && unblockIds.length === 0) || slots.some((slot: { date?: string; start_time?: string; end_time?: string }) =>
      typeof slot.date !== 'string' ||
      !isValidDateKey(slot.date) ||
      isPastDateKey(slot.date) ||
      !slot.start_time ||
      !slot.end_time ||
      toMinutes(slot.end_time) <= toMinutes(slot.start_time)
    )) {
      return NextResponse.json({ error: 'Invalid blocked time slot' }, { status: 400 })
    }
    const supabase = getSupabaseClient()
    const services: Record<string, number> = { 'Barbe + Coupe': 60 }
    if (unblockIds.length > 0) {
      const { data: existingBlocks, error: existingBlocksError } = await supabase
        .from('blocked_time_slots')
        .select('id, date')
        .in('id', unblockIds)

      if (existingBlocksError) {
        return NextResponse.json({ error: existingBlocksError.message }, { status: 500 })
      }
      if (existingBlocks?.some(slot => isPastDateKey(slot.date))) {
        return NextResponse.json({ error: 'Past blocked time slots cannot be changed.' }, { status: 400 })
      }
    }

    for (const slot of slots) {
      const { data: availabilitySlots, error: availabilityError } = await supabase
        .from('availability_slots')
        .select('start_time, end_time, is_available, is_all_day')
        .eq('date', slot.date)

      if (availabilityError) {
        if (availabilityError.code === '42P01' || availabilityError.code === 'PGRST205') {
          console.warn('availability_slots is not available; checking weekly opening hours')
        } else {
          return NextResponse.json({ error: availabilityError.message }, { status: 500 })
        }
      }

      const slotStart = toMinutes(slot.start_time)
      const slotEnd = toMinutes(slot.end_time)
      let isWithinAvailability: boolean
      if (availabilitySlots && availabilitySlots.length > 0) {
        isWithinAvailability = availabilitySlots
          .filter(availability => availability.is_available)
          .some(availability => {
            const availabilityStart = availability.is_all_day ? 0 : toMinutes(availability.start_time)
            const availabilityEnd = availability.is_all_day ? 24 * 60 : toMinutes(availability.end_time)
            return slotStart >= availabilityStart && slotEnd <= availabilityEnd
          })
      } else {
        const { data: hoursSetting, error: hoursError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'opening_hours')
          .maybeSingle()
        if (hoursError) return NextResponse.json({ error: hoursError.message }, { status: 500 })

        const weekday = weekdayKeyForDate(slot.date)
        if (!weekday) return NextResponse.json({ error: 'Invalid blocked time slot date' }, { status: 400 })
        const hours = (hoursSetting?.value || defaultOpeningHours)[weekday]
        isWithinAvailability = !hours.closed &&
          slotStart >= toMinutes(hours.open) &&
          slotEnd <= toMinutes(hours.close)
      }

      if (!isWithinAvailability) {
        return NextResponse.json(
          { error: 'You can only block time within the configured availability.' },
          { status: 409 },
        )
      }

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('time, service, duration_minutes')
        .eq('date', slot.date)
        .in('status', ['confirmed', 'pending'])
      if (bookingsError) return NextResponse.json({ error: bookingsError.message }, { status: 500 })
      const conflict = (bookings || []).some(booking => {
        const bookingStart = toMinutes(booking.time)
        const bookingEnd = bookingStart + (booking.duration_minutes || services[booking.service] || 30)
        return bookingStart < slotEnd && bookingEnd > slotStart
      })
      if (conflict) {
        return NextResponse.json({ error: 'Cannot block a time slot that already has an appointment.' }, { status: 409 })
      }
    }
    if (unblockIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('blocked_time_slots')
        .delete()
        .in('id', unblockIds)
      if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    if (slots.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    const { data, error } = await supabase
      .from('blocked_time_slots')
      .insert(slots.map((slot: { date: string; start_time: string; end_time: string; reason?: string }) => ({
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        reason: slot.reason || null,
      })))
      .select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST blocked slot error:', error)
    return NextResponse.json({ error: 'A server error occurred' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    const supabase = getSupabaseClient()
    const { data: existingBlock, error: existingBlockError } = await supabase
      .from('blocked_time_slots')
      .select('date')
      .eq('id', id)
      .maybeSingle()
    if (existingBlockError) return NextResponse.json({ error: existingBlockError.message }, { status: 500 })
    if (!existingBlock) return NextResponse.json({ error: 'Blocked time slot not found' }, { status: 404 })
    if (isPastDateKey(existingBlock.date)) {
      return NextResponse.json({ error: 'Past blocked time slots cannot be changed.' }, { status: 400 })
    }
    const { error } = await supabase.from('blocked_time_slots').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE blocked slot error:', error)
    return NextResponse.json({ error: 'A server error occurred' }, { status: 500 })
  }
}
