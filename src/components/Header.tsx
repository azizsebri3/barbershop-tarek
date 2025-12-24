'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Settings, LogOut, Bell, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '@/lib/language-context'
import { usePublicGeneralSettings } from '@/lib/usePublicGeneralSettings'
import { isAdminAuthenticated, clearAdminSession, getSessionInfo } from '@/lib/admin-auth'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<{ expiresIn: string } | null>(null)
  const { t } = useLanguage()
  const { settings } = usePublicGeneralSettings()

  useEffect(() => {
    // Vérifier le statut admin
    const checkAdmin = () => {
      const authenticated = isAdminAuthenticated()
      setIsAdmin(authenticated)
      if (authenticated) {
        setSessionInfo(getSessionInfo())
      }
    }
    checkAdmin()
    
    // Revérifier périodiquement (pour détecter les changements de session)
    const interval = setInterval(checkAdmin, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAdminLogout = () => {
    clearAdminSession()
    setIsAdmin(false)
    setShowAdminMenu(false)
  }

  return (
    <header className={`fixed top-0 w-full backdrop-blur-md z-50 border-b ${isAdmin ? 'bg-secondary/95 border-accent/30' : 'bg-primary/95 border-secondary'}`}>
      {/* Admin Banner */}
      {isAdmin && (
        <div className="bg-accent/10 border-b border-accent/20 px-4 py-1">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <span className="text-accent font-medium flex items-center gap-2">
              <Settings size={12} className="animate-spin-slow" />
              Mode Administrateur
            </span>
            <span className="text-gray-400">
              Session: {sessionInfo?.expiresIn || 'Active'}
            </span>
          </div>
        </div>
      )}
      
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="text-xl sm:text-2xl font-bold text-accent whitespace-nowrap flex items-center gap-2">
            ✂️ {settings.salonName}
            {isAdmin && (
              <span className="text-xs bg-accent text-primary px-2 py-0.5 rounded-full font-bold">
                ADMIN
              </span>
            )}
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

          {/* Admin Controls */}
          {isAdmin ? (
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors text-sm font-medium border border-accent/30"
              >
                <LayoutDashboard size={16} />
                <span className="hidden lg:inline">Admin Panel</span>
              </button>
              
              {/* Admin Dropdown Menu */}
              {showAdminMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-56 bg-secondary border border-accent/30 rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-3 border-b border-accent/20">
                    <p className="text-xs text-gray-400">Connecté en tant qu&apos;admin</p>
                    <p className="text-sm text-accent font-medium">{sessionInfo?.expiresIn || 'Session active'}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-accent/10 hover:text-white rounded-lg transition-colors"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      <LayoutDashboard size={16} />
                      Tableau de bord
                    </Link>
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-accent/10 hover:text-white rounded-lg transition-colors"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      <Bell size={16} />
                      Réservations
                    </Link>
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-accent/10 hover:text-white rounded-lg transition-colors"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      <Settings size={16} />
                      Paramètres
                    </Link>
                  </div>
                  <div className="p-2 border-t border-accent/20">
                    <button
                      onClick={handleAdminLogout}
                      className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      Déconnexion Admin
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <Link
              href="/admin"
              className="text-gray-500 hover:text-accent transition-colors text-xs opacity-50 hover:opacity-100"
              title="Administration"
            >
              ⚙️
            </Link>
          )}

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
            
            {/* Mobile Admin Controls */}
            {isAdmin && (
              <div className="pt-3 mt-3 border-t border-accent/20 space-y-2">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-2 bg-accent/20 text-accent rounded-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Admin Panel
                </Link>
                <button
                  onClick={() => {
                    handleAdminLogout()
                    setIsOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <LogOut size={18} />
                  Déconnexion Admin
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </header>
  )
}
