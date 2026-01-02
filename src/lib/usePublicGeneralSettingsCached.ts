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

// Cache global avec TTL de 15 minutes (les settings changent rarement)
let cachedSettings: GeneralSettings | null = null
let cacheTimestamp: number | null = null
let pendingPromise: Promise<GeneralSettings> | null = null
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

async function fetchSettings(): Promise<GeneralSettings> {
  if (!supabase) {
    return defaultSettings
  }

  const { data, error } = await supabase
    .from('settings')
    .select('value, logo_url')
    .eq('key', 'general')
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Erreur lors du chargement des paramètres:', error)
    return defaultSettings
  }

  if (data) {
    return { 
      ...defaultSettings, 
      ...data.value,
      logo_url: data.logo_url || '/logo.png'
    }
  }

  return defaultSettings
}

function isCacheValid(): boolean {
  if (!cachedSettings || !cacheTimestamp) return false
  return Date.now() - cacheTimestamp < CACHE_TTL
}

export function usePublicGeneralSettings() {
  const [settings, setSettings] = useState<GeneralSettings>(cachedSettings || defaultSettings)
  const [loading, setLoading] = useState<boolean>(!cachedSettings)

  useEffect(() => {
    let mounted = true

    if (isCacheValid() && cachedSettings) {
      setSettings(cachedSettings)
      setLoading(false)
      return
    }

    if (pendingPromise) {
      pendingPromise.then(s => {
        if (!mounted) return
        setSettings(s)
        setLoading(false)
      }).catch(() => {
        if (!mounted) return
        setSettings(defaultSettings)
        setLoading(false)
      })
      return
    }

    pendingPromise = fetchSettings()
    pendingPromise.then(s => {
      cachedSettings = s
      cacheTimestamp = Date.now()
      pendingPromise = null
      if (!mounted) return
      setSettings(s)
      setLoading(false)
    }).catch(err => {
      console.error('❌ Erreur chargement settings (cached):', err)
      cachedSettings = defaultSettings
      cacheTimestamp = Date.now()
      pendingPromise = null
      if (!mounted) return
      setSettings(defaultSettings)
      setLoading(false)
    })

    return () => { mounted = false }
  }, [])

  const refetch = async () => {
    setLoading(true)
    try {
      const s = await fetchSettings()
      cachedSettings = s
      cacheTimestamp = Date.now()
      setSettings(s)
    } catch (err) {
      console.error('❌ Erreur rechargement settings:', err)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  return { settings, loading, refetch }
}

export function invalidateSettingsCache() {
  cachedSettings = null
  cacheTimestamp = null
  pendingPromise = null
}
