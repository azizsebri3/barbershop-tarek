'use client'

import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLanguage('fr')}
        className={`px-3 py-2 rounded-lg font-bold transition-all text-sm ${
          language === 'fr'
            ? 'bg-accent text-primary'
            : 'bg-secondary text-gray-300 hover:text-accent'
        }`}
      >
        FR
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLanguage('en')}
        className={`px-3 py-2 rounded-lg font-bold transition-all text-sm ${
          language === 'en'
            ? 'bg-accent text-primary'
            : 'bg-secondary text-gray-300 hover:text-accent'
        }`}
      >
        EN
      </motion.button>
    </div>
  )
}
