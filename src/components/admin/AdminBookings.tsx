'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle, XCircle, AlertCircle, Trash2, RefreshCw } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { supabase, Booking } from '@/lib/supabase'

type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase!
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error)
      toast.error('Erreur lors du chargement des réservations')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      console.log('🔄 Mise à jour du statut:', bookingId, '->', newStatus)

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Erreur API:', data.error)
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      console.log('✅ Statut mis à jour avec succès')
      setBookings(bookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ))

      toast.success(`Réservation ${newStatus === 'confirmed' ? 'confirmée' : newStatus === 'cancelled' ? 'annulée' : 'mise en attente'}`)
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) return

    try {
      console.log('🗑️ Suppression de la réservation:', bookingId)

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Erreur API:', data.error)
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      console.log('✅ Réservation supprimée avec succès')
      setBookings(bookings.filter(booking => booking.id !== bookingId))
      toast.success('Réservation supprimée')
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-accent" size={24} />
        <span className="ml-2 text-gray-300">Chargement des réservations...</span>
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

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestion des Réservations</h2>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">Aucune réservation trouvée</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-secondary/50 backdrop-blur-md border border-accent/20 rounded-lg p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="text-accent" size={20} />
                    <h3 className="text-lg font-semibold text-white">{booking.name}</h3>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status === 'confirmed' ? 'Confirmée' : booking.status === 'cancelled' ? 'Annulée' : 'En attente'}
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
                      Créée le {new Date(booking.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mt-3 p-3 bg-primary/30 rounded-lg">
                      <p className="text-gray-300 text-sm">{booking.message}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 lg:min-w-[200px]">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <CheckCircle size={16} />
                        Confirmer
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <XCircle size={16} />
                        Annuler
                      </button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <XCircle size={16} />
                      Annuler
                    </button>
                  )}

                  <button
                    onClick={() => deleteBooking(booking.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}