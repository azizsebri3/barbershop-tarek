'use client'

import { useState, useEffect, useCallback } from 'react'
import { openingHours as defaultHours } from '@/lib/data'
import {
  DEFAULT_BOOKING_HORIZON_MONTHS,
  normalizeBookingHorizonMonths,
} from '@/lib/booking-calendar'

interface OpeningHours {
  monday: { open: string; close: string; closed: boolean }
  tuesday: { open: string; close: string; closed: boolean }
  wednesday: { open: string; close: string; closed: boolean }
  thursday: { open: string; close: string; closed: boolean }
  friday: { open: string; close: string; closed: boolean }
  saturday: { open: string; close: string; closed: boolean }
  sunday: { open: string; close: string; closed: boolean }
}

// Cache global avec TTL de 10 minutes
let cachedHours: OpeningHours | null = null
let cachedBookingHorizonMonths = DEFAULT_BOOKING_HORIZON_MONTHS
let cacheTimestamp: number | null = null
let pendingPromise: Promise<{ hours: OpeningHours; bookingHorizonMonths: number }> | null = null
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

async function fetchHours(): Promise<{ hours: OpeningHours; bookingHorizonMonths: number }> {
  const res = await fetch('/api/hours')
  const data = await res.json()
  
  if (!res.ok || data.error || !data.hours) {
    throw new Error(data.error || 'Unable to load opening hours')
  }
  
  return {
    hours: data.hours || defaultHours,
    bookingHorizonMonths: normalizeBookingHorizonMonths(data.bookingHorizonMonths),
  }
}

function isCacheValid(): boolean {
  if (!cachedHours || !cacheTimestamp) return false
  return Date.now() - cacheTimestamp < CACHE_TTL
}

export function useOpeningHours() {
  const [hours, setHours] = useState<OpeningHours>(cachedHours || defaultHours)
  const [bookingHorizonMonths, setBookingHorizonMonths] = useState(cachedBookingHorizonMonths)
  const [loading, setLoading] = useState<boolean>(!cachedHours)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true

    if (isCacheValid() && cachedHours) {
      setHours(cachedHours)
      setLoading(false)
      return
    }

    if (pendingPromise) {
      pendingPromise.then(settings => {
        if (!mounted) return
        setHours(settings.hours)
        setBookingHorizonMonths(settings.bookingHorizonMonths)
        setError(false)
        setLoading(false)
      }).catch(err => {
        console.error('❌ Erreur chargement horaires (cached):', err)
        if (!mounted) return
        setError(true)
        setHours(defaultHours)
        setLoading(false)
      })
      return
    }

    pendingPromise = fetchHours()
    pendingPromise.then(settings => {
      cachedHours = settings.hours
      cachedBookingHorizonMonths = settings.bookingHorizonMonths
      cacheTimestamp = Date.now()
      pendingPromise = null
      if (!mounted) return
      setHours(settings.hours)
      setBookingHorizonMonths(settings.bookingHorizonMonths)
      setLoading(false)
    }).catch(err => {
      console.error('❌ Erreur chargement horaires (cached):', err)
      pendingPromise = null
      if (!mounted) return
      setError(true)
      setHours(defaultHours)
      setLoading(false)
    })

    return () => { mounted = false }
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const settings = await fetchHours()
      cachedHours = settings.hours
      cachedBookingHorizonMonths = settings.bookingHorizonMonths
      cacheTimestamp = Date.now()
      setHours(settings.hours)
      setBookingHorizonMonths(settings.bookingHorizonMonths)
      setError(false)
      return true
    } catch (err) {
      console.error('❌ Erreur rechargement horaires:', err)
      setError(true)
      setHours(defaultHours)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { hours, bookingHorizonMonths, loading, error, refetch }
}

export function invalidateHoursCache() {
  cachedHours = null
  cachedBookingHorizonMonths = DEFAULT_BOOKING_HORIZON_MONTHS
  cacheTimestamp = null
  pendingPromise = null
}
