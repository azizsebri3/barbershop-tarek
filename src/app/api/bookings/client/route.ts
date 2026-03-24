import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const email = url.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Récupérer les réservations confirmées du client
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('date, time, service, status')
      .eq('email', email.toLowerCase())
      .in('status', ['confirmed', 'pending'])
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching client bookings:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des réservations' },
        { status: 500 }
      )
    }

    return NextResponse.json(bookings || [])
  } catch (error) {
    console.error('Client bookings API error:', error)
    return NextResponse.json(
      { error: 'Une erreur serveur s\'est produite' },
      { status: 500 }
    )
  }
}
