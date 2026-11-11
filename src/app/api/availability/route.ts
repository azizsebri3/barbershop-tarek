import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/admin-session'
import { isPastDateKey, isValidDateKey } from '@/lib/booking-calendar'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, serviceKey, { auth: { autoRefreshToken: false } })
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    
    const supabase = getSupabaseClient()
    
    let query = supabase
      .from('availability_slots')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
    
    // Si des dates sont spécifiées, filtrer
    if (startDate && endDate) {
      query = query
        .gte('date', startDate)
        .lte('date', endDate)
    } else if (startDate) {
      query = query.gte('date', startDate)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des disponibilités' },
        { status: 500 }
      )
    }

    const uniqueByDate = new Map<string, Record<string, unknown>>()
    for (const slot of data || []) {
      if (!uniqueByDate.has(slot.date)) {
        uniqueByDate.set(slot.date, slot)
      }
    }

    return NextResponse.json(Array.from(uniqueByDate.values()), {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    })
  } catch (error) {
    console.error('GET availability error:', error)
    return NextResponse.json(
      { error: 'Une erreur serveur s\'est produite' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { date, start_time, end_time, is_all_day = false, is_available = true } = body

    if (typeof date !== 'string' || !isValidDateKey(date) || (!is_all_day && (!start_time || !end_time))) {
      return NextResponse.json(
        { error: 'Date and time range are required' },
        { status: 400 }
      )
    }
    if (isPastDateKey(date)) {
      return NextResponse.json(
        { error: 'Past availability cannot be changed' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseClient()
    
    const insertData = {
      date,
      start_time: is_all_day ? '00:00' : start_time,
      end_time: is_all_day ? '23:59' : end_time,
      is_all_day,
      is_available
    }

    const { data: existingSlots, error: existingSlotsError } = await supabase
      .from('availability_slots')
      .select('id, start_time, end_time, is_available, is_all_day')
      .eq('date', date)

    if (existingSlotsError) {
      throw existingSlotsError
    }

    const availabilityConflict = await findAvailabilityConflict(
      supabase,
      date,
      [insertData],
    )
    if (availabilityConflict) {
      return NextResponse.json({ error: availabilityConflict }, { status: 409 })
    }

    const existingSlot = existingSlots?.[0]
    const { data, error } = existingSlot
      ? await supabase
          .from('availability_slots')
          .update({ ...insertData, updated_at: new Date().toISOString() })
          .eq('id', existingSlot.id)
          .select()
      : await supabase
          .from('availability_slots')
          .insert(insertData)
          .select()

    if (!error && existingSlots && existingSlots.length > 1) {
      await supabase
        .from('availability_slots')
        .delete()
        .in('id', existingSlots.slice(1).map(slot => slot.id))
    }

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Unable to save availability' },
        { status: 500 }
      )
    }

    await removeBlockedSlotsOutsideAvailability(supabase, date, insertData)

    async function findAvailabilityConflict(
      supabase: SupabaseClient,
      date: string,
      slots: Array<{
        start_time: string
        end_time: string
        is_available: boolean
        is_all_day: boolean
      }>,
    ): Promise<string | null> {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('time, service')
        .eq('date', date)
        .in('status', ['confirmed', 'pending'])

      if (error) throw error

      const availableSlots = slots
        .filter(slot => slot.is_available)
        .map(slot => ({
          start: slot.is_all_day ? 0 : toMinutes(slot.start_time),
          end: slot.is_all_day ? 24 * 60 : toMinutes(slot.end_time),
        }))

      const typedBookings = (bookings || []) as Array<{ time: string; service: string }>
      const unavailableBookings = typedBookings.filter(booking => {
        const start = toMinutes(booking.time)
        const end = start + getServiceDuration(booking.service)
        return !availableSlots.some(slot => start >= slot.start && end <= slot.end)
      })

      if (unavailableBookings.length === 0) return null

      return `Cannot change availability: existing appointment(s) at ${unavailableBookings
        .map(booking => booking.time)
        .join(', ')}. Move or cancel them first.`
    }

    function toMinutes(time: string): number {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    function getServiceDuration(service: string): number {
      if (service === 'Barbe + Coupe') return 60
      return 30
    }

    async function removeBlockedSlotsOutsideAvailability(
      client: SupabaseClient,
      slotDate: string,
      slot: {
        start_time: string
        end_time: string
        is_available: boolean
        is_all_day: boolean
      },
    ) {
      const { data: blockedSlots, error: blockedSlotsError } = await client
        .from('blocked_time_slots')
        .select('id, start_time, end_time')
        .eq('date', slotDate)

      if (blockedSlotsError) {
        if (blockedSlotsError.code === '42P01' || blockedSlotsError.code === 'PGRST205') return
        throw blockedSlotsError
      }

      const availabilityStart = slot.is_available && (slot.is_all_day ? 0 : toMinutes(slot.start_time))
      const availabilityEnd = slot.is_available && (slot.is_all_day ? 24 * 60 : toMinutes(slot.end_time))
      const idsToDelete = (blockedSlots || [])
        .filter(blocked => {
          if (availabilityStart === false || availabilityEnd === false) return true
          return toMinutes(blocked.start_time) < availabilityStart ||
            toMinutes(blocked.end_time) > availabilityEnd
        })
        .map(blocked => blocked.id)

      if (idsToDelete.length > 0) {
        const { error } = await client.from('blocked_time_slots').delete().in('id', idsToDelete)
        if (error) throw error
      }
    }

    return NextResponse.json(
      {
        message: 'Créneau créé avec succès',
        slot: data?.[0],
      },
      { status: existingSlot ? 200 : 201 }
    )
  } catch (error) {
    console.error('POST availability error:', error)
    return NextResponse.json(
      { error: 'A server error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const date = url.searchParams.get('date')

    if (!id && !date) {
      return NextResponse.json(
        { error: 'ID or date is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    let availabilityDate = date

    if (id) {
      const { data: slot, error: slotError } = await supabase
        .from('availability_slots')
        .select('date')
        .eq('id', id)
        .maybeSingle()

      if (slotError) throw slotError
      if (!slot) {
        return NextResponse.json({ error: 'Availability slot not found' }, { status: 404 })
      }
      availabilityDate = slot.date
    }

    if (availabilityDate && isPastDateKey(availabilityDate)) {
      return NextResponse.json(
        { error: 'Past availability cannot be changed' },
        { status: 400 },
      )
    }
    
    let query = supabase.from('availability_slots').delete()
    
    if (id) {
      query = query.eq('id', id)
    } else if (date) {
      query = query.eq('date', date)
    }

    const { error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Unable to delete availability' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Créneau(x) supprimé(s) avec succès'
    })
  } catch (error) {
    console.error('DELETE availability error:', error)
    return NextResponse.json(
      { error: 'A server error occurred' },
      { status: 500 }
    )
  }
}