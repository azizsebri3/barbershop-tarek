'use client'

import { useState, useEffect } from 'react'
import { services as defaultServices } from '@/lib/data'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
}

// Cache global avec TTL de 5 minutes
let cachedServices: Service[] | null = null
let cacheTimestamp: number | null = null
let pendingPromise: Promise<Service[]> | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchServices(): Promise<Service[]> {
  const res = await fetch('/api/services')
  const data = await res.json()
  
  if (data.error) {
    console.error('❌ Erreur chargement services:', data.error)
    return defaultServices
  }
  
  return data.services || defaultServices
}

function isCacheValid(): boolean {
  if (!cachedServices || !cacheTimestamp) return false
  return Date.now() - cacheTimestamp < CACHE_TTL
}

export function useServices() {
  const [services, setServices] = useState<Service[]>(cachedServices || defaultServices)
  const [loading, setLoading] = useState<boolean>(!cachedServices)

  useEffect(() => {
    let mounted = true

    // Si le cache est valide, l'utiliser directement
    if (isCacheValid() && cachedServices) {
      setServices(cachedServices)
      setLoading(false)
      return
    }

    // Si une requête est déjà en cours, s'y attacher
    if (pendingPromise) {
      pendingPromise.then(s => {
        if (!mounted) return
        setServices(s)
        setLoading(false)
      }).catch(() => {
        if (!mounted) return
        setServices(defaultServices)
        setLoading(false)
      })
      return
    }

    // Nouvelle requête
    pendingPromise = fetchServices()
    pendingPromise.then(s => {
      cachedServices = s
      cacheTimestamp = Date.now()
      pendingPromise = null
      if (!mounted) return
      setServices(s)
      setLoading(false)
    }).catch(err => {
      console.error('❌ Erreur chargement services (cached):', err)
      cachedServices = defaultServices
      cacheTimestamp = Date.now()
      pendingPromise = null
      if (!mounted) return
      setServices(defaultServices)
      setLoading(false)
    })

    return () => { mounted = false }
  }, [])

  const refetch = async () => {
    setLoading(true)
    try {
      const s = await fetchServices()
      cachedServices = s
      cacheTimestamp = Date.now()
      setServices(s)
    } catch (err) {
      console.error('❌ Erreur rechargement services:', err)
      setServices(defaultServices)
    } finally {
      setLoading(false)
    }
  }

  return { services, loading, refetch }
}

// Fonction pour invalider manuellement le cache (utile pour l'admin)
export function invalidateServicesCache() {
  cachedServices = null
  cacheTimestamp = null
  pendingPromise = null
}
