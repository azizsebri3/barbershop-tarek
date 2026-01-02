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
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    
    const supabase = getSupabaseClient()
    
    let query = supabase
      .from('availability_slots')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
    
    // Si des dates sont spécifiées, filtrer
    if (startDate && endDate) {
      query = query
        .gte('date', startDate)
        .lte('date', endDate)
    } else if (startDate) {
      query = query.gte('date', startDate)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des disponibilités' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('GET availability error:', error)
    return NextResponse.json(
      { error: 'Une erreur serveur s\'est produite' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, start_time, end_time, is_all_day = false, is_available = true } = body

    if (!date || (!is_all_day && (!start_time || !end_time))) {
      return NextResponse.json(
        { error: 'Date et créneaux horaires requis' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    
    const insertData = {
      date,
      start_time: is_all_day ? '00:00' : start_time,
      end_time: is_all_day ? '23:59' : end_time,
      is_all_day,
      is_available
    }

    const { data, error } = await supabase
      .from('availability_slots')
      .insert(insertData)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création du créneau' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Créneau créé avec succès',
        slot: data?.[0],
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST availability error:', error)
    return NextResponse.json(
      { error: 'Une erreur serveur s\'est produite' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const date = url.searchParams.get('date')

    if (!id && !date) {
      return NextResponse.json(
        { error: 'ID ou date requis' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    
    let query = supabase.from('availability_slots').delete()
    
    if (id) {
      query = query.eq('id', id)
    } else if (date) {
      query = query.eq('date', date)
    }

    const { error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Créneau(x) supprimé(s) avec succès'
    })
  } catch (error) {
    console.error('DELETE availability error:', error)
    return NextResponse.json(
      { error: 'Une erreur serveur s\'est produite' },
      { status: 500 }
    )
  }
}