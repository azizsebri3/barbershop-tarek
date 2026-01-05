'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Image,
  Settings,
  Clock,
  Scissors,
  LogOut,
  X
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminMobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAdminAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      logout()
      toast.success('Logout successful')
      router.push('/admin')
    } catch (error) {
      toast.error('Error during logout')
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const navItems = [
    {
      id: 'general',
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => {
        window.scrollTo(0, 0)
        if (pathname !== '/admin/dashboard') {
          router.push('/admin/dashboard')
        }
      }
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Settings,
      onClick: () => {
        window.scrollTo(0, 0)
        if (pathname !== '/admin/dashboard') {
          router.push('/admin/dashboard')
        }
        window.dispatchEvent(new CustomEvent('changeAdminTab', { detail: 'bookings' }))
      }
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: Image,
      onClick: () => {
        window.scrollTo(0, 0)
        if (pathname !== '/admin/dashboard') {
          router.push('/admin/dashboard')
        }
        window.dispatchEvent(new CustomEvent('changeAdminTab', { detail: 'images' }))
      }
    },
    {
      id: 'services',
      label: 'Services',
      icon: Scissors,
      onClick: () => {
        window.scrollTo(0, 0)
        if (pathname !== '/admin/dashboard') {
          router.push('/admin/dashboard')
        }
        window.dispatchEvent(new CustomEvent('changeAdminTab', { detail: 'services' }))
      }
    },
    {
      id: 'hours',
      label: 'Hours',
      icon: Clock,
      onClick: () => {
        window.scrollTo(0, 0)
        if (pathname !== '/admin/dashboard') {
          router.push('/admin/dashboard')
        }
        window.dispatchEvent(new CustomEvent('changeAdminTab', { detail: 'hours' }))
      }
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      onClick: () => setShowLogoutModal(true)
    }
  ]

  return (
    <>
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-md border-t border-accent/20 z-50 overflow-x-auto"
      >
        <div className="flex gap-1 py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === 'general' && pathname === '/admin/dashboard'
            const isLogout = item.id === 'logout'
            
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[70px] ${
                  isLogout
                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    : isActive
                    ? 'bg-accent text-primary'
                    : 'text-gray-400 hover:text-accent'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs mt-1 truncate max-w-[60px]">{item.label}</span>
              </button>
            )
          })}
        </div>
      </motion.nav>

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
                <h3 className="text-2xl font-bold text-white mb-3">Confirm logout</h3>
                <p className="text-gray-300 mb-8 text-base">
                  Are you sure you want to logout from your admin session?
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
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={20} />
                        <span>Yes, logout</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    disabled={isLoggingOut}
                    className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
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
