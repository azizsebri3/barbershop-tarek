'use client'

import { useState, useEffect } from 'react'
import { openingHours as defaultHours } from '@/lib/data'

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
let cacheTimestamp: number | null = null
let pendingPromise: Promise<OpeningHours> | null = null
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

async function fetchHours(): Promise<OpeningHours> {
  const res = await fetch('/api/hours')
  const data = await res.json()
  
  if (data.error) {
    console.error('❌ Erreur chargement horaires:', data.error)
    return defaultHours
  }
  
  return data.hours || defaultHours
}

function isCacheValid(): boolean {
  if (!cachedHours || !cacheTimestamp) return false
  return Date.now() - cacheTimestamp < CACHE_TTL
}

export function useOpeningHours() {
  const [hours, setHours] = useState<OpeningHours>(cachedHours || defaultHours)
  const [loading, setLoading] = useState<boolean>(!cachedHours)

  useEffect(() => {
    let mounted = true

    if (isCacheValid() && cachedHours) {
      setHours(cachedHours)
      setLoading(false)
      return
    }

    if (pendingPromise) {
      pendingPromise.then(h => {
        if (!mounted) return
        setHours(h)
        setLoading(false)
      }).catch(() => {
        if (!mounted) return
        setHours(defaultHours)
        setLoading(false)
      })
      return
    }

    pendingPromise = fetchHours()
    pendingPromise.then(h => {
      cachedHours = h
      cacheTimestamp = Date.now()
      pendingPromise = null
      if (!mounted) return
      setHours(h)
      setLoading(false)
    }).catch(err => {
      console.error('❌ Erreur chargement horaires (cached):', err)
      cachedHours = defaultHours
      cacheTimestamp = Date.now()
      pendingPromise = null
      if (!mounted) return
      setHours(defaultHours)
      setLoading(false)
    })

    return () => { mounted = false }
  }, [])

  const refetch = async () => {
    setLoading(true)
    try {
      const h = await fetchHours()
      cachedHours = h
      cacheTimestamp = Date.now()
      setHours(h)
    } catch (err) {
      console.error('❌ Erreur rechargement horaires:', err)
      setHours(defaultHours)
    } finally {
      setLoading(false)
    }
  }

  return { hours, loading, refetch }
}

export function invalidateHoursCache() {
  cachedHours = null
  cacheTimestamp = null
  pendingPromise = null
}
