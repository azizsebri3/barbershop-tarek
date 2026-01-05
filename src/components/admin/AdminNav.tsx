'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Image, LogOut, X, CheckCircle } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminNav() {
  const pathname = usePathname()
  const { logout } = useAdminAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      setShowLogoutModal(false)
      setShowSuccessModal(true)
      // Redirect after showing success message
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      toast.error('Erreur lors de la déconnexion')
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/gallery',
      label: 'Galerie Photos',
      icon: Image,
    },
  ]

  return (
    <nav className="bg-secondary/80 backdrop-blur-md border-b border-accent/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">Admin Tarek Salon</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-accent text-primary'
                        : 'text-gray-300 hover:bg-accent/10 hover:text-accent'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline font-medium">Déconnexion</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex pb-3 space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent text-primary'
                      : 'text-gray-400 hover:text-accent'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !isLoggingOut && setShowLogoutModal(false)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-gradient-to-br from-secondary to-primary border-2 border-accent/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-black/50 z-10"
            >
              <button
                onClick={() => !isLoggingOut && setShowLogoutModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                disabled={isLoggingOut}
              >
                <X size={20} />
              </button>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/30">
                  <LogOut className="text-red-400" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Confirmer la déconnexion</h3>
                <p className="text-gray-300 mb-8 text-base">
                  Êtes-vous sûr de vouloir vous déconnecter de votre session admin?
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Déconnexion...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={20} />
                        <span>Oui, me déconnecter</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    disabled={isLoggingOut}
                    className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-gradient-to-br from-secondary to-primary border-2 border-green-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-black/50 z-10"
            >
              <div className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/30"
                >
                  <CheckCircle className="text-green-400" size={36} />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">Déconnexion réussie!</h3>
                <p className="text-gray-300 mb-6 text-base">
                  Vous avez été déconnecté avec succès. Redirection en cours...
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-3 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
