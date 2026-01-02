'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

// Interface simple pour les réservations
interface Booking {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  service: string
  status: 'pending' | 'confirmed' | 'cancelled'
  message?: string
}

export default function AdminCalendarSimple() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [, setSelectedDate] = useState<Date>(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Charger les réservations
  const loadBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      
      if (response.ok) {
        const data = await response.json()
        
        // Vérifier si les données sont dans data.bookings ou directement dans data
        const bookingsData = data.bookings || data
        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      } else {
        console.error('❌ Erreur de réponse:', response.status)
        setBookings([])
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des réservations:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  // Changer le statut d'une réservation
  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Réservation ${status === 'confirmed' ? 'confirmée' : 'annulée'}`)
        loadBookings()
        setShowModal(false)
        setSelectedBooking(null)
      } else {
        throw new Error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  // Fonctions du calendrier
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayBookings = Array.isArray(bookings) ? bookings.filter(b => b.date === dateStr) : []
    return dayBookings
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const pendingCount = Array.isArray(bookings) ? bookings.filter(b => b.status === 'pending').length : 0
  const confirmedCount = Array.isArray(bookings) ? bookings.filter(b => b.status === 'confirmed').length : 0
  const cancelledCount = Array.isArray(bookings) ? bookings.filter(b => b.status === 'cancelled').length : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="text-accent" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">Gestion des Réservations</h1>
            <p className="text-gray-400">Visualisez et gérez vos rendez-vous</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Clock className="text-yellow-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">En attente</p>
              <p className="text-white font-bold text-xl">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Calendar className="text-green-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Confirmés</p>
              <p className="text-white font-bold text-xl">{confirmedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="text-red-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Annulés</p>
              <p className="text-white font-bold text-xl">{cancelledCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          🔍 Debug: {bookings.length} réservation(s) chargée(s) 
          {bookings.length > 0 && ` - Dates: ${bookings.map(b => b.date).join(', ')}`}
        </p>
      </div>

      {/* Calendrier Vue */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6">
          {/* Navigation du calendrier */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="text-gray-400" size={20} />
            </button>
            
            <h2 className="text-xl font-semibold text-white">
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="text-gray-400" size={20} />
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
              <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentMonth).map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
              const isToday = day.toDateString() === new Date().toDateString()
              const dayBookings = getBookingsForDate(day)
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-2 border border-gray-600 rounded-lg cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 text-gray-500'}
                    ${isToday ? 'ring-2 ring-accent' : ''}
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-sm font-medium text-white mb-1">
                    {day.getDate()}
                  </div>
                  
                  {/* Réservations du jour */}
                  <div className="space-y-1">
                    {dayBookings.slice(0, 2).map((booking) => (
                      <div
                        key={booking.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedBooking(booking)
                          setShowModal(true)
                        }}
                        className={`
                          text-xs px-1 py-0.5 rounded cursor-pointer transition-colors
                          ${booking.status === 'confirmed' ? 'bg-green-600 text-white' :
                            booking.status === 'cancelled' ? 'bg-red-600 text-white' :
                            'bg-yellow-600 text-black'}
                        `}
                      >
                        {booking.time} - {booking.name}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-gray-400 px-1">
                        +{dayBookings.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal des détails de réservation */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Détails de la réservation</h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedBooking(null)
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Client</p>
                  <p className="text-white">{selectedBooking.name}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Service</p>
                  <p className="text-white">{selectedBooking.service}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Date et heure</p>
                  <p className="text-white">
                    {new Date(selectedBooking.date).toLocaleDateString('fr-FR')} à {selectedBooking.time}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Contact</p>
                  <p className="text-white">{selectedBooking.email}</p>
                  <p className="text-white">{selectedBooking.phone}</p>
                </div>
                
                {selectedBooking.message && (
                  <div>
                    <p className="text-gray-400 text-sm">Message</p>
                    <p className="text-white text-sm">{selectedBooking.message}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-400 text-sm">Statut</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedBooking.status === 'confirmed' ? 'bg-green-600 text-white' :
                    selectedBooking.status === 'cancelled' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-black'
                  }`}>
                    {selectedBooking.status === 'confirmed' ? 'Confirmé' :
                     selectedBooking.status === 'cancelled' ? 'Annulé' : 'En attente'}
                  </span>
                </div>
                
                {selectedBooking.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      Confirmer
                    </button>
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}