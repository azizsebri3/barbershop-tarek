'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useLanguage } from '@/lib/language-context'
import { supabase } from '@/lib/supabase'

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  service: string
  message?: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export default function CancelBookingPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const { t } = useLanguage()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelNote, setCancelNote] = useState('')
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!supabase) {
          throw new Error('Database not available')
        }

        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single()

        if (error || !data) {
          throw new Error(t.cancel.notFound)
        }
        setBooking(data)
      } catch (error) {
        console.error('Error loading booking:', error)
        toast.error(t.cancel.notFoundMessage || 'Booking not found')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, router, t])

  const handleCancel = async () => {
    if (!booking) return

    setCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelNote: cancelNote.trim() || undefined
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t.cancel.error)
      }

      setCancelled(true)
      toast.success(t.cancel.successMessage)
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      toast.error(error instanceof Error ? error.message : t.cancel.error)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{t.cancel.notFound}</h1>
          <p className="text-gray-300">{t.cancel.notFoundMessage}</p>
        </div>
      </div>
    )
  }

  if (booking.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/95 backdrop-blur-md border border-accent/20 rounded-xl p-8 w-full max-w-md text-center"
        >
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{t.cancel.alreadyCancelled}</h1>
          <p className="text-gray-300 mb-6">
            {t.cancel.alreadyCancelledMessage}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-accent hover:bg-accent/80 text-primary font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t.cancel.backButton}
          </button>
        </motion.div>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/95 backdrop-blur-md border border-accent/20 rounded-xl p-8 w-full max-w-md text-center"
        >
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{t.cancel.successTitle}</h1>
          <p className="text-gray-300 mb-6">
            {t.cancel.successMessage}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-accent hover:bg-accent/80 text-primary font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t.cancel.backButton}
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary/95 backdrop-blur-md border border-accent/20 rounded-xl p-8 w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{t.cancel.title}</h1>
          <p className="text-gray-300">
            {t.cancel.confirmQuestion}
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-primary/50 rounded-lg p-4 mb-6 border border-accent/20">
          <div className="flex items-center gap-3 mb-3">
            <User size={20} className="text-accent" />
            <span className="text-white font-semibold">{booking.name}</span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <Calendar size={20} className="text-accent" />
            <span className="text-white">{booking.date}</span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <Clock size={20} className="text-accent" />
            <span className="text-white">{booking.time}</span>
          </div>

          <div className="mt-3">
            <span className="text-accent font-semibold">{booking.service}</span>
          </div>

          {booking.message && (
            <div className="mt-3 p-3 bg-primary/30 rounded border-l-2 border-accent">
              <p className="text-gray-300 text-sm">{booking.message}</p>
            </div>
          )}
        </div>

        {/* Cancellation Note */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t.cancel.reasonLabel}
          </label>
          <textarea
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            placeholder={t.cancel.reasonPlaceholder}
            disabled={cancelling}
            className="w-full px-3 py-2 bg-primary/50 border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:border-accent focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            disabled={cancelling}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {t.cancel.cancelButton}
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {cancelling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t.cancel.cancelling}
              </>
            ) : (
              t.cancel.confirmButton
            )}
          </button>
        </div>

        <p className="text-gray-400 text-sm text-center mt-4">
          {t.cancel.recommendation}
        </p>
      </motion.div>
    </div>
  )
}