'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Star,
  MessageSquare,
  Settings,
  BarChart3
} from 'lucide-react'
import type { Booking } from '@/lib/supabase'
import { useGeneralSettings } from '@/lib/useGeneralSettings'
import type { BookingMode } from '@/lib/booking'
import AdminToday from './AdminToday'

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  todayBookings: number
  totalRevenue: number
  avgRating: number
}

export default function AdminGeneral() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    avgRating: 0
  })
  const [loading, setLoading] = useState(true)
  const { settings, updateSettings } = useGeneralSettings()
  const [bookingMode, setBookingMode] = useState<BookingMode>('choice')
  const [savingBookingMode, setSavingBookingMode] = useState(false)
  const [bookingModeMessage, setBookingModeMessage] = useState('')
  const [autoConfirmBookings, setAutoConfirmBookings] = useState(false)
  const [savingAutoConfirm, setSavingAutoConfirm] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  useEffect(() => {
    if (settings.bookingMode) setBookingMode(settings.bookingMode as BookingMode)
    if (typeof settings.autoConfirmBookings === 'boolean') {
      setAutoConfirmBookings(settings.autoConfirmBookings)
    }
  }, [settings.bookingMode, settings.autoConfirmBookings])

  const handleBookingModeChange = async (mode: BookingMode) => {
    setBookingMode(mode)
    setSavingBookingMode(true)
    setBookingModeMessage('')
    try {
      await updateSettings({ bookingMode: mode })
      setBookingModeMessage('Booking mode saved.')
    } catch {
      setBookingModeMessage('Unable to save the booking mode.')
    } finally {
      setSavingBookingMode(false)
    }
  }

  const handleAutoConfirmChange = async (enabled: boolean) => {
    setAutoConfirmBookings(enabled)
    setSavingAutoConfirm(true)
    try {
      await updateSettings({ autoConfirmBookings: enabled })
    } catch {
      setAutoConfirmBookings(!enabled)
    } finally {
      setSavingAutoConfirm(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      // Récupérer toutes les réservations
      const response = await fetch('/api/admin/bookings', { cache: 'no-store' })
      if (!response.ok) throw new Error('Unable to load bookings')
      const { bookings } = await response.json() as { bookings: Booking[] }

      const today = new Date().toISOString().split('T')[0]
      const todayBookings = bookings?.filter(b => b.date === today) || []

      // Calculer les stats
      const totalBookings = bookings?.length || 0
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0
      const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0
      const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0

      // Estimation du revenu (basé sur les services confirmés)
      const services = [
        { name: 'Coupe Homme', price: 17 },
        { name: 'Barbe + Coupe', price: 25 },
        { name: 'Taille de barbe', price: 10 },
        { name: 'Coupe Enfant', price: 15 }
      ]

      const totalRevenue = bookings
        ?.filter(b => b.status === 'confirmed')
        .reduce((sum, booking) => {
          const service = services.find(s => s.name === booking.service)
          return sum + (service?.price || 0)
        }, 0) || 0

      setStats({
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        todayBookings: todayBookings.length,
        totalRevenue,
        avgRating: 4.8 // Placeholder - could come from testimonials
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const changeTab = (tabId: string) => {
    const event = new CustomEvent('changeAdminTab', { detail: tabId })
    window.dispatchEvent(event)
  }

  const quickActions = [
    {
      title: 'View Bookings',
      subtitle: `${stats.pendingBookings} pending`,
      icon: Calendar,
      color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      action: () => changeTab('bookings'),
      urgent: stats.pendingBookings > 0
    },
    {
      title: 'Confirm Appointments',
      subtitle: 'Quick actions',
      icon: CheckCircle,
      color: 'bg-green-500/20 border-green-500/30 text-green-400',
      action: () => changeTab('bookings')
    },
    {
      title: 'Manage Hours',
      subtitle: 'Opening & closing',
      icon: Clock,
      color: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      action: () => changeTab('hours')
    },
    {
      title: 'Update Gallery',
      subtitle: 'Salon photos',
      icon: Settings,
      color: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      action: () => changeTab('images')
    }
  ]

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-6 rounded-2xl border backdrop-blur-md ${color} transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color.replace('/20', '/30').replace('/30', '/40')}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-3 text-xs">
          <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
          <span className="text-green-400">+{trend}% ce mois</span>
        </div>
      )}
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AdminToday />
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          👋 Welcome to your admin panel!
        </h1>
        <p className="text-xl text-gray-300">
          Manage your Tarek Salon with ease
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="This month"
          icon={BarChart3}
          color="bg-blue-500/20 border-blue-500/30 text-blue-400"
          trend={12}
        />
        <StatCard
          title="Pending"
          value={stats.pendingBookings}
          subtitle="To confirm"
          icon={AlertCircle}
          color="bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmedBookings}
          subtitle="Appointments OK"
          icon={CheckCircle}
          color="bg-green-500/20 border-green-500/30 text-green-400"
        />
        <StatCard
          title="Today"
          value={stats.todayBookings}
          subtitle="Appointments"
          icon={Calendar}
          color="bg-purple-500/20 border-purple-500/30 text-purple-400"
        />
      </div>

      {/* Revenue & Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Estimated Revenue"
          value={`${stats.totalRevenue}€`}
          subtitle="This month"
          icon={TrendingUp}
          color="bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
          trend={8}
        />
        <StatCard
          title="Average Rating"
          value={stats.avgRating}
          subtitle="Based on reviews"
          icon={Star}
          color="bg-amber-500/20 border-amber-500/30 text-amber-400"
        />
      </div>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-accent/20 bg-secondary/50 p-6"
      >
        <h2 className="mb-2 flex items-center text-2xl font-bold text-white">
          <Calendar className="mr-3 h-6 w-6 text-accent" />
          Booking mode
        </h2>
        <p className="mb-5 text-gray-400">
          Choose what happens when a client clicks “Book”.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {([
            ['choice', 'Let the client choose', 'The client chooses between the website and Salonkee.'],
            ['website', 'Website only', 'Opens the website booking form directly.'],
            ['salonkee', 'Salonkee only', 'Opens Salonkee booking directly.'],
          ] as const).map(([mode, title, description]) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleBookingModeChange(mode)}
              disabled={savingBookingMode}
              className={`rounded-xl border p-4 text-left transition-colors ${
                bookingMode === mode
                  ? 'border-accent bg-accent/15 text-white'
                  : 'border-white/10 bg-black/10 text-gray-300 hover:border-accent/50'
              }`}
            >
              <span className="font-bold">{title}</span>
              <span className="mt-1 block text-sm text-gray-400">{description}</span>
            </button>
          ))}
        </div>
        {bookingModeMessage && <p className="mt-3 text-sm text-accent">{bookingModeMessage}</p>}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-accent/20 bg-secondary/50 p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Automatic booking confirmation</h2>
            <p className="mt-2 text-gray-400">
              Accept new website bookings immediately without manual approval.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoConfirmBookings}
            aria-label="Automatic booking confirmation"
            disabled={savingAutoConfirm}
            onClick={() => handleAutoConfirmChange(!autoConfirmBookings)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
              autoConfirmBookings ? 'bg-accent' : 'bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                autoConfirmBookings ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className={`mt-4 text-sm ${autoConfirmBookings ? 'text-green-400' : 'text-gray-400'}`}>
          {autoConfirmBookings
            ? 'Active: new bookings are confirmed automatically.'
            : 'Inactive: new bookings remain pending until you confirm them.'}
        </p>
      </motion.section>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-3 text-accent" />
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 text-left group ${
                  action.urgent
                    ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
                    : 'bg-secondary/50 border-accent/20 hover:bg-accent/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${action.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{action.title}</h3>
                      <p className="text-gray-400 text-sm">{action.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
                {action.urgent && (
                  <div className="mt-3 flex items-center text-yellow-400 text-sm">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2" />
                    Action required
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          💡 Tips for Getting Started
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Check pending bookings</p>
                <p className="text-gray-400 text-sm">Confirm or cancel quickly to free up slots</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Update your hours</p>
                <p className="text-gray-400 text-sm">Make sure your opening hours are correct</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Respond to customer reviews</p>
                <p className="text-gray-400 text-sm">Show that you care about your customers</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Settings className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Customize your branding</p>
                <p className="text-gray-400 text-sm">Add your logo and personalized colors</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}