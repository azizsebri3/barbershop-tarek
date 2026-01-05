'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Scissors, Calendar, Phone } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// Mobile bottom navigation component

export default function MobileBottomNav() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(() => {
    setHash(window.location.hash)
    const handleHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Masquer sur les pages admin
  if (pathname.startsWith('/admin')) {
    return null
  }

  const navItems = [
    {
      href: '/',
      label: t.nav.home,
      icon: Home,
      active: (pathname === '/' || pathname === '/fr' || pathname === '/en' || pathname === '/fr/' || pathname === '/en/') && hash === ''
    },
    {
      href: '/#services',
      label: t.nav.services,
      icon: Scissors,
      active: (pathname === '/' || pathname === '/fr' || pathname === '/en' || pathname === '/fr/' || pathname === '/en/') && hash === '#services'
    },
    {
      href: '/booking',
      label: t.nav.booking,
      icon: Calendar,
      active: pathname.includes('/booking')
    },
    {
      href: '/#contact',
      label: 'Contact',
      icon: Phone,
      active: (pathname === '/' || pathname === '/fr' || pathname === '/en' || pathname === '/fr/' || pathname === '/en/') && hash === '#contact'
    }
  ]

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 safe-area-bottom"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300 min-w-0 flex-1 ${
                item.active
                  ? 'bg-accent/20 text-accent'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}