'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Booking } from './supabase'
import toast from 'react-hot-toast'

const POLL_INTERVAL_MS = 15000

interface UseRealtimeBookingsOptions {
  /** Active ou non les notifications toast pour les changements */
  enableNotifications?: boolean
  /** Callback appelé lors d'un insert */
  onInsert?: (booking: Booking) => void
  /** Callback appelé lors d'un update */
  onUpdate?: (booking: Booking) => void
  /** Callback appelé lors d'un delete */
  onDelete?: (bookingId: string) => void
  /** Callback appelé en cas d'erreur de chargement */
  onError?: (error: Error) => void
  /** Désactive le rafraîchissement automatique */
  disabled?: boolean
}

interface UseRealtimeBookingsReturn {
  bookings: Booking[]
  loading: boolean
  error: Error | null
  isRealtimeConnected: boolean
  refetch: () => Promise<boolean>
}

/**
 * Charge les réservations via l'API admin (session requise) et les rafraîchit
 * automatiquement. Les changements détectés entre deux chargements déclenchent
 * les callbacks et notifications.
 */
export function useRealtimeBookings(
  options: UseRealtimeBookingsOptions = {}
): UseRealtimeBookingsReturn {
  const {
    enableNotifications = true,
    onInsert,
    onUpdate,
    onDelete,
    onError,
    disabled = false
  } = options

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  const isMountedRef = useRef(true)
  const previousRef = useRef<Map<string, Booking> | null>(null)
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete, onError })

  useEffect(() => {
    callbacksRef.current = { onInsert, onUpdate, onDelete, onError }
  }, [onInsert, onUpdate, onDelete, onError])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const announceChanges = useCallback((next: Booking[]) => {
    const previous = previousRef.current
    previousRef.current = new Map(next.map(booking => [booking.id, booking]))
    if (!previous) return

    const nextIds = new Set(next.map(booking => booking.id))
    const { onInsert, onUpdate, onDelete } = callbacksRef.current

    for (const booking of next) {
      const before = previous.get(booking.id)
      if (!before) {
        if (enableNotifications) {
          toast.success(`Nouvelle réservation: ${booking.name}`, { icon: '🎉', duration: 4000 })
        }
        onInsert?.(booking)
      } else if (JSON.stringify(before) !== JSON.stringify(booking)) {
        if (enableNotifications) {
          const statusEmoji = { confirmed: '✅', cancelled: '❌', pending: '⏳' }[booking.status] || '📝'
          toast(`Réservation mise à jour: ${booking.name}`, { icon: statusEmoji, duration: 3000 })
        }
        onUpdate?.(booking)
      }
    }

    for (const id of previous.keys()) {
      if (!nextIds.has(id)) {
        if (enableNotifications) toast('Réservation supprimée', { icon: '🗑️', duration: 2000 })
        onDelete?.(id)
      }
    }
  }, [enableNotifications])

  const fetchBookings = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)

      const response = await fetch('/api/admin/bookings', { cache: 'no-store' })
      if (!response.ok) throw new Error(`Erreur de chargement (${response.status})`)
      const { bookings: data } = await response.json() as { bookings: Booking[] }

      if (isMountedRef.current) {
        setBookings(data || [])
        setError(null)
        setIsRealtimeConnected(true)
        announceChanges(data || [])
      }
      return true
    } catch (err) {
      const failure = err instanceof Error ? err : new Error('Erreur lors du chargement')
      console.error('Erreur fetchBookings:', failure)

      if (isMountedRef.current) {
        setIsRealtimeConnected(false)
        if (!silent) {
          setError(failure)
          callbacksRef.current.onError?.(failure)
          if (enableNotifications) toast.error('Erreur de chargement des réservations')
        }
      }
      return false
    } finally {
      if (isMountedRef.current && !silent) setLoading(false)
    }
  }, [announceChanges, enableNotifications])

  useEffect(() => {
    fetchBookings()
    if (disabled) return

    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') fetchBookings(true)
    }, POLL_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [disabled, fetchBookings])

  const refetch = useCallback(() => fetchBookings(), [fetchBookings])

  return { bookings, loading, error, isRealtimeConnected, refetch }
}
