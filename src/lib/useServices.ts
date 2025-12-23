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

export function useServices() {
  const [services, setServices] = useState<Service[]>(defaultServices)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      console.log('📥 Chargement des services publics...')
      const response = await fetch('/api/services')
      const data = await response.json()

      if (data.error) {
        console.error('❌ Erreur chargement services:', data.error)
        // Fallback to default services
        setServices(defaultServices)
      } else if (data.services) {
        console.log('✅ Services publics chargés:', data.services)
        setServices(data.services)
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des services:', error)
      // Fallback to default services
      setServices(defaultServices)
    } finally {
      setLoading(false)
    }
  }

  return { services, loading, refetch: loadServices }
}