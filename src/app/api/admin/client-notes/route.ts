import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/admin-session'

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase()
    if (!email || email.length > 254) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    const { data, error } = await client().from('client_private_notes').select('note').eq('email', email).maybeSingle()
    if (error) throw error
    return NextResponse.json({ note: data?.note ?? '' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Unable to load private note:', error)
    return NextResponse.json({ error: 'Unable to load private note' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { email, note } = await request.json()
    if (typeof email !== 'string' || !email.trim() || email.length > 254 || typeof note !== 'string' || note.length > 4000) {
      return NextResponse.json({ error: 'Invalid note or email' }, { status: 400 })
    }
    const normalizedEmail = email.trim().toLowerCase()
    const trimmed = note.trim()
    const query = trimmed
      ? client().from('client_private_notes').upsert({ email: normalizedEmail, note: trimmed, updated_at: new Date().toISOString() })
      : client().from('client_private_notes').delete().eq('email', normalizedEmail)
    const { error } = await query
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unable to save private note:', error)
    return NextResponse.json({ error: 'Unable to save private note' }, { status: 500 })
  }
}
