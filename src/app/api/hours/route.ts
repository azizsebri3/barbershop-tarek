import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/admin-session'
import {
  MAX_BOOKING_HORIZON_MONTHS,
  MIN_BOOKING_HORIZON_MONTHS,
  normalizeBookingHorizonMonths,
} from '@/lib/booking-calendar'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, serviceKey, { auth: { autoRefreshToken: false } })
}

// GET /api/hours - Récupérer les horaires d'ouverture
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const [{ data: hoursSetting, error: hoursError }, { data: horizonSetting, error: horizonError }] =
      await Promise.all([
        supabase.from('settings').select('value').eq('key', 'opening_hours').maybeSingle(),
        supabase.from('settings').select('value').eq('key', 'booking_horizon_months').maybeSingle(),
      ])

    if (hoursError) {
      console.error('❌ Erreur DB:', hoursError)
      return NextResponse.json({ error: hoursError.message }, { status: 500 })
    }
    if (horizonError) {
      console.error('❌ Erreur DB:', horizonError)
      return NextResponse.json({ error: horizonError.message }, { status: 500 })
    }

    const hours = hoursSetting?.value || {
      monday: { open: '09:30', close: '19:00', closed: false },
      tuesday: { open: '09:30', close: '19:00', closed: false },
      wednesday: { open: '09:30', close: '19:00', closed: false },
      thursday: { open: '09:30', close: '19:00', closed: false },
      friday: { open: '09:30', close: '19:00', closed: false },
      saturday: { open: '09:30', close: '19:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    }

    return NextResponse.json({
      hours,
      bookingHorizonMonths: normalizeBookingHorizonMonths(horizonSetting?.value),
    })
  } catch (error) {
    console.error('❌ Erreur lors du chargement des horaires:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/hours - Sauvegarder les horaires d'ouverture
export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { hours, bookingHorizonMonths } = body

    if (!hours) {
      return NextResponse.json(
        { error: 'Données horaires manquantes' },
        { status: 400 }
      )
    }

    if (
      bookingHorizonMonths !== undefined &&
      (!Number.isInteger(bookingHorizonMonths) ||
        bookingHorizonMonths < MIN_BOOKING_HORIZON_MONTHS ||
        bookingHorizonMonths > MAX_BOOKING_HORIZON_MONTHS)
    ) {
      return NextResponse.json(
        { error: `Booking window must be between ${MIN_BOOKING_HORIZON_MONTHS} and ${MAX_BOOKING_HORIZON_MONTHS} months` },
        { status: 400 },
      )
    }

    const supabase = getSupabaseClient()
    const settings = [{
        key: 'opening_hours',
        value: hours,
        updated_at: new Date().toISOString(),
      }]
    if (bookingHorizonMonths !== undefined) {
      settings.push({
        key: 'booking_horizon_months',
        value: bookingHorizonMonths,
        updated_at: new Date().toISOString(),
      })
    }

    const { error } = await supabase.from('settings').upsert(settings, { onConflict: 'key' })

    if (error) {
      console.error('❌ Erreur DB:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}