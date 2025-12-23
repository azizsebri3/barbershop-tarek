'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import { usePublicGeneralSettings } from '@/lib/usePublicGeneralSettings'

export default function Footer() {
  const { t } = useLanguage()
  const { settings } = usePublicGeneralSettings()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary border-t border-secondary py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
        >
          <div>
            <h3 className="text-accent font-bold text-lg mb-4">✂️ {settings.salonName}</h3>
            <p className="text-gray-400">{settings.description}</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{t.nav.home}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-accent transition-colors">{t.nav.home}</Link></li>
              <li><Link href="/pricing" className="hover:text-accent transition-colors">{t.nav.services}</Link></li>
              <li><Link href="/pricing" className="hover:text-accent transition-colors">{t.nav.pricing}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{t.hours.phone}</h4>
            <p className="text-gray-400">Email: {settings.email}</p>
            <p className="text-gray-400">{settings.phone}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="border-t border-secondary pt-8 text-center text-gray-500 text-sm"
        >
          <p>&copy; {currentYear} {settings.salonName}. {t.cta.title}.</p>
        </motion.div>
      </div>
    </footer>
  )
}
