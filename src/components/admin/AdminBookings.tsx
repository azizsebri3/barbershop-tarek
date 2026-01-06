'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle, XCircle, AlertCircle, Trash2, RefreshCw, Search, CheckSquare, Square } from 'lucide-react'
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
  const t = adminTranslations.bookings

  // Plus besoin de fetchBookings - géré par le hook Realtime
  const handleManualRefresh = () => {
    refetch()
    toast.success('Bookings refreshed')
  }

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus, cancelNote?: string, onLoading?: (loading: boolean) => void) => {
    try {
      if (onLoading) onLoading(true)

      const requestBody: any = { status: newStatus }
      if (newStatus === 'cancelled') {
        requestBody.cancel_note = cancelNote || ''
        requestBody.cancelled_by = 'admin'
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
        console.error('❌ API Error:', data.error)
        throw new Error(data.error || 'Error updating booking')
      }

      // Pas besoin de mettre à jour manuellement - Realtime le fait automatiquement
      // setBookings(bookings.map(booking =>
      //   booking.id === bookingId ? { ...booking, status: newStatus, cancelled_by: newStatus === 'cancelled' ? 'admin' : booking.cancelled_by } : booking
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
      console.error('❌ Error updating:', error)
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

        return bookingId
      })

      await Promise.all(deletePromises)

      // Pas besoin de mettre à jour manuellement - Realtime le fait automatiquement
      // setBookings(bookings.filter(booking => !ids.includes(booking.id)))
      setSelectedBookings(new Set())
      
      const successMessage = type === 'single' 
        ? t.bookingDeleted 
        : `${ids.length} booking(s) deleted`
      toast.success(successMessage)
      
      // Notify parent to update pending count
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error) {
      console.error('❌ Error deleting:', error)
      toast.error('Error deleting bookings')
    } finally {
      setBulkDeleteLoading(false)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
    }
  }

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="text-green-500" size={16} />
      case 'cancelled':
        return <XCircle className="text-red-500" size={16} />
      default:
        return <AlertCircle className="text-yellow-500" size={16} />
    }
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  // Filter and search bookings
  const filteredBookings = bookings
    .filter(booking => filter === 'all' || booking.status === filter)
    .filter(booking => 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          {t.title}
          {/* Indicateur de connexion Realtime */}
          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
            isRealtimeConnected 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-orange-500/20 text-orange-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isRealtimeConnected ? 'bg-green-400 animate-pulse' : 'bg-orange-400'
            }`}></span>
            {isRealtimeConnected ? 'Live' : 'Offline'}
          </span>
        </h2>
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {adminTranslations.common.refresh}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
          placeholder={`${adminTranslations.common.search} (name, email, phone, service)...`}
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

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">
            {searchTerm || filter !== 'all' 
              ? 'No bookings found with these criteria' 
              : t.noBookings}
          </p>
          {(searchTerm || filter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setFilter('all'); }}
              className="mt-4 text-accent hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-secondary/50 backdrop-blur-md border border-accent/20 rounded-lg p-6"
              >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Checkbox for selection */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedBookings.has(booking.id)}
                    onChange={() => toggleBookingSelection(booking.id)}
                    className="w-4 h-4 text-accent bg-secondary/50 border-accent/20 rounded focus:ring-accent focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="text-accent" size={20} />
                      <h3 className="text-lg font-semibold text-white">{booking.name}</h3>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status === 'confirmed' ? t.statusConfirmed : booking.status === 'cancelled' ? t.statusCancelled : t.statusPending}
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="text-gray-400" size={16} />
                      <span className="text-gray-300">{booking.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-400" size={16} />
                      <span className="text-gray-300">{booking.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-400" size={16} />
                      <span className="text-gray-300">{new Date(booking.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="text-gray-400" size={16} />
                      <span className="text-gray-300">{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="text-gray-400" size={16} />
                      <span className="text-gray-300">{booking.service}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created {new Date(booking.created_at).toLocaleString('en-US')}
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mt-3 p-3 bg-primary/30 rounded-lg">
                      <p className="text-gray-300 text-sm">{booking.message}</p>
                    </div>
                  )}

                  {booking.status === 'cancelled' && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      {booking.cancel_note && (
                        <p className="text-red-300 text-sm mb-2">
                          <strong>Cancellation note:</strong> {booking.cancel_note}
                        </p>
                      )}
                      <p className="text-red-300 text-xs">
                        <strong>Cancelled by:</strong> {booking.cancelled_by === 'admin' ? 'by Admin' : 'by Client'}
                      </p>
                    </div>
                  )}

                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:min-w-[200px]">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => confirmBooking(booking.id)}
                        disabled={confirmLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        {confirmLoading ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        {confirmLoading ? 'Loading...' : t.confirmBooking}
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <XCircle size={16} />
                        {t.cancelBooking}
                      </button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <XCircle size={16} />
                      {t.cancelBooking}
                    </button>
                  )}

                  <button
                    onClick={() => deleteBooking(booking.id)}
                    disabled={singleDeleteLoading === booking.id}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {singleDeleteLoading === booking.id ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {singleDeleteLoading === booking.id ? 'Loading...' : t.deleteBooking}
                  </button>
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
              <h3 className="text-xl font-semibold text-white mb-4">
                {adminTranslations.bookings.cancelBooking}
              </h3>
              
              <p className="text-gray-300 mb-4">
                Are you sure you want to cancel this booking?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cancellation note (optional)
                </label>
                <textarea
                  value={cancelNote}
                  onChange={(e) => setCancelNote(e.target.value)}
                  placeholder="Reason for cancellation..."
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
                  Cancel
                </button>
                <button
                  onClick={confirmCancelBooking}
                  disabled={cancelLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {cancelLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Confirm Cancellation'
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
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <Trash2 className="text-red-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {deleteTarget.type === 'single' ? 'Delete Booking' : 'Delete Bookings'}
                </h3>
              </div>

              <p className="text-gray-300 mb-6">
                {deleteTarget.type === 'single'
                  ? 'Are you sure you want to delete this booking? This action is irreversible.'
                  : `Are you sure you want to delete ${deleteTarget.ids.length} booking(s)? This action is irreversible.`
                }
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={bulkDeleteLoading}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={bulkDeleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {bulkDeleteLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}