'use client'

import { useState, useEffect } from 'react'
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
  Bell
} from 'lucide-react'
import AdminHours from '@/components/admin/AdminHours'
import AdminServices from '@/components/admin/AdminServices'
import AdminGeneral from '@/components/admin/AdminGeneral'
import AdminImages from '@/components/admin/AdminImages'
import AdminBookings from '@/components/admin/AdminBookings'
import PushNotificationToggle from '@/components/admin/PushNotificationToggle'
import { useLanguage } from '@/lib/language-context'

type TabType = 'general' | 'hours' | 'services' | 'images' | 'bookings' | 'notifications'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('adminAuthenticated')
    if (!auth) {
      router.push('/admin')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
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
    { id: 'bookings' as TabType, label: t.admin.bookings, icon: Calendar },
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
            <button
              onClick={handleLogout}
              className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
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
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                      activeTab === tab.id
                        ? 'bg-accent text-primary'
                        : 'text-gray-400 hover:text-accent'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs mt-1 truncate">{tab.label}</span>
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
                <button
                  onClick={handleLogout}
                  className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-accent text-primary'
                          : 'text-gray-300 hover:bg-accent/10 hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      {tab.label}
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
            {activeTab === 'bookings' && <AdminBookings />}
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