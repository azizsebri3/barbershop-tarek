'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  service: string
  message?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

interface AvailabilitySlot {
  id?: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  is_all_day: boolean
}

// Composant formulaire pour les disponibilités
const AvailabilityForm = ({
  date,
  existingSlot,
  onSave,
  onDelete
}: {
  date: string
  existingSlot?: AvailabilitySlot
  onSave: (slot: AvailabilitySlot) => void
  onDelete?: (slotId: string) => void
}) => {
  const [isAllDay, setIsAllDay] = useState(existingSlot?.is_all_day ?? false)
  const [startTime, setStartTime] = useState(existingSlot?.start_time ?? '09:00')
  const [endTime, setEndTime] = useState(existingSlot?.end_time ?? '18:00')
  const [isAvailable, setIsAvailable] = useState(existingSlot?.is_available ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const slot: AvailabilitySlot = {
      id: existingSlot?.id,
      date,
      start_time: isAllDay ? '00:00' : startTime,
      end_time: isAllDay ? '23:59' : endTime,
      is_available: isAvailable,
      is_all_day: isAllDay
    }

    onSave(slot)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Disponible / Non disponible */}
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="availability"
            checked={isAvailable}
            onChange={() => setIsAvailable(true)}
            className="form-radio text-green-500"
          />
          <span className="text-white">Disponible</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="availability"
            checked={!isAvailable}
            onChange={() => setIsAvailable(false)}
            className="form-radio text-red-500"
          />
          <span className="text-white">Non disponible</span>
        </label>
      </div>

      {isAvailable && (
        <>
          {/* Toute la journée */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="form-checkbox text-blue-500"
            />
            <span className="text-white">Toute la journée</span>
          </label>

          {/* Heures spécifiques */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Début</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Fin</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Boutons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Sauvegarder
        </button>
        {existingSlot && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(existingSlot.id!)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </form>
  )
}

export default function AdminCalendar() {
  const calendarRef = useRef<FullCalendar>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth')
  const [showAvailability, setShowAvailability] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'booking' | 'availability'>('booking')
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  // Charger les réservations
  const loadBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error)
      toast.error('Erreur lors du chargement des réservations')
    }
  }

  // Charger les disponibilités
  const loadAvailability = async () => {
    try {
      // Charger les 60 prochains jours
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const response = await fetch(`/api/availability?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setAvailability(data)
      } else {
        // Si l'API n'est pas encore configurée, utiliser des créneaux par défaut
        const defaultSlots: AvailabilitySlot[] = []
        for (let i = 0; i < 30; i++) {
          const date = new Date()
          date.setDate(date.getDate() + i)
          
          // Skip Sundays
          if (date.getDay() === 0) continue
          
          const dateStr = date.toISOString().split('T')[0]
          defaultSlots.push({
            date: dateStr,
            start_time: '09:00',
            end_time: '18:00',
            is_available: true,
            is_all_day: false
          })
        }
        setAvailability(defaultSlots)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error)
      // Fallback sur des créneaux par défaut
      const defaultSlots: AvailabilitySlot[] = []
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        if (date.getDay() === 0) continue
        
        const dateStr = date.toISOString().split('T')[0]
        defaultSlots.push({
          date: dateStr,
          start_time: '09:00',
          end_time: '18:00',
          is_available: true,
          is_all_day: false
        })
      }
      setAvailability(defaultSlots)
    }
  }

  // Sauvegarder les disponibilités
  const saveAvailability = async (slot: AvailabilitySlot) => {
    try {
      const method = slot.id ? 'PUT' : 'POST'
      const url = slot.id ? `/api/availability/${slot.id}` : '/api/availability'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slot),
      })

      if (response.ok) {
        await loadAvailability() // Recharger les disponibilités
        toast.success('Disponibilité sauvegardée')
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de disponibilité:', error)
      // Pour l'instant, juste mettre à jour le state local
      if (slot.id) {
        setAvailability(prev => prev.map(s => 
          s.id === slot.id ? slot : s
        ))
      } else {
        const newSlot = { ...slot, id: Date.now().toString() }
        setAvailability(prev => [...prev, newSlot])
      }
      toast.success('Disponibilité sauvegardée (local)')
    }
  }

  // Supprimer une disponibilité
  const deleteAvailability = async (slotId: string) => {
    try {
      const response = await fetch(`/api/availability/${slotId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadAvailability()
        toast.success('Disponibilité supprimée')
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      // Fallback local
      setAvailability(prev => prev.filter(s => s.id !== slotId))
      toast.success('Disponibilité supprimée (local)')
    }
  }

  useEffect(() => {
    loadBookings()
    loadAvailability()
  }, [])

  // Convertir les données en événements pour FullCalendar
  const events = [
    // Réservations
    ...bookings.map(booking => ({
      id: `booking-${booking.id}`,
      title: `${booking.service} - ${booking.name}`,
      start: `${booking.date}T${booking.time}`,
      end: `${booking.date}T${addMinutes(booking.time, 60)}`, // Durée estimée 1h
      backgroundColor: booking.status === 'confirmed' ? '#10b981' : 
                      booking.status === 'cancelled' ? '#ef4444' : '#f59e0b',
      borderColor: booking.status === 'confirmed' ? '#059669' : 
                   booking.status === 'cancelled' ? '#dc2626' : '#d97706',
      extendedProps: {
        type: 'booking',
        data: booking
      }
    })),
    // Disponibilités (si activées)
    ...(showAvailability ? availability.map(slot => ({
      id: `availability-${slot.date}`,
      title: 'Disponible',
      start: slot.is_all_day ? slot.date : `${slot.date}T${slot.start_time}`,
      end: slot.is_all_day ? slot.date : `${slot.date}T${slot.end_time}`,
      backgroundColor: '#3b82f6',
      borderColor: '#2563eb',
      display: 'background',
      extendedProps: {
        type: 'availability',
        data: slot
      }
    })) : [])
  ]

  // Fonction utilitaire pour ajouter des minutes
  function addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  // Gérer les clics sur les événements
  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event)
    setModalType(clickInfo.event.extendedProps.type)
    setShowModal(true)
  }

  // Gérer les clics sur les dates
  const handleDateClick = (dateInfo: any) => {
    setSelectedDate(dateInfo.dateStr)
    setModalType('availability')
    setShowModal(true)
  }

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
      } else {
        throw new Error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="text-accent" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">Calendrier Admin</h1>
            <p className="text-gray-400">Gérez vos rendez-vous et disponibilités</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Toggle disponibilités */}
          <button
            onClick={() => setShowAvailability(!showAvailability)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showAvailability 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {showAvailability ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="text-sm">Disponibilités</span>
          </button>
          
          {/* Sélecteur de vue */}
          <select 
            value={currentView}
            onChange={(e) => setCurrentView(e.target.value as any)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          >
            <option value="dayGridMonth">Mois</option>
            <option value="timeGridWeek">Semaine</option>
            <option value="timeGridDay">Jour</option>
            <option value="listWeek">Liste</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Calendar className="text-blue-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Total RDV</p>
              <p className="text-white font-bold text-xl">{bookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Confirmés</p>
              <p className="text-white font-bold text-xl">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Clock className="text-yellow-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">En attente</p>
              <p className="text-white font-bold text-xl">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <XCircle className="text-red-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Annulés</p>
              <p className="text-white font-bold text-xl">
                {bookings.filter(b => b.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="calendar-container p-6">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            events={events}
            editable={false}
            selectable={true}
            dayMaxEvents={3}
            weekends={true}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            locale="fr"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: '09:00',
              endTime: '18:00'
            }}
            eventDidMount={(info) => {
              // Styles personnalisés pour les événements
              const element = info.el
              element.style.cursor = 'pointer'
              
              if (info.event.extendedProps.type === 'booking') {
                const booking = info.event.extendedProps.data as Booking
                element.title = `${booking.name} - ${booking.service}\n${booking.phone}\nStatut: ${booking.status}`
              }
            }}
          />
        </div>
      </div>

      {/* Modal pour les détails */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {modalType === 'booking' && selectedEvent && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User size={20} />
                  Détails du RDV
                </h2>
                
                {(() => {
                  const booking = selectedEvent.extendedProps.data as Booking
                  return (
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Client</p>
                        <p className="text-white font-medium">{booking.name}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Date</p>
                          <p className="text-white">{new Date(booking.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Heure</p>
                          <p className="text-white">{booking.time}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Service</p>
                        <p className="text-white">{booking.service}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Contact</p>
                        <p className="text-white">{booking.email}</p>
                        <p className="text-white">{booking.phone}</p>
                      </div>
                      
                      {booking.message && (
                        <div>
                          <p className="text-gray-400 text-sm">Message</p>
                          <p className="text-white text-sm">{booking.message}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-gray-400 text-sm">Statut</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-600 text-white' :
                          booking.status === 'cancelled' ? 'bg-red-600 text-white' :
                          'bg-yellow-600 text-black'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmé' :
                           booking.status === 'cancelled' ? 'Annulé' : 'En attente'}
                        </span>
                      </div>
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
            
            {/* Modal pour les disponibilités */}
            {modalType === 'availability' && selectedDate && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="text-blue-400" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Disponibilité - {new Date(selectedDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Définir les créneaux de disponibilité
                    </p>
                  </div>
                </div>

                <AvailabilityForm
                  date={selectedDate}
                  existingSlot={availability.find(slot => slot.date === selectedDate)}
                  onSave={saveAvailability}
                  onDelete={deleteAvailability}
                />
              </div>
            )}
            
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Styles CSS pour FullCalendar */}
      <style jsx global>{`
        .calendar-container .fc {
          font-family: inherit;
        }
        
        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th {
          border-color: #374151;
        }
        
        .calendar-container .fc-theme-standard .fc-scrollgrid {
          border-color: #374151;
        }
        
        .calendar-container .fc-col-header {
          background: #1f2937;
        }
        
        .calendar-container .fc-col-header-cell {
          background: #1f2937;
          color: #d1d5db;
          font-weight: 600;
          padding: 8px;
        }
        
        .calendar-container .fc-daygrid-day {
          background: #111827;
        }
        
        .calendar-container .fc-daygrid-day:hover {
          background: #1f2937;
        }
        
        .calendar-container .fc-day-today {
          background: rgba(212, 175, 55, 0.1) !important;
        }
        
        .calendar-container .fc-daygrid-day-number {
          color: #d1d5db;
          font-weight: 500;
        }
        
        .calendar-container .fc-button {
          background: #374151;
          border-color: #4b5563;
          color: #d1d5db;
        }
        
        .calendar-container .fc-button:hover {
          background: #4b5563;
          border-color: #6b7280;
        }
        
        .calendar-container .fc-button-active {
          background: #d4af37 !important;
          border-color: #d4af37 !important;
          color: black !important;
        }
        
        .calendar-container .fc-event {
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .calendar-container .fc-timegrid-slot {
          color: #9ca3af;
        }
        
        .calendar-container .fc-timegrid-axis {
          color: #9ca3af;
        }
        
        .calendar-container .fc-list-event {
          cursor: pointer;
        }
        
        .calendar-container .fc-list-event:hover {
          background: #1f2937;
        }
      `}</style>
    </div>
  )
}