'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  History, 
  Calendar, 
  Clock, 
  Search, 
  Star,
  Phone,
  Mail,
  Scissors,
  Award,
  TrendingUp,
  Users,
  RefreshCw
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { supabase, Booking } from '@/lib/supabase'
import { adminTranslations } from '@/lib/admin-translations'

interface ClientHistory {
  email: string
  name: string
  phone: string
  visits: number
  lastVisit: string
  totalServices: string[]
  bookings: Booking[]
}

export default function AdminHistory() {
  const [history, setHistory] = useState<ClientHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<ClientHistory | null>(null)
  const t = adminTranslations.history

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase!
        .from('bookings')
        .select('*')
        .eq('status', 'confirmed')
        .order('date', { ascending: false })

      if (error) throw error

      // Grouper par client (email)
      const clientsMap = new Map<string, ClientHistory>()
      
      data?.forEach((booking: Booking) => {
        const existing = clientsMap.get(booking.email)
        if (existing) {
          existing.visits++
          if (!existing.totalServices.includes(booking.service)) {
            existing.totalServices.push(booking.service)
          }
          existing.bookings.push(booking)
          // Garder la date la plus récente
          if (new Date(booking.date) > new Date(existing.lastVisit)) {
            existing.lastVisit = booking.date
            existing.name = booking.name
            existing.phone = booking.phone
          }
        } else {
          clientsMap.set(booking.email, {
            email: booking.email,
            name: booking.name,
            phone: booking.phone,
            visits: 1,
            lastVisit: booking.date,
            totalServices: [booking.service],
            bookings: [booking]
          })
        }
      })

      // Convertir en tableau et trier par nombre de visites
      const clientsList = Array.from(clientsMap.values())
        .sort((a, b) => b.visits - a.visits)

      setHistory(clientsList)
    } catch (error) {
      console.error('Error loading history:', error)
      toast.error('Error loading history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const filteredHistory = history.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  const stats = {
    totalClients: history.length,
    loyalClients: history.filter(c => c.visits >= 3).length,
    totalVisits: history.reduce((acc, c) => acc + c.visits, 0),
    avgVisits: history.length > 0 
      ? (history.reduce((acc, c) => acc + c.visits, 0) / history.length).toFixed(1) 
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-accent" size={24} />
        <span className="ml-2 text-gray-300">{adminTranslations.common.loading}</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-accent" />
            {t.title}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Clients who have already been here
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          {adminTranslations.common.refresh}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4"
        >
          <Users className="text-blue-400 mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
          <p className="text-sm text-gray-400">Unique clients</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-4"
        >
          <Award className="text-amber-400 mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{stats.loyalClients}</p>
          <p className="text-sm text-gray-400">Loyal clients (3+)</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4"
        >
          <TrendingUp className="text-green-400 mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{stats.totalVisits}</p>
          <p className="text-sm text-gray-400">Total visits</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4"
        >
          <Star className="text-purple-400 mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{stats.avgVisits}</p>
          <p className="text-sm text-gray-400">Average visits</p>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={t.searchClient}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-accent/20 rounded-xl text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
        />
      </div>

      {/* Clients List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">
            {searchTerm ? 'No client found' : t.noHistory}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredHistory.map((client) => (
            <motion.div
              key={client.email}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedClient(selectedClient?.email === client.email ? null : client)}
              className={`bg-secondary/50 backdrop-blur-md border rounded-xl p-5 cursor-pointer transition-all ${
                selectedClient?.email === client.email 
                  ? 'border-accent shadow-lg shadow-accent/20' 
                  : 'border-accent/20 hover:border-accent/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar avec badge fidélité */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {client.visits >= 3 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <Star className="text-white" size={12} fill="white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {client.name}
                      {client.visits >= 5 && (
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                          VIP
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {client.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {client.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{client.visits}</p>
                    <p className="text-gray-400">visits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">
                      {new Date(client.lastVisit).toLocaleDateString('en-US')}
                    </p>
                    <p className="text-gray-400">last visit</p>
                  </div>
                </div>
              </div>

              {/* Détails étendus */}
              {selectedClient?.email === client.email && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 pt-6 border-t border-accent/20"
                >
                  <h4 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
                    <Scissors size={16} />
                    Services requested
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {client.totalServices.map((service) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-accent/10 text-accent border border-accent/30 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Visits history
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {client.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-primary/30 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="text-gray-400" size={14} />
                          <span className="text-gray-300">
                            {new Date(booking.date).toLocaleDateString('en-US')}
                          </span>
                          <Clock className="text-gray-400" size={14} />
                          <span className="text-gray-300">{booking.time}</span>
                        </div>
                        <span className="text-accent">{booking.service}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
