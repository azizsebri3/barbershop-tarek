import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    // Check if Supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured - storing booking locally (demo mode)')
      // Simulate successful booking for demo purposes
      const mockBooking = {
        id: `demo-${Date.now()}`,
        name,
        email,
        phone,
        date,
        time,
        service,
        message,
        status: 'pending',
        created_at: new Date().toISOString()
      }

      console.log('Demo booking created:', mockBooking)

      return NextResponse.json({
        message: 'Réservation créée avec succès (mode démo)',
        booking: mockBooking
      })
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

export async function GET(request: NextRequest) {
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
