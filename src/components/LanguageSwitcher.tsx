'use client'

import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useState } from 'react'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
    { code: 'fr', label: 'Français', flag: '🇫🇷', short: 'FR' },
  ]

  const currentLang = languages.find(l => l.code === locale) || languages[1]

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
      >
        <Globe size={16} className="text-gray-400" />
        <span className="text-sm font-medium text-white">{currentLang.flag}</span>
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
            className="absolute right-0 mt-2 w-40 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                onClick={() => {
                  setLocale(lang.code as 'en' | 'fr')
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                  locale === lang.code
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
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
