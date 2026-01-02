'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'

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
      if (!supabase) {
        // Fallback to localStorage
        const saved = localStorage.getItem('admin_general_settings')
        if (saved) {
          const parsed = JSON.parse(saved)
          setSettings({ ...defaultSettings, ...parsed })
        }
        setLoading(false)
        return
      }

      const response = await fetch('/api/settings')
      const data = await response.json()

      if (data.error) {
        console.error('❌ Erreur API:', data.error)
        // Fallback to localStorage
        const saved = localStorage.getItem('admin_general_settings')
        if (saved) {
          const parsed = JSON.parse(saved)
          setSettings({ ...defaultSettings, ...parsed })
        }
      } else if (data.settings) {
        setSettings({ ...defaultSettings, ...data.settings })
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<GeneralSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)

    try {
      if (!supabase) {
        // Fallback to localStorage
        localStorage.setItem('admin_general_settings', JSON.stringify(updated))
        return
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: updated }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Erreur API:', data.error)
        // Fallback to localStorage
        localStorage.setItem('admin_general_settings', JSON.stringify(updated))
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      // Fallback to localStorage
      localStorage.setItem('admin_general_settings', JSON.stringify(updated))
      throw error
    }
  }

  return { settings, updateSettings, loading }
}