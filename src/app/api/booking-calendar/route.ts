import { NextRequest, NextResponse } from 'next/server'
import { createBookingCalendar } from '@/lib/booking-ics'

export function GET(request: NextRequest) {
  try {
    const calendar = createBookingCalendar(request.nextUrl.searchParams)
    return new NextResponse(calendar, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rendez-vous.ics"',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Invalid calendar download request:', error)
    return NextResponse.json({ error: 'Invalid calendar details' }, { status: 400 })
  }
}
