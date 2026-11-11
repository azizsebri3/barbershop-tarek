import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin-session'

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminToken(request.cookies.get('admin_token')?.value)
    if (!session) return NextResponse.json({ authenticated: false })
    return NextResponse.json({
      authenticated: true,
      user: { id: session.userId, username: session.username, email: session.email, role: session.role },
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Admin session verification failed:', error)
    return NextResponse.json({ error: 'Admin session verification unavailable' }, { status: 500 })
  }
}
