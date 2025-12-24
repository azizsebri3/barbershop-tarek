'use client'

import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()

  const languages = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
  ]

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLocale(lang.code as 'en' | 'fr')}
          className={`px-2 py-1 rounded-lg font-bold transition-all text-xs ${
            locale === lang.code
              ? 'bg-accent text-primary'
              : 'bg-secondary text-gray-300 hover:text-accent'
          }`}
        >
          {lang.flag} {lang.label}
        </motion.button>
      ))}
    </div>
  )
}
