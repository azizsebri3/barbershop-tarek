'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '@/lib/translations'

type Locale = 'en' | 'fr'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: typeof translations['en']
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children, initialLocale = 'en' }: { children: React.ReactNode; initialLocale?: string }) {
  const [locale, setLocaleState] = useState<Locale>((initialLocale as Locale) || 'en')

  // Charger la langue depuis localStorage au montage du composant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-locale') as Locale | null
      if (savedLocale && ['en', 'fr'].includes(savedLocale)) {
        setLocaleState(savedLocale)
      }
    }
  }, [])

  // Changer la langue
  const handleSetLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale)
    }
  }

  const t = translations[locale]

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
