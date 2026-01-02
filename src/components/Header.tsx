'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard, Sparkles, ChevronRight, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '@/lib/language-context'
import { usePublicGeneralSettings } from '@/lib/usePublicGeneralSettings'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const { t } = useLanguage()
  const { settings } = usePublicGeneralSettings()

  useEffect(() => {
    // Vérifier le statut admin
    const checkAdmin = () => {
      const authenticated = isAdminAuthenticated()
      setIsAdmin(authenticated)
    }
    checkAdmin()
    
    // Revérifier périodiquement (pour détecter les changements de session)
    const interval = setInterval(checkAdmin, 5000)
    return () => clearInterval(interval)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAdminLogin = () => {
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
    if (adminPassword === ADMIN_PASSWORD) {
      // Simuler l'authentification (vous pouvez remplacer par une vraie logique)
      localStorage.setItem('admin_auth', 'true')
      localStorage.setItem('admin_login_time', Date.now().toString())
      setIsAdmin(true)
      setShowAdminModal(false)
      setAdminPassword('')
    } else {
      alert('Mot de passe incorrect')
      setAdminPassword('')
    }
  }

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/#services', label: t.nav.services },
    { href: '/pricing', label: t.nav.pricing },
  ]

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' 
        : 'bg-transparent'
    } ${isAdmin ? 'border-accent/30' : ''}`}>
      {/* Admin Banner */}
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 border-b border-accent/20 px-4 py-1.5"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <span className="text-accent font-medium flex items-center gap-2">
              <Shield size={12} />
              Mode Administrateur
            </span>
            <span className="text-gray-400">
              Session Active
            </span>
          </div>
        </motion.div>
      )}
      
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent/20 to-yellow-500/20 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-accent/20 border border-accent/20">
                <img 
                  src={settings.logo_url || '/logo.png'} 
                  alt={settings.salonName}
                  className="w-full h-full object-contain p-1"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-white group-hover:text-accent transition-colors">
                {settings.salonName}
              </span>
              {isAdmin && (
                <span className="text-[10px] bg-gradient-to-r from-accent to-yellow-500 text-black px-2 py-0.5 rounded-full font-bold w-fit">
                  ADMIN
                </span>
              )}
            </div>
          </Link>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-1 p-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10"
          >
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-full transition-all duration-300 hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="group relative px-5 py-2 bg-gradient-to-r from-accent to-yellow-500 text-black rounded-full font-bold text-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/30"
            >
              <span className="relative z-10 flex items-center gap-1">
                {t.nav.booking}
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.div>

          {/* Admin Controls */}
          {isAdmin ? (
            <Link
              href="/admin/dashboard"
              className="ml-2"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-full transition-all duration-300 text-sm font-medium border border-accent/30 backdrop-blur-md"
              >
                <LayoutDashboard size={16} />
                <span className="hidden lg:inline">Admin</span>
              </motion.button>
            </Link>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdminModal(true)}
              className="ml-2 p-2.5 text-gray-500 hover:text-accent hover:bg-white/5 rounded-full transition-all duration-300 opacity-50 hover:opacity-100"
              title="Accès Administration"
            >
              <Shield size={18} />
            </motion.button>
          )}

          <div className="ml-2">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <LanguageSwitcher />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={22} className="text-accent" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={22} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
          >
            <div className="bg-black/95 backdrop-blur-xl border-t border-white/10">
              <div className="px-4 py-6 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between px-4 py-3.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="font-medium">{link.label}</span>
                      <ChevronRight size={18} className="text-gray-500" />
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2"
                >
                  <Link
                    href="/booking"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-accent to-yellow-500 text-black rounded-xl font-bold text-base shadow-lg shadow-accent/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <Sparkles size={18} />
                    {t.nav.booking}
                  </Link>
                </motion.div>
                
                {/* Mobile Admin Controls */}
                {isAdmin ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 mt-4 border-t border-white/10 space-y-2"
                  >
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-4 py-3.5 bg-accent/10 text-accent rounded-xl font-medium border border-accent/20"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard size={20} />
                      Admin Panel
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 mt-4 border-t border-white/10"
                  >
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        setShowAdminModal(true)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3.5 text-gray-400 hover:text-accent hover:bg-white/5 rounded-xl transition-all duration-200"
                    >
                      <Shield size={20} />
                      Accès Admin
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Authentication Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdminModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-secondary rounded-2xl p-6 w-full max-w-md border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Shield className="text-accent" size={24} />
                  Accès Administration
                </h3>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe administrateur
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Entrez le mot de passe"
                    className="w-full px-4 py-3 bg-primary border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdminLogin}
                  className="w-full py-3 bg-gradient-to-r from-accent to-yellow-500 text-black rounded-xl font-bold text-base shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all duration-300"
                >
                  Accéder au panneau admin
                </motion.button>
                <p className="text-xs text-gray-500 text-center">
                  Contactez l&apos;administrateur pour obtenir le mot de passe
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
