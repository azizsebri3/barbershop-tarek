import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/admin-session'
import { isPastDateKey, isValidDateKey } from '@/lib/booking-calendar'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function getServiceDuration(service: string): number {
  if (service === 'Barbe + Coupe') return 60
  return 30
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()

    const { data: currentSlot, error: currentSlotError } = await supabase
      .from('availability_slots')
      .select('date')
      .eq('id', id)
      .single()

    if (currentSlotError || !currentSlot) {
      return NextResponse.json({ error: 'Availability slot not found' }, { status: 404 })
    }
    if (
      isPastDateKey(currentSlot.date) ||
      typeof body.date !== 'string' ||
      !isValidDateKey(body.date) ||
      isPastDateKey(body.date)
    ) {
      return NextResponse.json(
        { error: 'Past availability cannot be changed' },
        { status: 400 },
      )
    }

    const { data: existingSlots, error: existingSlotsError } = await supabase
      .from('availability_slots')
      .select('id, start_time, end_time, is_available, is_all_day')
      .eq('date', body.date)
      .neq('id', id)

    if (existingSlotsError) throw existingSlotsError

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('time, service')
      .eq('date', body.date)
      .in('status', ['confirmed', 'pending'])

    if (bookingsError) throw bookingsError

    const availableSlots = [body]
      .filter(slot => slot.is_available)
      .map(slot => ({
        start: slot.is_all_day ? 0 : toMinutes(slot.start_time),
        end: slot.is_all_day ? 24 * 60 : toMinutes(slot.end_time),
      }))
    const unavailableBookings = (bookings || []).filter(booking => {
      const start = toMinutes(booking.time)
      const end = start + getServiceDuration(booking.service)
      return !availableSlots.some(slot => start >= slot.start && end <= slot.end)
    })

    if (unavailableBookings.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot change availability: existing appointment(s) at ${unavailableBookings.map(booking => booking.time).join(', ')}. Move or cancel them first.`,
        },
        { status: 409 },
      )
    }

    const { data, error } = await supabase
      .from('availability_slots')
      .update({
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        is_available: body.is_available,
        is_all_day: body.is_all_day,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Unable to update availability' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Availability slot not found' },
        { status: 404 }
      )
    }

    if (existingSlots && existingSlots.length > 0) {
      const { error: duplicateDeleteError } = await supabase
        .from('availability_slots')
        .delete()
        .in('id', existingSlots.map(slot => slot.id))

      if (duplicateDeleteError) {
        throw duplicateDeleteError
      }
    }

    const { data: blockedSlots, error: blockedSlotsError } = await supabase
      .from('blocked_time_slots')
      .select('id, start_time, end_time')
      .eq('date', body.date)

    if (blockedSlotsError && blockedSlotsError.code !== '42P01' && blockedSlotsError.code !== 'PGRST205') {
      throw blockedSlotsError
    }

    if (blockedSlots) {
      const availabilityStart = body.is_available
        ? (body.is_all_day ? 0 : toMinutes(body.start_time))
        : null
      const availabilityEnd = body.is_available
        ? (body.is_all_day ? 24 * 60 : toMinutes(body.end_time))
        : null
      const idsToDelete = blockedSlots
        .filter(blocked => availabilityStart === null ||
          toMinutes(blocked.start_time) < availabilityStart ||
          toMinutes(blocked.end_time) > availabilityEnd!)
        .map(blocked => blocked.id)

      if (idsToDelete.length > 0) {
        const { error } = await supabase
          .from('blocked_time_slots')
          .delete()
          .in('id', idsToDelete)
        if (error) throw error
      }
    }

    return NextResponse.json({ success: true, slot: data })
  } catch (error) {
    console.error('Erreur serveur:', error)
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
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const { data: currentSlot, error: currentSlotError } = await supabase
      .from('availability_slots')
      .select('date')
      .eq('id', id)
      .single()

    if (currentSlotError || !currentSlot) {
      return NextResponse.json({ error: 'Availability slot not found' }, { status: 404 })
    }
    if (isPastDateKey(currentSlot.date)) {
      return NextResponse.json(
        { error: 'Past availability cannot be changed' },
        { status: 400 },
      )
    }

    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Unable to delete availability' },
        { status: 500 }
      )
    }

    const { error: blockedSlotsError } = await supabase
      .from('blocked_time_slots')
      .delete()
      .eq('date', currentSlot.date)
    if (blockedSlotsError && blockedSlotsError.code !== '42P01' && blockedSlotsError.code !== 'PGRST205') {
      throw blockedSlotsError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}