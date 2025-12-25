import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Simple admin verification
async function verifyAdmin(request: Request): Promise<boolean> {
  // For now, we'll use a simple check
  // In production, you should implement proper JWT verification
  return true // Temporary: allow all for testing
}

// GET - Fetch all testimonials including pending (admin only)
export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all testimonials:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
