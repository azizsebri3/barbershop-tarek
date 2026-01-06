'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  Zap,
  Eye,
  Info,
  Star,
  AlertTriangle
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { adminTranslations } from '@/lib/admin-translations'
import { useRealtimeBookings } from '@/lib/useRealtimeBookings'

type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
type FilterType = 'all' | 'pending' | 'confirmed' | 'cancelled'

interface AdminBookingsProps {
  onStatusChange?: () => void
}

export default function AdminBookings({ onStatusChange }: AdminBookingsProps) {
  // Utilisation du hook Realtime pour les réservations
  const { 
    bookings, 
    loading, 
    isRealtimeConnected, 
    refetch 
  } = useRealtimeBookings({
    enableNotifications: true,
    onInsert: () => {
      // Notifier le parent pour mettre à jour le compte des pending
      if (onStatusChange) onStatusChange()
    },
    onUpdate: () => {
      if (onStatusChange) onStatusChange()
    },
    onDelete: () => {
      if (onStatusChange) onStatusChange()
    }
  })

  const [filter, setFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [cancelNote, setCancelNote] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [singleDeleteLoading, setSingleDeleteLoading] = useState<string | null>(null)
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set())
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk', ids: string[] } | null>(null)
  const [showTips, setShowTips] = useState(true)
  const t = adminTranslations.bookings

  // Plus besoin de fetchBookings - géré par le hook Realtime
  // Fonction de refresh manuel si besoin
  const handleManualRefresh = () => {
    refetch()
    toast.success('Réservations actualisées')
  }

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus, cancelNote?: string, onLoading?: (loading: boolean) => void) => {
    try {
      if (onLoading) onLoading(true)

      const requestBody: any = { status: newStatus }
      if (newStatus === 'cancelled' && cancelNote) {
        requestBody.cancel_note = cancelNote
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Erreur API:', data.error)
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      // Pas besoin de mettre à jour manuellement - Realtime le fait automatiquement
      // setBookings(bookings.map(booking =>
      //   booking.id === bookingId ? { ...booking, status: newStatus } : booking
      // ))

      const successMessage = newStatus === 'confirmed' ? t.bookingConfirmed :
                            newStatus === 'cancelled' ? t.bookingCancelled :
                            'Booking updated'
      toast.success(successMessage)

      // Notify parent to update pending count
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error)
      toast.error(t.error)
    } finally {
      if (onLoading) onLoading(false)
    }
  }

  const confirmBooking = async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'confirmed', undefined, setConfirmLoading)
  }

  const cancelBooking = async (bookingId: string, cancelNote?: string) => {
    await updateBookingStatus(bookingId, 'cancelled', cancelNote, setCancelLoading)
  }

  const deleteSingleBooking = async (bookingId: string) => {
    setSingleDeleteLoading(bookingId)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      // Pas besoin de mettre à jour manuellement - Realtime le fait automatiquement
      // setBookings(bookings.filter(booking => booking.id !== bookingId))
      toast.success(t.bookingDeleted)

      // Notify parent to update pending count
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(t.error)
    } finally {
      setSingleDeleteLoading(null)
    }
  }

  const handleCancelBooking = (bookingId: string) => {
    setCancelBookingId(bookingId)
    setCancelNote('')
    setCancelModalOpen(true)
  }

  const confirmCancelBooking = async () => {
    if (!cancelBookingId) return

    try {
      await cancelBooking(cancelBookingId, cancelNote)
      setCancelModalOpen(false)
      setCancelBookingId(null)
      setCancelNote('')
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const deleteBooking = async (bookingId: string) => {
    await deleteSingleBooking(bookingId)
  }

  const deleteSelectedBookings = async () => {
    if (selectedBookings.size === 0) return
    setDeleteTarget({ type: 'bulk', ids: Array.from(selectedBookings) })
    setDeleteModalOpen(true)
  }

  const toggleBookingSelection = (bookingId: string) => {
    const newSelected = new Set(selectedBookings)
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId)
    } else {
      newSelected.add(bookingId)
    }
    setSelectedBookings(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedBookings.size === filteredBookings.length) {
      setSelectedBookings(new Set())
    } else {
      setSelectedBookings(new Set(filteredBookings.map(booking => booking.id)))
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    const { type, ids } = deleteTarget
    setBulkDeleteLoading(true)

    try {
      const deletePromises = ids.map(async (bookingId) => {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Erreur lors de la suppression')
        }
      })

      await Promise.all(deletePromises)

      // Pas besoin de mettre à jour manuellement - Realtime le fait automatiquement
      // setBookings(bookings.filter(booking => !ids.includes(booking.id)))
      setSelectedBookings(new Set())

      const message = type === 'single' ? t.bookingDeleted : `${ids.length} réservations supprimées`
      toast.success(message)

      // Notify parent to update pending count
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(t.error)
    } finally {
      setBulkDeleteLoading(false)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter
    const matchesSearch = searchTerm === '' ||
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.message && booking.message.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesFilter && matchesSearch
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'confirmed': return 'bg-green-500/20 border-green-500/50 text-green-400'
      case 'cancelled': return 'bg-red-500/20 border-red-500/50 text-red-400'
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return <AlertCircle size={16} />
      case 'confirmed': return <CheckCircle size={16} />
      case 'cancelled': return <XCircle size={16} />
      default: return <Info size={16} />
    }
  }

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return t.statusPending
      case 'confirmed': return t.statusConfirmed
      case 'cancelled': return t.statusCancelled
      default: return status
    }
  }

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateString === today
  }

  const isPast = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateString < today
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header with Tips Toggle and Realtime Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-6 h-6 text-accent" />
            Gestion des réservations
            {/* Indicateur de connexion Realtime */}
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              isRealtimeConnected 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-orange-500/20 text-orange-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isRealtimeConnected ? 'bg-green-400 animate-pulse' : 'bg-orange-400'
              }`}></span>
              {isRealtimeConnected ? 'Live' : 'Hors ligne'}
            </span>
          </h2>
          <p className="text-gray-400 mt-1">
            Gérez facilement vos rendez-vous et clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors text-sm disabled:opacity-50"
            title="Actualiser manuellement"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-2 px-3 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors text-sm"
          >
            <Info size={16} />
            {showTips ? 'Masquer les conseils' : 'Afficher les conseils'}
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <AnimatePresence>
        {showTips && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20 rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-accent" />
              Conseils pour bien débuter
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Vérifiez les réservations en attente</p>
                    <p className="text-gray-400 text-sm">Les nouvelles demandes apparaissent en jaune</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Confirmez rapidement</p>
                    <p className="text-gray-400 text-sm">Libérez les créneaux pour d&apos;autres clients</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Eye className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Utilisez les filtres</p>
                    <p className="text-gray-400 text-sm">Cliquez sur les statuts pour filtrer</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Search className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Recherche rapide</p>
                    <p className="text-gray-400 text-sm">Cherchez par nom, email ou service</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filter === 'all'
              ? 'bg-accent/20 border-accent'
              : 'bg-secondary/50 border-accent/20 hover:border-accent/50'
          } border`}
        >
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-gray-400">Total</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('pending')}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filter === 'pending'
              ? 'bg-yellow-500/20 border-yellow-500'
              : 'bg-secondary/50 border-accent/20 hover:border-yellow-500/50'
          } border`}
        >
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          <p className="text-sm text-gray-400">{t.statusPending}</p>
          {stats.pending > 0 && (
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mt-2 mx-auto" />
          )}
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('confirmed')}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filter === 'confirmed'
              ? 'bg-green-500/20 border-green-500'
              : 'bg-secondary/50 border-accent/20 hover:border-green-500/50'
          } border`}
        >
          <p className="text-2xl font-bold text-green-400">{stats.confirmed}</p>
          <p className="text-sm text-gray-400">{t.statusConfirmed}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setFilter('cancelled')}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filter === 'cancelled'
              ? 'bg-red-500/20 border-red-500'
              : 'bg-secondary/50 border-accent/20 hover:border-red-500/50'
          } border`}
        >
          <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
          <p className="text-sm text-gray-400">{t.statusCancelled}</p>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone ou service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-accent/20 rounded-xl text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
        />
      </div>

      {/* Bulk Actions */}
      {filteredBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-secondary/30 border border-accent/20 rounded-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors"
            >
              {selectedBookings.size === filteredBookings.length ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              {selectedBookings.size === filteredBookings.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
            {selectedBookings.size > 0 && (
              <span className="text-gray-300 text-sm">
                {selectedBookings.size} sélectionnée(s)
              </span>
            )}
          </div>
          {selectedBookings.size > 0 && (
            <button
              onClick={deleteSelectedBookings}
              disabled={bulkDeleteLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {bulkDeleteLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              Supprimer ({selectedBookings.size})
            </button>
          )}
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400 text-lg mb-2">
            {searchTerm ? 'Aucune réservation trouvée' : 'Aucune réservation pour ce filtre'}
          </p>
          <p className="text-gray-500 text-sm">
            {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Changez de filtre pour voir d\'autres réservations'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${
                  selectedBookings.has(booking.id)
                    ? 'bg-accent/10 border-accent'
                    : 'bg-secondary/50 border-accent/20 hover:border-accent/50'
                } ${isToday(booking.date) ? 'ring-2 ring-blue-500/50' : ''} ${
                  isPast(booking.date) && booking.status === 'confirmed' ? 'ring-2 ring-green-500/50' : ''
                }`}
              >
                {/* Selection Checkbox */}
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleBookingSelection(booking.id)}
                    className="mt-1 p-1 hover:bg-accent/20 rounded transition-colors"
                  >
                    {selectedBookings.has(booking.id) ? (
                      <CheckSquare size={20} className="text-accent" />
                    ) : (
                      <Square size={20} className="text-gray-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {/* Header with Status and Date */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {getStatusText(booking.status)}
                        </div>
                        {isToday(booking.date) && (
                          <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-400 font-medium">
                            Aujourd&apos;hui
                          </div>
                        )}
                        {isPast(booking.date) && booking.status === 'confirmed' && (
                          <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400 font-medium">
                            Passé
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {new Date(booking.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-gray-400 text-sm">{booking.time}</p>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="text-gray-400" size={16} />
                          <span className="text-white font-medium">{booking.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="text-gray-400" size={16} />
                          <span className="text-gray-300">{booking.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="text-gray-400" size={16} />
                          <span className="text-gray-300">{booking.phone}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="text-gray-400" size={16} />
                          <span className="text-white font-medium">{booking.service}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Créée le {new Date(booking.created_at).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    {booking.message && (
                      <div className="mb-4 p-3 bg-primary/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="text-gray-400 mt-0.5" size={16} />
                          <p className="text-gray-300 text-sm">{booking.message}</p>
                        </div>
                      </div>
                    )}

                    {/* Cancel Note */}
                    {booking.status === 'cancelled' && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="text-red-400 mt-0.5" size={16} />
                          <div>
                            {booking.cancel_note && (
                              <>
                                <p className="text-red-300 text-sm font-medium">Note d&apos;annulation:</p>
                                <p className="text-red-300 text-sm mb-2">{booking.cancel_note}</p>
                              </>
                            )}
                            <p className="text-red-300 text-xs">
                              <strong>Annulé par:</strong> {booking.cancelled_by === 'admin' ? 'by Admin' : 'by Client'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    {booking.status === 'pending' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => confirmBooking(booking.id)}
                          disabled={confirmLoading}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          {confirmLoading ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          {confirmLoading ? 'Confirmation...' : 'Confirmer'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <XCircle size={16} />
                          Annuler
                        </motion.button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <XCircle size={16} />
                        Annuler
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => deleteBooking(booking.id)}
                      disabled={singleDeleteLoading === booking.id}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                    >
                      {singleDeleteLoading === booking.id ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {singleDeleteLoading === booking.id ? 'Suppression...' : 'Supprimer'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCancelModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-secondary/95 backdrop-blur-md border border-accent/20 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={20} />
                Annuler la réservation
              </h3>

              <p className="text-gray-300 mb-4">
                Êtes-vous sûr de vouloir annuler cette réservation ? Le client recevra un email de confirmation.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Note d&apos;annulation (optionnel)
                </label>
                <textarea
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  placeholder="Raison de l'annulation..."
                  disabled={cancelLoading}
                  className="w-full px-3 py-2 bg-primary/50 border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:border-accent focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  disabled={cancelLoading}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmCancelBooking}
                  disabled={cancelLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {cancelLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Annulation...
                    </>
                  ) : (
                    'Confirmer l\'annulation'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-secondary/95 backdrop-blur-md border border-accent/20 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Trash2 className="text-red-400" size={20} />
                Confirmer la suppression
              </h3>

              <p className="text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer{' '}
                <span className="font-medium text-white">
                  {deleteTarget.type === 'single' ? 'cette réservation' : `${deleteTarget.ids.length} réservations`}
                </span> ?
                Cette action est irréversible.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={bulkDeleteLoading}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={bulkDeleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {bulkDeleteLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}