'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase, Booking } from './supabase'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

interface UseRealtimeBookingsOptions {
  /** Active ou non les notifications toast pour les changements */
  enableNotifications?: boolean
  /** Callback appelé lors d'un insert */
  onInsert?: (booking: Booking) => void
  /** Callback appelé lors d'un update */
  onUpdate?: (booking: Booking) => void
  /** Callback appelé lors d'un delete */
  onDelete?: (bookingId: string) => void
  /** Callback de fallback en cas d'erreur de connexion */
  onError?: (error: Error) => void
  /** Désactive le realtime (utile pour les tests) */
  disabled?: boolean
}

interface UseRealtimeBookingsReturn {
  bookings: Booking[]
  loading: boolean
  error: Error | null
  isRealtimeConnected: boolean
  refetch: () => Promise<void>
}

/**
 * Hook personnalisé pour gérer les réservations avec Supabase Realtime
 * 
 * Fonctionnalités:
 * - Fetch initial des réservations
 * - Abonnement en temps réel aux changements (INSERT, UPDATE, DELETE)
 * - Notifications toast optionnelles
 * - Gestion automatique de la déconnexion (cleanup)
 * - Fallback sur fetch manuel en cas d'erreur
 * 
 * @example
 * ```tsx
 * const { bookings, loading, isRealtimeConnected, refetch } = useRealtimeBookings({
 *   enableNotifications: true,
 *   onInsert: (booking) => console.log('Nouvelle réservation:', booking)
 * })
 * ```
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
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isMountedRef = useRef(true)
  
  // Utiliser des refs pour éviter les re-renders
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete, onError })
  
  // Mettre à jour les callbacks sans causer de re-render
  useEffect(() => {
    callbacksRef.current = { onInsert, onUpdate, onDelete, onError }
  }, [onInsert, onUpdate, onDelete, onError])

  /**
   * Récupère toutes les réservations depuis Supabase
   */
  const fetchBookings = useCallback(async () => {
    if (!supabase) {
      const err = new Error('Supabase client non disponible')
      console.error('❌ Erreur:', err)
      
      if (isMountedRef.current) {
        setError(err)
        setLoading(false)
        if (callbacksRef.current.onError) callbacksRef.current.onError(err)
        if (enableNotifications) {
          toast.error('Configuration Supabase manquante')
        }
      }
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      if (isMountedRef.current) {
        setBookings(data || [])
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur lors du chargement')
      console.error('❌ Erreur fetchBookings:', error)
      
      if (isMountedRef.current) {
        setError(error)
        if (callbacksRef.current.onError) callbacksRef.current.onError(error)
        if (enableNotifications) {
          toast.error('Erreur de chargement des réservations')
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [enableNotifications])

  /**
   * Configure l'abonnement Realtime
   */
  useEffect(() => {
    if (!supabase || disabled) {
      fetchBookings()
      return
    }

    console.log('🔌 Setup Realtime subscription')

    // Fetch initial
    fetchBookings()

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'bookings'
        },
        (payload: RealtimePostgresChangesPayload<Booking>) => {
          console.log('🔔 Realtime event:', payload.eventType)

          if (!isMountedRef.current) return

          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new) {
                const newBooking = payload.new as Booking
                setBookings(prev => [newBooking, ...prev])
                
                if (enableNotifications) {
                  toast.success(`Nouvelle réservation: ${newBooking.name}`, {
                    icon: '🎉',
                    duration: 4000
                  })
                }
                
                if (callbacksRef.current.onInsert) callbacksRef.current.onInsert(newBooking)
              }
              break

            case 'UPDATE':
              if (payload.new) {
                const updatedBooking = payload.new as Booking
                setBookings(prev => 
                  prev.map(booking => 
                    booking.id === updatedBooking.id ? updatedBooking : booking
                  )
                )
                
                if (enableNotifications) {
                  const statusEmoji = {
                    confirmed: '✅',
                    cancelled: '❌',
                    pending: '⏳'
                  }[updatedBooking.status] || '📝'
                  
                  toast(`Réservation mise à jour: ${updatedBooking.name}`, {
                    icon: statusEmoji,
                    duration: 3000
                  })
                }
                
                if (callbacksRef.current.onUpdate) callbacksRef.current.onUpdate(updatedBooking)
              }
              break

            case 'DELETE':
              if (payload.old) {
                const deletedId = (payload.old as Booking).id
                setBookings(prev => prev.filter(booking => booking.id !== deletedId))
                
                if (enableNotifications) {
                  toast('Réservation supprimée', {
                    icon: '🗑️',
                    duration: 2000
                  })
                }
                
                if (callbacksRef.current.onDelete) callbacksRef.current.onDelete(deletedId)
              }
              break
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status)
        
        if (isMountedRef.current) {
          if (status === 'SUBSCRIBED') {
            setIsRealtimeConnected(true)
            console.log('✅ Realtime connecté')
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsRealtimeConnected(false)
            console.warn('⚠️ Realtime déconnecté, fallback sur fetch manuel')
            
            // Fallback: refetch les données après 2 secondes
            setTimeout(() => {
              if (isMountedRef.current) {
                fetchBookings()
              }
            }, 2000)
          }
        }
      })

    channelRef.current = channel

    // Cleanup à l'unmount
    return () => {
      console.log('🧹 Nettoyage Realtime subscription')
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      
      setIsRealtimeConnected(false)
    }
  }, [disabled, enableNotifications, fetchBookings])

  return {
    bookings,
    loading,
    error,
    isRealtimeConnected,
    refetch: fetchBookings
  }
}
