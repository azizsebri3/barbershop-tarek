/**
 * Test du hook useRealtimeBookings
 * 
 * Ce fichier contient des tests pour vérifier :
 * - La connexion Realtime
 * - Les notifications
 * - Le fallback en cas d'erreur
 * - Le cleanup
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useRealtimeBookings } from '@/lib/useRealtimeBookings'

describe('useRealtimeBookings', () => {
  it('should fetch bookings on mount', async () => {
    const { result } = renderHook(() => useRealtimeBookings())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.bookings).toBeDefined()
    })
  })

  it('should connect to Realtime', async () => {
    const { result } = renderHook(() => useRealtimeBookings())

    await waitFor(() => {
      expect(result.current.isRealtimeConnected).toBe(true)
    }, { timeout: 5000 })
  })

  it('should call onInsert when new booking is created', async () => {
    const onInsert = jest.fn()
    const { result } = renderHook(() => 
      useRealtimeBookings({ onInsert })
    )

    // Simuler un INSERT depuis Supabase
    // TODO: créer une réservation de test

    await waitFor(() => {
      expect(onInsert).toHaveBeenCalled()
    })
  })

  it('should disable Realtime when disabled=true', async () => {
    const { result } = renderHook(() => 
      useRealtimeBookings({ disabled: true })
    )

    await waitFor(() => {
      expect(result.current.isRealtimeConnected).toBe(false)
    })
  })

  it('should cleanup on unmount', async () => {
    const { unmount } = renderHook(() => useRealtimeBookings())

    unmount()

    // Vérifier que le channel a été supprimé
    // TODO: mock supabase.removeChannel
  })

  it('should handle errors gracefully', async () => {
    const onError = jest.fn()
    
    // Simuler une erreur Supabase
    jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => 
      useRealtimeBookings({ onError })
    )

    // TODO: forcer une erreur

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })
  })
})
