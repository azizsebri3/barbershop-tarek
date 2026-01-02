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

export function usePublicGeneralSettings() {
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('settings')
        .select('value, logo_url')
        .eq('key', 'general')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erreur lors du chargement des paramètres:', error)
      } else if (data) {
        setSettings({ 
          ...defaultSettings, 
          ...data.value,
          logo_url: data.logo_url || '/logo.png'
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  return { settings, loading, refetch: loadSettings }
}