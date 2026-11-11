'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Calendar from 'react-calendar'
import { addMonths, format, isToday } from 'date-fns'
import { motion } from 'framer-motion'
import { useOpeningHours } from '@/lib/useOpeningHoursCached'
import { weekdayKeyForDate } from '@/lib/booking-calendar'
import '@/styles/calendar.css'

interface Booking {
  id: string
  name: string
  date: string
  time: string
  service: string
  duration_minutes: number
}

const translations = {
  fr: {
    title: 'Modifier votre rendez-vous', subtitle: 'Choisissez une nouvelle date et un nouvel horaire.',
    current: 'Rendez-vous actuel', chooseDate: 'Choisissez une date', chooseTime: 'Choisissez un horaire',
    changeDate: 'Changer de date', loading: 'Chargement...', noSlots: 'Aucun créneau disponible pour cette date.',
    confirm: 'Confirmer la modification', saving: 'Modification en cours...', back: 'Retour',
    invalid: 'Ce lien est invalide ou expiré. Contactez le salon pour recevoir un nouveau lien.',
    loadError: 'Impossible de charger le rendez-vous. Réessayez plus tard.',
    availabilityError: 'Impossible de vérifier les disponibilités. Réessayez.',
    failed: 'Ce créneau ne peut pas être réservé. Choisissez un autre horaire.',
    success: 'Votre rendez-vous a été modifié.', emailError: 'Le rendez-vous est modifié, mais l’e-mail de confirmation n’a pas pu être envoyé.',
    retry: 'Réessayer', home: 'Retour à l’accueil', noChange: 'Choisissez une date ou une heure différente.',
    hoursError: 'Impossible de charger les horaires. Réessayez plus tard.',
  },
  en: {
    title: 'Reschedule your appointment', subtitle: 'Choose a new date and time.',
    current: 'Current appointment', chooseDate: 'Choose a date', chooseTime: 'Choose a time',
    changeDate: 'Change date', loading: 'Loading...', noSlots: 'No available times for this date.',
    confirm: 'Confirm changes', saving: 'Updating...', back: 'Back',
    invalid: 'This link is invalid or expired. Contact the salon for a new link.',
    loadError: 'Unable to load your appointment. Please try again later.',
    availabilityError: 'Unable to check availability. Please try again.',
    failed: 'This time is unavailable. Please choose another time.',
    success: 'Your appointment has been rescheduled.', emailError: 'Your appointment was updated, but the confirmation email could not be sent.',
    retry: 'Try again', home: 'Back to home', noChange: 'Choose a different date or time.',
    hoursError: 'Unable to load opening hours. Please try again later.',
  },
  nl: {
    title: 'Uw afspraak wijzigen', subtitle: 'Kies een nieuwe datum en tijd.',
    current: 'Huidige afspraak', chooseDate: 'Kies een datum', chooseTime: 'Kies een tijd',
    changeDate: 'Datum wijzigen', loading: 'Laden...', noSlots: 'Geen beschikbare tijden op deze datum.',
    confirm: 'Wijziging bevestigen', saving: 'Wijzigen...', back: 'Terug',
    invalid: 'Deze link is ongeldig of verlopen. Neem contact op met het salon voor een nieuwe link.',
    loadError: 'Uw afspraak kon niet worden geladen. Probeer het later opnieuw.',
    availabilityError: 'Beschikbaarheid kon niet worden gecontroleerd. Probeer opnieuw.',
    failed: 'Deze tijd is niet beschikbaar. Kies een andere tijd.',
    success: 'Uw afspraak is gewijzigd.', emailError: 'Uw afspraak is gewijzigd, maar de bevestigingsmail kon niet worden verzonden.',
    retry: 'Opnieuw proberen', home: 'Terug naar de startpagina', noChange: 'Kies een andere datum of tijd.',
    hoursError: 'De openingstijden konden niet worden geladen. Probeer het later opnieuw.',
  },
} as const

export default function RescheduleBooking() {
  const params = useParams()
  const id = String(params.id)
  const locale = params.locale === 'nl' ? 'nl' : params.locale === 'en' ? 'en' : 'fr'
  const t = translations[locale]
  const { hours, bookingHorizonMonths, loading: hoursLoading, error: hoursError } = useOpeningHours()
  const [token, setToken] = useState('')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState(false)
  const [slotRequest, setSlotRequest] = useState(0)
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [overridesError, setOverridesError] = useState(false)
  const [overridesLoading, setOverridesLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<'success' | 'emailError' | null>(null)

  useEffect(() => {
    const key = `reschedule-token:${id}`
    const fragment = window.location.hash.slice(1)
    const value = fragment ? decodeURIComponent(fragment) : sessionStorage.getItem(key) || ''
    if (fragment) {
      sessionStorage.setItem(key, value)
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    if (!value) {
      setError(t.invalid)
      setLoading(false)
      return
    }
    setToken(value)
    const controller = new AbortController()
    fetch(`/api/bookings/${encodeURIComponent(id)}/reschedule`, {
      headers: { Authorization: `Bearer ${value}` }, cache: 'no-store', signal: controller.signal,
    }).then(async response => {
      if (!response.ok) {
        setError(response.status === 401 ? t.invalid : t.loadError)
        return
      }
      const data = await response.json()
      setBooking(data.booking)
    }).catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Unable to load appointment:', error)
        setError(t.loadError)
      }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id, t.invalid, t.loadError])

  useEffect(() => {
    if (!booking || hoursLoading || hoursError) return
    const controller = new AbortController()
    setOverridesLoading(true)
    const params = new URLSearchParams({
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addMonths(new Date(), bookingHorizonMonths), 'yyyy-MM-dd'),
    })
    fetch(`/api/availability?${params}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Unable to load availability')
        const values: Array<{ date: string; is_available: boolean }> = await response.json()
        setOverrides(Object.fromEntries(values.map(value => [value.date, value.is_available])))
        setOverridesError(false)
      }).catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Unable to load availability:', error)
          setOverridesError(true)
        }
      }).finally(() => { if (!controller.signal.aborted) setOverridesLoading(false) })
    return () => controller.abort()
  }, [booking, bookingHorizonMonths, hoursLoading, hoursError])

  useEffect(() => {
    if (!date || !booking || !token) return
    const controller = new AbortController()
    const dateKey = format(date, 'yyyy-MM-dd')
    setSlotsLoading(true)
    setSlotsError(false)
    setSlots([])
    const params = new URLSearchParams({ date: dateKey, duration: String(booking.duration_minutes), excludeBookingId: id })
    fetch(`/api/bookings/availability?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: controller.signal,
    }).then(async response => {
      if (!response.ok) throw new Error('Unable to load time slots')
      const data: { availableSlots: string[] } = await response.json()
      setSlots(data.availableSlots.filter(slot =>
        !isToday(date) || Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3, 5)) >
          new Date().getHours() * 60 + new Date().getMinutes()))
    }).catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Unable to load time slots:', error)
        setSlotsError(true)
      }
    }).finally(() => { if (!controller.signal.aborted) setSlotsLoading(false) })
    return () => controller.abort()
  }, [date, booking, token, id, slotRequest])

  const submit = async () => {
    if (!date || !time || !booking || saving) return
    const newDate = format(date, 'yyyy-MM-dd')
    if (booking.date === newDate && booking.time.slice(0, 5) === time) {
      setError(t.noChange)
      return
    }
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(id)}/reschedule`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newDate, newTime: time, lang: locale }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(response.status === 401 ? t.invalid : t.failed)
        setTime('')
        setSlotRequest(value => value + 1)
        return
      }
      setResult(data.emailSent ? 'success' : 'emailError')
      sessionStorage.removeItem(`reschedule-token:${id}`)
    } catch (error) {
      console.error('Unable to reschedule:', error)
      setError(t.loadError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.title}</h1>
          <p className="text-gray-400 text-lg">{t.subtitle}</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/50 border border-accent/20 rounded-2xl p-5 sm:p-8 space-y-6">
          {loading ? <p className="text-gray-300">{t.loading}</p> : result ? (
            <div role="status" className="space-y-4 text-center">
              <p className="text-white">{result === 'success' ? t.success : t.emailError}</p>
              <Link href={`/${locale}`} className="text-accent hover:underline">{t.home}</Link>
            </div>
          ) : !booking ? (
            <p role="alert" className="text-red-300">{error || t.loadError}</p>
          ) : (
            <>
              <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                <h2 className="font-semibold text-accent">{t.current}</h2>
                <p className="text-white mt-2">{booking.service}</p>
                <p className="text-gray-300">{booking.date} · {booking.time.slice(0, 5)}</p>
              </div>
              {(hoursError || overridesError) && <p role="alert" className="text-red-300">{t.hoursError}</p>}
              {!date ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">{t.chooseDate}</h2>
                  {hoursLoading || overridesLoading ? <p className="text-gray-300">{t.loading}</p> : (
                    <div className="calendar-container bg-white/5 rounded-xl p-4">
                      <Calendar
                        value={null} minDate={new Date()} maxDate={addMonths(new Date(), bookingHorizonMonths)}
                        locale={locale === 'nl' ? 'nl-NL' : locale === 'en' ? 'en-GB' : 'fr-FR'}
                        className="modern-calendar"
                        tileDisabled={({ date: day, view }) => {
                          if (view !== 'month') return false
                          const key = format(day, 'yyyy-MM-dd')
                          const weekday = weekdayKeyForDate(key)
                          return hoursError || overridesError || (key in overrides ? !overrides[key] : !weekday || hours[weekday].closed)
                        }}
                        onChange={value => {
                          const selected = Array.isArray(value) ? value[0] : value
                          if (selected) { setDate(selected); setTime(''); setError('') }
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{t.chooseTime}</h2>
                    <button type="button" className="text-accent text-sm" onClick={() => { setDate(null); setTime(''); setError('') }}>{t.changeDate}</button>
                  </div>
                  <div className="bg-accent/10 rounded-xl p-4 border border-accent/20 text-center text-accent">
                    {date.toLocaleDateString(locale === 'nl' ? 'nl-BE' : locale === 'en' ? 'en-GB' : 'fr-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  {slotsLoading ? <p className="text-gray-300">{t.loading}</p> : slotsError ? (
                    <div role="alert" className="text-red-300">{t.availabilityError} <button type="button" className="text-accent underline" onClick={() => setSlotRequest(value => value + 1)}>{t.retry}</button></div>
                  ) : !slots.length ? <p className="text-gray-300">{t.noSlots}</p> : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {slots.map(slot => <button key={slot} type="button" onClick={() => { setTime(slot); setError('') }}
                        className={`p-3 rounded-xl border transition ${time === slot ? 'bg-accent text-black border-accent' : 'bg-white/5 border-white/10 text-white hover:border-accent/50'}`}>{slot}</button>)}
                    </div>
                  )}
                  <button type="button" onClick={submit} disabled={!time || slotsLoading || slotsError || saving}
                    className="w-full bg-accent hover:bg-accent-dark disabled:bg-gray-600 text-black font-semibold py-3 rounded-xl disabled:cursor-not-allowed">
                    {saving ? t.saving : t.confirm}
                  </button>
                </div>
              )}
              {error && <p role="alert" className="text-red-300">{error}</p>}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
