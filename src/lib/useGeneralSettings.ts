'use client'

import { useState, useEffect } from 'react'

interface GeneralSettings {
  salonName: string
  description: string
  phone: string
  email: string
  address: string
  website?: string
  facebook?: string
  instagram?: string
  tiktok?: string
  logo_url?: string
}

const defaultSettings: GeneralSettings = {
  salonName: 'Style & Coupe',
  description: 'Votre salon de coiffure et barbershop en Belgique. Coupes modernes, colorations tendance et rasage traditionnel premium.',
  phone: '+32465632205',
  email: 'contact@tareksalon.be',
  address: 'Belgique',
  website: 'tareksalon.be',
  facebook: '',
  instagram: '',
  tiktok: '',
  logo_url: '/logo.png'
}

export function useGeneralSettings() {
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (response.ok) {
        setSettings({
          ...defaultSettings,
          ...(data.settings || {}),
          logo_url: data.logo_url
        })
      } else {
        console.error('Erreur chargement settings:', data.error)
      }
    } catch (error) {
      console.error('Erreur chargement settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<GeneralSettings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: newSettings }),
      })

      const data = await response.json()

      if (response.ok) {
        setSettings({ ...settings, ...newSettings })
        return { success: true }
      } else {
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur sauvegarde settings:', error)
      throw error
    }
  }

  return {
    settings,
    loading,
    updateSettings,
  }
}
