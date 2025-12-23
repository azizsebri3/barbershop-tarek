'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Locale = 'en' | 'fr' | 'ar'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children, initialLocale = 'en' }: { children: React.ReactNode; initialLocale?: string }) {
  const [locale, setLocaleState] = useState<Locale>((initialLocale as Locale) || 'en')
  const router = useRouter()

  // Charger la langue depuis localStorage au montage du composant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-locale') as Locale | null
      if (savedLocale && ['en', 'fr', 'ar'].includes(savedLocale)) {
        setLocaleState(savedLocale)
      }
    }
  }, [])

  // Changer la langue ET rediriger vers la bonne route
  const handleSetLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale)
      // Rediriger vers la page dans la nouvelle langue
      const pathSegments = window.location.pathname.split('/')
      pathSegments[1] = newLocale // Remplacer la locale dans l'URL
      router.push(pathSegments.join('/'))
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale }}>
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
