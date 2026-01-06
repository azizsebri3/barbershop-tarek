'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import DateTimePicker from '@/components/DateTimePicker'

interface Booking {
  id: string
  name: string
  email: string
  date: string
  time: string
  service: string
}

export default function RescheduleBooking() {
  const params = useParams()
  const bookingId = params.id as string
  const locale = (params.locale as string) || 'fr'

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)

  const texts = {
    fr: {
      title: 'Modifier votre rendez-vous',
      loading: 'Chargement...',
      error: 'Erreur',
      currentBooking: 'Rendez-vous actuel',
      newDate: 'Nouvelle date',
      newTime: 'Nouvel horaire',
      confirm: 'Confirmer la modification',
      success: '✅ Rendez-vous modifié avec succès!',
      errorFetch: 'Impossible de charger le rendez-vous',
      errorReschedule: 'Erreur lors de la modification',
      back: 'Retour',
      name: 'Nom',
      service: 'Service',
      currentDate: 'Date actuelle',
      currentTime: 'Horaire actuel'
    },
    en: {
      title: 'Reschedule your appointment',
      loading: 'Loading...',
      error: 'Error',
      currentBooking: 'Current booking',
      newDate: 'New date',
      newTime: 'New time',
      confirm: 'Confirm changes',
      success: '✅ Appointment rescheduled successfully!',
      errorFetch: 'Failed to load booking',
      errorReschedule: 'Error rescheduling appointment',
      back: 'Back',
      name: 'Name',
      service: 'Service',
      currentDate: 'Current date',
      currentTime: 'Current time'
    }
  }

  const t = texts[locale as 'fr' | 'en'] || texts.en

  const fetchBooking = useCallback(async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/reschedule`)
      if (!response.ok) throw new Error('Failed to load booking')

      const data = await response.json()
      setBooking(data.booking)
      // Only set date/time if not already loaded (first time only)
      if (!hasLoaded) {
        setNewDate(data.booking.date)
        setNewTime(data.booking.time)
        setHasLoaded(true)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load booking')
    } finally {
      setLoading(false)
    }
  }, [bookingId, hasLoaded])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDate || !newTime) {
      toast.error('Please select date and time')
      return
    }

    if (newDate === booking?.date && newTime === booking?.time) {
      toast.error('Please select a different date or time')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate,
          newTime,
          lang: locale
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t.errorReschedule)
      }

      toast.success(t.success)
      setTimeout(() => {
        window.location.href = `/${locale}`
      }, 2000)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || t.errorReschedule)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <p className="text-white text-lg">{t.loading}</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col items-center justify-center gap-4">
        <p className="text-white text-lg">{t.errorFetch}</p>
        <Link href={`/${locale}`} className="text-accent hover:underline">
          ← {t.back}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-20 px-4">
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-accent hover:text-accent-light mb-6 transition"
          >
            <ArrowLeft size={20} />
            {t.back}
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-gray-400">
            {locale === 'fr' ? 'Modifiez votre rendez-vous pour une meilleure convenance' : 'Change your appointment to a more convenient time'}
          </p>
        </div>

        {/* Current Booking Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-accent mb-4">{t.currentBooking}</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <p className="text-sm text-gray-400">{t.name}</p>
              <p className="font-medium">{booking.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t.service}</p>
              <p className="font-medium">{booking.service}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-accent" />
              <div>
                <p className="text-sm text-gray-400">{t.currentDate}</p>
                <p className="font-medium">{booking.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              <div>
                <p className="text-sm text-gray-400">{t.currentTime}</p>
                <p className="font-medium">{booking.time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reschedule Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-accent mb-4">📅 {locale === 'fr' ? 'Choisir nouvelle date et heure' : 'Select new date and time'}</h2>
          
          <DateTimePicker
            currentDate={newDate}
            currentTime={newTime}
            onDateChange={setNewDate}
            onTimeChange={setNewTime}
            excludeBookingId={bookingId}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent hover:bg-accent-dark disabled:bg-gray-600 text-black font-semibold py-3 rounded-lg transition disabled:cursor-not-allowed"
          >
            {submitting ? '⏳ ' + t.loading : t.confirm}
          </button>

          <p className="text-sm text-gray-400 text-center">
            {locale === 'fr'
              ? 'Un email de confirmation sera envoyé après modification'
              : 'A confirmation email will be sent after the change'}
          </p>
        </form>
      </motion.div>
    </div>
  )
}
