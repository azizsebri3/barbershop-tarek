'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, LogOut, LayoutDashboard } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '@/lib/language-context'
import { usePublicGeneralSettings } from '@/lib/usePublicGeneralSettingsCached'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const { t } = useLanguage()
  const { settings } = usePublicGeneralSettings()
  const { isAdmin, login, logout } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    // Handle scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch pending bookings count for admin
  useEffect(() => {
    if (!isAdmin) return

    const fetchPendingCount = async () => {
      try {
        const { count, error } = await supabase!
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        if (!error && count !== null) {
          setPendingCount(count)
        }
      } catch (error) {
        console.error('Erreur comptage réservations:', error)
      }
    }

    fetchPendingCount()
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [isAdmin])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      logout()
      toast.success('Déconnexion réussie')
      router.push('/')
    } catch (error) {
      toast.error('Erreur lors de la déconnexion')
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }



  const navLinks = useMemo(() => [
    { href: '/', label: t.nav.home },
    { href: '/#services', label: t.nav.services },
  ], [t.nav.home, t.nav.services])

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-2xl shadow-2xl shadow-black/40' 
          : 'bg-black/80 backdrop-blur-md'
      }`}
      role="banner"
      suppressHydrationWarning
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Logo - Clean & Aligned */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-accent/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-full h-full bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-accent/50 transition-all duration-300">
              <img 
                src={settings.logo_url || '/logo.png'} 
                alt={settings.salonName}
                className="w-full h-full object-contain p-2"
              />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-white group-hover:text-accent transition-colors duration-300">
              {settings.salonName}
            </h1>
            <p className="text-[10px] text-gray-500">Premium Barbershop</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
              suppressHydrationWarning
            >
              {link.label}
            </Link>
          ))}

          {/* CTA Button */}
          <Link
            href="/booking"
            className="px-5 py-2 bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-500 hover:to-accent text-black rounded-lg font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-accent/30"
            suppressHydrationWarning
          >
            {t.nav.booking}
          </Link>

          {/* Language & Admin Controls */}
          <div className="flex items-center gap-3 ml-3 pl-3 border-l border-white/10">
            <LanguageSwitcher />
            {isAdmin ? (
              <>
                {/* Notification Bell */}
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="relative p-2 text-gray-300 hover:text-accent rounded-lg hover:bg-white/5 transition-colors duration-200"
                  title={`${pendingCount} réservation(s) en attente`}
                >
                  <Bell size={18} />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </button>

                {/* Admin Dashboard */}
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <LayoutDashboard size={16} />
                  <span className="hidden lg:inline">Admin</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                <LayoutDashboard size={16} />
                <span className="hidden lg:inline">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors duration-200"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <div className="bg-black/95 backdrop-blur-xl">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile CTA */}
                <Link
                  href="/booking"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 mt-3 bg-gradient-to-r from-accent to-yellow-500 text-black rounded-lg font-bold shadow-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {t.nav.booking}
                </Link>
                
                {/* Mobile Admin */}
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 w-full px-4 py-3 mt-3 bg-white/5 text-white rounded-lg font-medium border border-white/10"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={20} />
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 w-full px-4 py-3 mt-3 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg font-medium border border-white/10 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={20} />
                    Login
                  </Link>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !isLoggingOut && setShowLogoutModal(false)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-gradient-to-br from-secondary to-primary border-2 border-accent/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black/50 z-10"
            >
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/30">
                  <LogOut className="text-red-400" size={48} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Confirmer la déconnexion</h3>
                <p className="text-gray-300 mb-8 text-lg">
                  Voulez-vous vraiment vous déconnecter de votre session administrateur ?
                </p>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-red-500/20"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Déconnexion en cours...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={24} />
                        <span>Oui, me déconnecter</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    disabled={isLoggingOut}
                    className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold text-xl disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
