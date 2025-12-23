'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '@/lib/language-context'
import { usePublicGeneralSettings } from '@/lib/usePublicGeneralSettings'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()
  const { settings } = usePublicGeneralSettings()

  return (
    <header className="fixed top-0 w-full bg-primary/95 backdrop-blur-md z-50 border-b border-secondary">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="text-xl sm:text-2xl font-bold text-accent whitespace-nowrap">
            ✂️ {settings.salonName}
          </Link>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-medium"
          >
            <li>
              <Link href="/" className="text-gray-300 hover:text-accent transition-colors">
                {t.nav.home}
              </Link>
            </li>
            <li>
              <Link href="/#services" className="text-gray-300 hover:text-accent transition-colors">
                {t.nav.services}
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-gray-300 hover:text-accent transition-colors">
                {t.nav.pricing}
              </Link>
            </li>
            <li>
              <Link href="/booking" className="px-3 sm:px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 transition-colors text-xs sm:text-sm font-bold">
                {t.nav.booking}
              </Link>
            </li>
          </motion.ul>

          {/* Admin Link (discret) */}
          <Link
            href="/admin"
            className="text-gray-500 hover:text-accent transition-colors text-xs opacity-50 hover:opacity-100"
            title="Administration"
          >
            ⚙️
          </Link>

          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} className="text-accent" /> : <Menu size={24} className="text-accent" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-primary border-t border-secondary"
        >
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-300 hover:text-accent transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {t.nav.home}
            </Link>
            <Link
              href="/pricing"
              className="block text-gray-300 hover:text-accent transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {t.nav.services}
            </Link>
            <Link
              href="/pricing"
              className="block text-gray-300 hover:text-accent transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {t.nav.pricing}
            </Link>
            <Link
              href="/booking"
              className="block w-full px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 transition-colors text-center font-bold"
              onClick={() => setIsOpen(false)}
            >
              {t.nav.booking}
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  )
}
