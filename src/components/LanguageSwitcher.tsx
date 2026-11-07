'use client'

import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const languages = [
    { code: 'fr', label: 'FR', short: 'FR', enabled: true },
    { code: 'nl', label: 'NL', short: 'NL', enabled: true },
    { code: 'en', label: 'EN', short: 'EN', enabled: true },
  ]

  const currentLang = languages.find(l => l.code === locale) || languages[1]

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-2 rounded-full border border-white/10 hover:border-accent/50 transition-all duration-300"
      >
        <span className="text-xs font-semibold tracking-wider text-bone">{currentLang.short}</span>
      </motion.button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-24 bg-surface/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                disabled={!lang.enabled}
                onClick={() => {
                  if (!lang.enabled) return
                  setLocale(lang.code as 'en' | 'fr' | 'nl')
                  const pathWithoutLocale = pathname.replace(/^\/(fr|en|nl)(?=\/|$)/, '') || '/'
                  window.location.assign(`/${lang.code}${pathWithoutLocale}`)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                  locale === lang.code
                    ? 'bg-accent/10 text-accent'
                    : lang.enabled ? 'text-gray-300 hover:text-white' : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                <span className="text-sm font-medium">{lang.label}</span>
                {locale === lang.code && (
                  <motion.div
                    layoutId="activeLang"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}
