import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBookingEmails } from '@/lib/email-service'
import { sendAdminBookingPush } from '@/lib/admin-booking-push'
import { verifyAdminToken } from '@/lib/admin-session'
import { openingHours as defaultOpeningHours } from '@/lib/data'
import {
  DEFAULT_BOOKING_HORIZON_MONTHS,
  isWithinBookingHorizon,
  normalizeBookingHorizonMonths,
  weekdayKeyForDate,
} from '@/lib/booking-calendar'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, serviceKey, { auth: { autoRefreshToken: false } })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, date, time, service, message, language = 'fr' } = body
    const bookingLanguage = ['fr', 'en', 'nl'].includes(language) ? language : 'fr'
    const isAdminBooking = await verifyAdminToken(request.cookies.get('admin_token')?.value)

    // Validation
    if (!name || !email || !phone || !date || !time || !service) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    if (typeof date !== 'string') {
      return NextResponse.json({ error: 'Invalid booking date' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { data: horizonSetting, error: horizonError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'booking_horizon_months')
      .maybeSingle()

    if (horizonError) {
      console.error('Error fetching booking window:', horizonError)
      return NextResponse.json(
        { error: 'Unable to verify booking window' },
        { status: 500 },
      )
    }

    const bookingHorizonMonths = normalizeBookingHorizonMonths(
      horizonSetting?.value ?? DEFAULT_BOOKING_HORIZON_MONTHS,
    )
    if (!isAdminBooking && !isWithinBookingHorizon(date, bookingHorizonMonths)) {
      return NextResponse.json(
        { error: `Clients can book from today up to ${bookingHorizonMonths} months in advance` },
        { status: 400 },
      )
    }

    const { data: generalSettings, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'general')
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Error fetching booking settings:', settingsError)
      return NextResponse.json(
        { error: 'Erreur lors du chargement des paramètres de réservation' },
        { status: 500 }
      )
    }

    const autoConfirmBookings = generalSettings?.value?.autoConfirmBookings === true

    // Vérifier la disponibilité en tenant compte de la durée du service
    const services = [
      { name: 'Coupe Homme', duration: 30 },
      { name: 'Barbe + Coupe', duration: 60 },
      { name: 'Barbe', duration: 30 }
    ]
    
    const selectedService = services.find(s => s.name === service)
    const serviceDuration = selectedService?.duration || 30
    
    // Calculer les créneaux que cette réservation occuperait
    const [startHour, startMin] = time.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = startMinutes + serviceDuration

    const { data: availabilitySlots, error: availabilityError } = await supabase
      .from('availability_slots')
      .select('start_time, end_time, is_available, is_all_day')
      .eq('date', date)

    if (availabilityError) {
      if (isMissingAvailabilityTable(availabilityError)) {
        console.warn('availability_slots is not available; using default booking hours')
      } else if (!isAdminBooking) {
        console.error('Error fetching configured availability:', availabilityError)
        return NextResponse.json(
          { error: 'Unable to verify availability' },
          { status: 500 }
        )
      }
    }

    if (availabilitySlots && availabilitySlots.length > 0) {
      const isWithinAvailableSlot = availabilitySlots.some(slot => {
        if (!slot.is_available) return false
        const slotStart = slot.is_all_day ? 0 : toMinutes(slot.start_time)
        const slotEnd = slot.is_all_day ? 24 * 60 : toMinutes(slot.end_time)
        return startMinutes >= slotStart && endMinutes <= slotEnd
      })
      const overlapsUnavailableSlot = availabilitySlots.some(slot => {
        if (slot.is_available) return false
        const slotStart = slot.is_all_day ? 0 : toMinutes(slot.start_time)
        const slotEnd = slot.is_all_day ? 24 * 60 : toMinutes(slot.end_time)
        return startMinutes < slotEnd && endMinutes > slotStart
      })

      if (!isWithinAvailableSlot || overlapsUnavailableSlot) {
        return NextResponse.json(
          { error: 'This time is not available for booking' },
          { status: 409 }
        )
      }
    } else {
      const { data: hoursSetting, error: hoursError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'opening_hours')
        .maybeSingle()

      if (hoursError) {
        console.error('Error fetching opening hours:', hoursError)
        return NextResponse.json(
          { error: 'Unable to verify opening hours' },
          { status: 500 },
        )
      }

      const weekday = weekdayKeyForDate(date)
      if (!weekday) {
        return NextResponse.json({ error: 'Invalid booking date' }, { status: 400 })
      }

      const weeklyHours = (hoursSetting?.value || defaultOpeningHours)[weekday]
      const openingMinutes = toMinutes(weeklyHours.open)
      const closingMinutes = toMinutes(weeklyHours.close)
      if (
        weeklyHours.closed ||
        startMinutes < openingMinutes ||
        endMinutes > closingMinutes
      ) {
        return NextResponse.json(
          { error: 'This time is outside the opening hours' },
          { status: 409 },
        )
      }
    }

    const { data: blockedSlots, error: blockedSlotsError } = await supabase
      .from('blocked_time_slots')
      .select('start_time, end_time')
      .eq('date', date)
    if (blockedSlotsError && blockedSlotsError.code !== '42P01' && blockedSlotsError.code !== 'PGRST205') {
      return NextResponse.json({ error: 'Unable to verify blocked times' }, { status: 500 })
    }
    if ((blockedSlots || []).some(slot => {
      const blockedStart = toMinutes(slot.start_time)
      const blockedEnd = toMinutes(slot.end_time)
      return startMinutes < blockedEnd && endMinutes > blockedStart
    })) {
      return NextResponse.json({ error: 'This time slot has been blocked by the barbershop.' }, { status: 409 })
    }
    
    // Récupérer les réservations existantes pour cette date
    const { data: existingBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('time, service, status')
      .eq('date', date)
      .in('status', ['confirmed', 'pending'])
    
    if (fetchError) {
      console.error('Error fetching existing bookings:', fetchError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des disponibilités' },
        { status: 500 }
      )
    }

    function toMinutes(time: string): number {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    function isMissingAvailabilityTable(error: { code?: string; message?: string }): boolean {
      return error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message?.toLowerCase().includes('availability_slots') === true
    }
    
    // Vérifier les conflits
    for (const booking of existingBookings || []) {
      // Ne vérifier les conflits qu'avec les réservations confirmées
      if (booking.status !== 'confirmed') continue
      
      const existingService = services.find(s => s.name === booking.service)
      const existingDuration = existingService?.duration || 30
      
      const [existingHour, existingMin] = booking.time.split(':').map(Number)
      const existingStartMinutes = existingHour * 60 + existingMin
      const existingEndMinutes = existingStartMinutes + existingDuration
      
      // Vérifier si les créneaux se chevauchent
      if (startMinutes < existingEndMinutes && endMinutes > existingStartMinutes) {
        return NextResponse.json(
          { error: 'This time slot is not available. Please choose another time.' },
          { status: 409 }
        )
      }
    }

    // ✨ Vérifier que le client ne prend pas 2 RDV rapidement (minimum 1h après le précédent)
    const { data: clientBookings, error: clientError } = await supabase
      .from('bookings')
      .select('date, time, service, status')
      .eq('email', email.toLowerCase())
      .eq('status', 'confirmed')

    if (clientError) {
      console.error('Error checking client bookings:', clientError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des réservations client' },
        { status: 500 }
      )
    }

    // Vérifier chaque réservation confirmée du client
    for (const clientBooking of clientBookings || []) {
      // Ignorer les réservations passées
      const bookingDateTime = new Date(`${clientBooking.date}T${clientBooking.time}`)
      if (bookingDateTime < new Date()) continue

      const clientService = services.find(s => s.name === clientBooking.service)
      const clientDuration = clientService?.duration || 30

      const [clientHour, clientMin] = clientBooking.time.split(':').map(Number)
      const clientStartMinutes = clientHour * 60 + clientMin
      const clientEndMinutes = clientStartMinutes + clientDuration

      // Calcul de la date du nouveau RDV
      const newBookingDate = new Date(date)
      const clientBookingDate = new Date(clientBooking.date)

      // Si c'est le même jour, vérifier la proximité en minutes
      if (newBookingDate.toDateString() === clientBookingDate.toDateString()) {
        // Vérifier si nouveau RDV est pendant ou moins de 60 min après le RDV existant
        const minGapMinutes = 60
        if (startMinutes >= clientStartMinutes - minGapMinutes && startMinutes < clientEndMinutes + minGapMinutes) {
          const earliestNextTime = new Date(0, 0, 0, clientHour, clientMin + clientDuration + minGapMinutes)
          
          return NextResponse.json(
            { 
              error: `Vous avez déjà un RDV ce jour. Vous pouvez reprendre un RDV à partir de ${earliestNextTime.getHours().toString().padStart(2, '0')}:${earliestNextTime.getMinutes().toString().padStart(2, '0')}.` 
            },
            { status: 409 }
          )
        }
      }
    }

    // Insert booking into Supabase
    const bookingRecord = {
      name,
      email,
      phone,
      date,
      time,
      duration_minutes: serviceDuration,
      service,
      message,
      language: bookingLanguage,
      status: autoConfirmBookings ? 'confirmed' : 'pending',
    }

    let { data, error } = await supabase
      .from('bookings')
      .insert(bookingRecord)
      .select()

    // Keep bookings working until the existing Supabase database gets the new column.
    if (error && (error.code === '42703' || error.code === 'PGRST204') && error.message.toLowerCase().includes('language')) {
      const { language: _language, ...legacyBookingRecord } = bookingRecord
      const retry = await supabase
        .from('bookings')
        .insert(legacyBookingRecord)
        .select()

      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la réservation' },
        { status: 500 }
      )
    }

    // Envoyer une notification push aux admins
    await sendAdminBookingPush(supabase, { kind: 'created', name, service, date, time })

    // Envoyer les emails de confirmation
    await sendBookingEmails({ 
      id: data?.[0]?.id,
      name, 
      email, 
      phone, 
      date, 
      time, 
      service, 
      message 
      ,language: bookingLanguage,
      status: autoConfirmBookings ? 'confirmed' : 'pending',
      duration_minutes: serviceDuration,
    })

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
      { error: 'A server error occurred' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')

    if (!date && !await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const supabase = getSupabaseClient()
    
    // Si une date est spécifiée, retourner seulement les réservations de ce jour
    if (date) {
      const { data, error } = await supabase
        .from('bookings')
        .select('date, time, service, status')
        .eq('date', date)
        .in('status', ['confirmed', 'pending'])

      if (error) {
        return NextResponse.json(
          { error: 'Unable to retrieve time slots' },
          { status: 500 }
        )
      }

      return NextResponse.json(data || [], { status: 200 })
    }

    // Sinon, retourner toutes les réservations (pour l'admin)
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
      { error: 'A server error occurred' },
      { status: 500 }
    )
  }
}
