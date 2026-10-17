'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, LogOut, LayoutDashboard, Home, Info, Scissors, Tag, Phone } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '@/lib/language-context'
import { usePublicGeneralSettings } from '@/lib/usePublicGeneralSettingsCached'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const { t, locale } = useLanguage()
  const { settings } = usePublicGeneralSettings()
  const { isAdmin, logout } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

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
    { href: `/${locale}`, label: t.nav.home, icon: Home, active: pathname === `/${locale}` || pathname === `/${locale}/` || pathname === '/' },
    { href: `/${locale}/#about`, label: t.nav.about, icon: Info, active: false },
    { href: `/${locale}/#services`, label: t.nav.services, icon: Scissors, active: false },
    { href: '/pricing', label: t.nav.pricing, icon: Tag, active: pathname.includes('/pricing') },
    { href: `/${locale}/#contact`, label: t.nav.contact, icon: Phone, active: false },
  ], [locale, pathname, t.nav.about, t.nav.contact, t.nav.home, t.nav.pricing, t.nav.services])

  return (
    <>
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'pt-2 sm:pt-3' 
          : 'pt-3 sm:pt-5'
      }`}
      role="banner"
      suppressHydrationWarning
    >
      <nav className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 transition-all duration-500 ${scrolled ? 'h-[4.5rem]' : 'h-16 sm:h-[4.5rem]'}`}>
        <div className="w-full h-full px-3 sm:px-4 rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl shadow-2xl shadow-black/20 flex justify-between items-center">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src={settings.logo_url || '/logo.svg'}
            alt={settings.salonName}
            className={`object-contain rounded-full bg-black/30 p-1 ring-1 ring-white/20 group-hover:ring-accent/70 transition-all duration-500 ease-out ${
              scrolled ? 'w-11 h-11 scale-105' : 'w-10 h-10 scale-100'
            }`}
          />
          <div className="hidden sm:block leading-tight">
            <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-white group-hover:text-accent transition-colors duration-300">
              {settings.salonName}
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/55">Barbershop</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] uppercase tracking-[0.12em] font-semibold transition-all duration-200 ${
                link.active
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-white/65 hover:text-white hover:bg-white/5'
              }`}
              suppressHydrationWarning
            >
                <link.icon size={14} className={link.active ? 'text-accent' : 'text-white/45'} />
                {link.label}
            </Link>
          ))}

          {/* CTA Button */}
          <Link
            href="/booking"
            className="ml-2 px-4 py-2.5 bg-accent hover:bg-orange-300 text-primary rounded-xl font-black text-[10px] uppercase tracking-[0.12em] transition-all duration-300 hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5"
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
        <div className="lg:hidden flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-xl bg-accent text-primary hover:bg-orange-300 shadow-lg shadow-accent/20 transition-all duration-200 flex items-center justify-center"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
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
            className="lg:hidden overflow-hidden border-t border-white/10"
          >
            <div className="mx-3 mt-2 rounded-2xl border border-white/10 bg-[#111111]/95 backdrop-blur-2xl shadow-2xl">
              <div className="px-3 py-3 space-y-1">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors duration-200 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon size={17} className="text-accent" />
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile CTA */}
                <Link
                  href="/booking"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 mt-3 bg-accent text-primary rounded-xl font-black shadow-lg shadow-accent/20"
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
    </header>

    {/* Logout Confirmation Modal - Outside header for proper centering */}
    <AnimatePresence>
      {showLogoutModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
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
              <h3 className="text-3xl font-bold text-white mb-4">Confirm Logout</h3>
              <p className="text-gray-300 mb-8 text-lg">
                Are you sure you want to logout from your admin session?
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
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut size={24} />
                      <span>Yes, logout</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="w-full px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold text-xl disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
