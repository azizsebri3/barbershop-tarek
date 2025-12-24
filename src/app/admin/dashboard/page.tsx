'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Settings,
  Clock,
  Scissors,
  Image,
  Building,
  LogOut,
  Calendar,
  Bell,
  History
} from 'lucide-react'
import AdminHours from '@/components/admin/AdminHours'
import AdminServices from '@/components/admin/AdminServices'
import AdminGeneral from '@/components/admin/AdminGeneral'
import AdminImages from '@/components/admin/AdminImages'
import AdminBookings from '@/components/admin/AdminBookings'
import AdminHistory from '@/components/admin/AdminHistory'
import PushNotificationToggle from '@/components/admin/PushNotificationToggle'
import { useLanguage } from '@/lib/language-context'
import { supabase } from '@/lib/supabase'
import { isAdminAuthenticated, clearAdminSession, renewAdminSession, getSessionInfo } from '@/lib/admin-auth'

type TabType = 'general' | 'hours' | 'services' | 'images' | 'bookings' | 'history' | 'notifications'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<{ expiresIn: string; rememberMe: boolean } | null>(null)
  const router = useRouter()

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
      console.error('Erreur comptage réservations:', error)
    }
  }, [])

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin')
    } else {
      setIsAuthenticated(true)
      renewAdminSession() // Renouveler la session à chaque visite
      setSessionInfo(getSessionInfo())
      fetchPendingCount()
      // Actualiser toutes les 30 secondes
      const interval = setInterval(fetchPendingCount, 30000)
      return () => clearInterval(interval)
    }
    return undefined
  }, [router, fetchPendingCount])

  const handleLogout = () => {
    clearAdminSession()
    router.push('/admin')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'general' as TabType, label: t.admin.general, icon: Building },
    { id: 'hours' as TabType, label: t.admin.hours, icon: Clock },
    { id: 'services' as TabType, label: t.admin.services, icon: Scissors },
    { id: 'images' as TabType, label: t.admin.images, icon: Image },
    { id: 'bookings' as TabType, label: t.admin.bookings, icon: Calendar, badge: pendingCount },
    { id: 'history' as TabType, label: 'Historique', icon: History },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
  ]

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
            <div className="flex items-center gap-3">
              {/* Notification Bell Mobile */}
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown)
                  if (pendingCount > 0) setActiveTab('bookings')
                }}
                className="relative p-2 text-gray-400 hover:text-accent transition-colors"
              >
                <Bell size={20} />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar - Mobile Bottom Navigation */}
        <div className="lg:w-80 lg:flex-shrink-0">
          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-md border-t border-accent/20 z-50">
            <div className="flex justify-around py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1 relative ${
                      activeTab === tab.id
                        ? 'bg-accent text-primary'
                        : 'text-gray-400 hover:text-accent'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs mt-1 truncate">{tab.label}</span>
                    {tab.badge && tab.badge > 0 && (
                      <span className="absolute top-0 right-1/4 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block h-full bg-secondary/50 backdrop-blur-md border-r border-accent/20">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="text-accent" size={24} />
                  <h1 className="text-xl font-bold text-white">Administration</h1>
                </div>
                <div className="flex items-center gap-2">
                  {/* Notification Bell Desktop */}
                  <button
                    onClick={() => {
                      if (pendingCount > 0) setActiveTab('bookings')
                    }}
                    className="relative p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    title={`${pendingCount} réservation(s) en attente`}
                  >
                    <Bell size={20} />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {pendingCount > 9 ? '9+' : pendingCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              {pendingCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg cursor-pointer hover:bg-amber-500/20 transition-colors"
                  onClick={() => setActiveTab('bookings')}
                >
                  <div className="flex items-center gap-2 text-amber-400">
                    <Calendar size={18} />
                    <span className="font-semibold">{pendingCount} réservation(s) en attente</span>
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
                      onClick={() => setActiveTab(tab.id)}
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
        <div className="flex-1 pb-20 lg:pb-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 lg:p-8"
          >
            {activeTab === 'general' && <AdminGeneral />}
            {activeTab === 'hours' && <AdminHours />}
            {activeTab === 'services' && <AdminServices />}
            {activeTab === 'images' && <AdminImages />}
            {activeTab === 'bookings' && <AdminBookings onStatusChange={fetchPendingCount} />}
            {activeTab === 'history' && <AdminHistory />}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-accent">Notifications Push</h2>
                <p className="text-gray-400">
                  Activez les notifications pour recevoir une alerte sur votre téléphone 
                  à chaque nouvelle réservation, même quand le site est fermé.
                </p>
                <PushNotificationToggle />
                
                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h3 className="font-semibold text-blue-400 mb-2">📱 Comment installer l&apos;app PWA ?</h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li><strong>Sur iPhone/iPad:</strong> Safari → Partager → &quot;Sur l&apos;écran d&apos;accueil&quot;</li>
                    <li><strong>Sur Android:</strong> Chrome → Menu ⋮ → &quot;Installer l&apos;application&quot;</li>
                    <li><strong>Sur Desktop:</strong> Chrome → Barre d&apos;adresse → Icône d&apos;installation</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}