'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Clock,
  Scissors,
  Image,
  Building,
  Calendar,
  Bell,
  History,
  Star,
  Palette,
  LogOut,
  X,
  CheckCircle
} from 'lucide-react'
import AdminHours from '@/components/admin/AdminHours'
import AdminServices from '@/components/admin/AdminServices'
import AdminGeneral from '@/components/admin/AdminGeneral'
import AdminImages from '@/components/admin/AdminImages'
import AdminBookings from '@/components/admin/AdminBookings'
import AdminHistory from '@/components/admin/AdminHistory'
import AdminTestimonials from '@/components/admin/AdminTestimonials'
import AdminBranding from '@/components/admin/AdminBranding'
import PushNotificationToggle from '@/components/admin/PushNotificationToggle'
import ProfileManagement from '@/components/admin/ProfileManagement'
import { useLanguage } from '@/lib/language-context'
import { supabase } from '@/lib/supabase'
import { renewAdminSession, getSessionInfo } from '@/lib/admin-auth'
import { useAdminAuth } from '@/lib/useAdminAuth'

type TabType = 'general' | 'hours' | 'services' | 'images' | 'bookings' | 'history' | 'testimonials' | 'branding' | 'notifications' | 'profile'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<{ expiresIn: string; rememberMe: boolean } | null>(null)
  const router = useRouter()
  const { isAdmin, loading, logout } = useAdminAuth()

  const tabs = [
    { id: 'general' as TabType, label: t.admin.general, icon: Building },
    { id: 'hours' as TabType, label: t.admin.hours, icon: Clock },
    { id: 'services' as TabType, label: t.admin.services, icon: Scissors },
    { id: 'images' as TabType, label: t.admin.images, icon: Image },
    { id: 'branding' as TabType, label: 'Logo & Branding', icon: Palette },
    { id: 'profile' as TabType, label: 'Mon Profil', icon: Settings },
    { id: 'bookings' as TabType, label: t.admin.bookings, icon: Calendar, badge: pendingCount },
    { id: 'history' as TabType, label: 'History', icon: History },
    { id: 'testimonials' as TabType, label: 'Customer Reviews', icon: Star },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  ]

  const fetchPendingCount = useCallback(async () => {
    try {
      const { count, error } = await supabase!
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (!error && count !== null) {
        setPendingCount(count)
      }
    } catch (error) {
      console.error('Error counting bookings:', error)
    }
  }, [])

  useEffect(() => {
    if (loading) return
    
    if (!isAdmin) {
      router.push('/admin')
    } else {
      setIsAuthenticated(true)
      renewAdminSession() // Renew session on each visit
      setSessionInfo(getSessionInfo())
      fetchPendingCount()
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000)
      return () => clearInterval(interval)
    }
    return undefined
  }, [isAdmin, loading, router, fetchPendingCount])

  // Handle URL parameters for tab navigation
  useEffect(() => {
    if (!isAuthenticated) return

    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab') as TabType
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Update URL when tab changes
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId)
    // Scroll to top
    window.scrollTo(0, 0)
    // Update URL without causing a page reload
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tabId)
    window.history.replaceState({}, '', url.toString())
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      setShowLogoutModal(false)
      setShowSuccessModal(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  // Handle hash navigation for mobile nav
  useEffect(() => {
    const handleTabChangeEvent = (event: CustomEvent) => {
      const tabId = event.detail as TabType
      setActiveTab(tabId)
    }
""
    window.addEventListener('changeAdminTab', handleTabChangeEvent as EventListener)
    return () => window.removeEventListener('changeAdminTab', handleTabChangeEvent as EventListener)
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary">
      {/* Mobile Header */}
      <header className="lg:hidden bg-secondary/50 backdrop-blur-md border-b border-accent/20">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Settings className="text-accent" size={20} />
              <h1 className="text-lg font-bold text-white">Admin</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <div className="lg:w-80 lg:flex-shrink-0">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block h-full bg-secondary/50 backdrop-blur-md border-r border-accent/20">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="text-accent" size={24} />
                  <h1 className="text-xl font-bold text-white">Administration</h1>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={20} />
                </button>
              </div>

              {/* Quick Stats */}
              {pendingCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg cursor-pointer hover:bg-amber-500/20 transition-colors"
                  onClick={() => handleTabChange('bookings')}
                >
                  <div className="flex items-center gap-2 text-amber-400">
                    <Calendar size={18} />
                    <span className="font-semibold">{pendingCount} pending booking(s)</span>
                  </div>
                </motion.div>
              )}

              {/* Session Info */}
              {sessionInfo && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-400">
                    ✓ Session active ({sessionInfo.expiresIn})
                  </p>
                </div>
              )}

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-accent text-primary'
                          : 'text-gray-300 hover:bg-accent/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        {tab.label}
                      </div>
                      {tab.badge && tab.badge > 0 && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          activeTab === tab.id 
                            ? 'bg-primary/30 text-primary' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 lg:p-8 pb-20 lg:pb-8"
          >
            {activeTab === 'general' && <AdminGeneral />}
            {activeTab === 'hours' && <AdminHours />}
            {activeTab === 'services' && <AdminServices />}
            {activeTab === 'images' && <AdminImages />}
            {activeTab === 'branding' && <AdminBranding />}
            {activeTab === 'profile' && <ProfileManagement />}
            {activeTab === 'bookings' && <AdminBookings onStatusChange={fetchPendingCount} />}
            {activeTab === 'history' && <AdminHistory />}
            {activeTab === 'testimonials' && <AdminTestimonials />}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-accent">Push Notifications</h2>
                <p className="text-gray-400">
                  Enable notifications to receive an alert on your phone 
                  for each new booking, even when the site is closed.
                </p>
                <PushNotificationToggle />
                
                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h3 className="font-semibold text-blue-400 mb-2">📱 How to install the PWA app?</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li><strong>On iPhone/iPad:</strong> Safari → Share → &quot;Add to Home Screen&quot;</li>
                    <li><strong>On Android:</strong> Chrome → Menu ⋮ → &quot;Install app&quot;</li>
                    <li><strong>On Desktop:</strong> Chrome → Address bar → Install icon</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-md border-t border-accent/20 z-40">
          <div className="flex items-center justify-around px-2 py-2">
            {tabs.slice(0, 5).map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                    isActive
                      ? 'bg-accent/20 text-accent'
                      : 'text-gray-400 hover:text-white hover:bg-accent/5'
                  }`}
                >
                  <div className="relative">
                    <Icon size={18} />
                    {tab.badge && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium truncate ${
                    isActive ? 'text-accent' : 'text-gray-400'
                  }`}>
                    {tab.label.length > 8 ? tab.label.substring(0, 8) + '...' : tab.label}
                  </span>
                </button>
              )
            })}
          </div>
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
    </div>
  )
}