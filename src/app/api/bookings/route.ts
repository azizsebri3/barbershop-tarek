import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!url || !serviceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false } })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, date, time, service, message } = body

    // Validation
    if (!name || !email || !phone || !date || !time || !service) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Insert booking into Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        name,
        email,
        phone,
        date,
        time,
        service,
        message,
        status: 'pending',
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la réservation' },
        { status: 500 }
      )
    }

    // Send confirmation email (optional - you can use SendGrid, Resend, or nodemailer)
    // await sendConfirmationEmail(email, name, date, time)

    return NextResponse.json(
      {
        message: 'Réservation créée avec succès',
        booking: data?.[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: 'Une erreur serveur s\'est produite' },
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des réservations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ bookings: data }, { status: 200 })
  } catch (error) {
    console.error('GET bookings error:', error)
    return NextResponse.json(
      { error: 'Une erreur serveur s\'est produite' },
      { status: 500 }
    )
  }
}
