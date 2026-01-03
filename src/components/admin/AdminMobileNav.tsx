'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  Image,
  Settings
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminMobileNav() {
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(() => {
    setHash(window.location.hash)
    const handleHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin/dashboard' || pathname === '/admin'
    },
    {
      href: '/admin/calendar',
      label: 'Calendrier',
      icon: Calendar,
      active: pathname === '/admin/calendar'
    },
    {
      href: '/admin/gallery',
      label: 'Images',
      icon: Image,
      active: pathname === '/admin/gallery'
    },
    {
      href: '/admin/dashboard#bookings',
      label: 'Réservations',
      icon: Settings,
      active: pathname === '/admin/dashboard' && hash === '#bookings'
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