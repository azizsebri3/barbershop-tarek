import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/admin-session'
import { appointmentStarted } from '@/lib/admin-today'

export async function PUT(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id, outcome } = await request.json()
    if (typeof id !== 'string' || !id || ![null, 'completed', 'no_show'].includes(outcome)) {
      return NextResponse.json({ error: 'Invalid visit status' }, { status: 400 })
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase environment variables')
    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: booking, error } = await supabase.from('bookings')
      .select('id,status,date,time').eq('id', id).maybeSingle()
    if (error) throw error
    if (!booking) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    if (booking.status !== 'confirmed' || !appointmentStarted(booking.date, booking.time, new Date())) {
      return NextResponse.json({ error: 'Only confirmed appointments that have started can have a visit status' }, { status: 409 })
    }
    const result = await supabase.from('bookings').update({ visit_outcome: outcome })
      .eq('id', id).eq('status', 'confirmed').eq('date', booking.date).eq('time', booking.time)
      .select('id').maybeSingle()
    if (result.error) throw result.error
    if (!result.data) return NextResponse.json({ error: 'Appointment changed; refresh and try again' }, { status: 409 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unable to update visit status:', error)
    return NextResponse.json({ error: 'Unable to update visit status' }, { status: 500 })
  }
}
