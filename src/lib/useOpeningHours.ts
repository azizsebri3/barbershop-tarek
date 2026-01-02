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

export function useOpeningHours() {
  const [hours, setHours] = useState<OpeningHours>(defaultHours)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHours()
  }, [])

  const loadHours = async () => {
    try {
      const response = await fetch('/api/hours')
      const data = await response.json()

      if (data.error) {
        console.error('❌ Erreur chargement horaires:', data.error)
        // Fallback to default hours
        setHours(defaultHours)
      } else if (data.hours) {
        setHours(data.hours)
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des horaires:', error)
      // Fallback to default hours
      setHours(defaultHours)
    } finally {
      setLoading(false)
    }
  }

  return { hours, loading, refetch: loadHours }
}