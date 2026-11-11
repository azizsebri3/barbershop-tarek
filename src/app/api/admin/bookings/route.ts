import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/admin-session'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase service role is not configured')
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseClient()
    const headers = { 'Cache-Control': 'no-store, max-age=0' }

    if (new URL(request.url).searchParams.get('count') === 'pending') {
      const { count, error } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
      if (error) throw error
      return NextResponse.json({ pending: count ?? 0 }, { headers })
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error

    return NextResponse.json({ bookings: data || [] }, { headers })
  } catch (error) {
    console.error('GET admin bookings error:', error)
    return NextResponse.json({ error: 'A server error occurred' }, { status: 500 })
  }
}
