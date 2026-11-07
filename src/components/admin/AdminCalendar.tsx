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
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useRealtimeBookings } from '@/lib/useRealtimeBookings'
import { Booking } from '@/lib/supabase'
import { useServices } from '@/lib/useServicesCached'

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
          <span className="text-white">Available</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="availability"
            checked={!isAvailable}
            onChange={() => setIsAvailable(false)}
            className="form-radio text-red-500"
          />
          <span className="text-white">Unavailable</span>
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
            <span className="text-white">All day</span>
          </label>

          {/* Heures spécifiques */}
          {!isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">End</label>
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
          Save
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
  
  // Utilisation du hook Realtime pour les réservations
  const { 
    bookings, 
    isRealtimeConnected
  } = useRealtimeBookings({
    enableNotifications: true // Afficher des notifications toast
  })

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'
  )
  const [showAvailability, setShowAvailability] = useState(true)
  const [calendarTitle, setCalendarTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'booking' | 'availability' | 'create'>('booking')
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const { services } = useServices()
  const [manualBooking, setManualBooking] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    message: '',
  })
  const [manualBookingLoading, setManualBookingLoading] = useState(false)

  // Plus besoin de loadBookings - géré par le hook Realtime

  // Load availabilities (PAS de realtime pour les disponibilités selon les specs)
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
      console.error('Error loading availability:', error)
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
        toast.success('Availability saved')
      } else {
        throw new Error('Error saving availability')
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      // Pour l'instant, juste mettre à jour le state local
      if (slot.id) {
        setAvailability(prev => prev.map(s => 
          s.id === slot.id ? slot : s
        ))
      } else {
        const newSlot = { ...slot, id: Date.now().toString() }
        setAvailability(prev => [...prev, newSlot])
      }
      toast.success('Availability saved (local)')
    }
  }

  // Delete an availability
  const deleteAvailability = async (slotId: string) => {
    try {
      const response = await fetch(`/api/availability/${slotId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadAvailability()
        toast.success('Availability deleted')
      } else {
        throw new Error('Error deleting availability')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      // Fallback local
      setAvailability(prev => prev.filter(s => s.id !== slotId))
      toast.success('Availability deleted (local)')
    }
  }

  useEffect(() => {
    // Plus besoin de loadBookings() - géré par le hook Realtime
    loadAvailability()
  }, [])

  useEffect(() => {
    calendarRef.current?.getApi().changeView(currentView)
  }, [currentView])

  const navigateCalendar = (action: 'prev' | 'next' | 'today') => {
    const calendar = calendarRef.current?.getApi()
    if (!calendar) return
    calendar[action]()
  }

  // Convert data to events for FullCalendar
  const events = [
    // Bookings
    ...bookings.map(booking => ({
      id: `booking-${booking.id}`,
      title: `${booking.service} - ${booking.name}`,
      start: `${booking.date}T${booking.time}`,
      end: `${booking.date}T${addMinutes(booking.time, getServiceDuration(booking.service))}`,
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
      title: 'Available',
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

  function getServiceDuration(serviceName: string): number {
    const service = services.find(item =>
      item.name === serviceName ||
      item.nameEn === serviceName ||
      item.id === serviceName
    )
    return service?.duration || 30
  }

  const openManualBooking = (date: Date) => {
    const datePart = date.toLocaleDateString('en-CA')
    const timePart = date.toTimeString().slice(0, 5)
    setManualBooking(prev => ({
      ...prev,
      date: datePart,
      time: timePart,
      service: prev.service || services[0]?.name || '',
    }))
    setModalType('create')
    setShowModal(true)
  }

  const createManualBooking = async (event: React.FormEvent) => {
    event.preventDefault()
    setManualBookingLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualBooking),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to create the appointment')
      toast.success('Appointment added to the calendar')
      setShowModal(false)
      setManualBooking({ name: '', email: '', phone: '', service: '', date: '', time: '', message: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create the appointment')
    } finally {
      setManualBookingLoading(false)
    }
  }

  const moveBooking = async (event: any) => {
    const booking = event.event.extendedProps.data as Booking
    const start = event.event.start as Date
    const updates = {
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: start.toISOString().slice(0, 10),
      time: start.toTimeString().slice(0, 5),
      service: booking.service,
      message: booking.message || '',
      lang: booking.language || 'fr',
      notifyClient: true,
    }

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error((await response.json()).error || 'Time slot unavailable')
      toast.success('Appointment rescheduled')
    } catch (error) {
      event.revert()
      toast.error(error instanceof Error ? error.message : 'Unable to move the appointment')
    }
  }

  // Gérer les clics sur les événements
  const handleEventClick = (clickInfo: any) => {
    clickInfo.jsEvent.preventDefault()
    clickInfo.jsEvent.stopPropagation()
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

  // Change booking status
  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    if (status === 'cancelled' && !window.confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Booking ${status === 'confirmed' ? 'confirmed' : 'cancelled'}`)
        // Pas besoin de recharger - Realtime met à jour automatiquement
        // loadBookings()
        setShowModal(false)
      } else {
        throw new Error('Error updating booking')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error updating booking status')
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-accent/10 p-3">
            <Calendar className="text-accent" size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Admin Calendar
              {/* Indicateur Realtime */}
              <span className={`ml-3 text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                isRealtimeConnected 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-orange-500/20 text-orange-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isRealtimeConnected ? 'bg-green-400 animate-pulse' : 'bg-orange-400'
                }`}></span>
                {isRealtimeConnected ? 'Live' : 'Offline'}
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-400">Tarek&apos;s schedule, updated in real time</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle disponibilités */}
          <button
            onClick={() => setShowAvailability(!showAvailability)}
              className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
              showAvailability 
                  ? 'border-sky-400/30 bg-sky-400/15 text-sky-200 hover:bg-sky-400/25'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {showAvailability ? <Eye size={16} /> : <EyeOff size={16} />}
            <span className="text-sm">Availability</span>
          </button>
          
          <button
            type="button"
            onClick={() => openManualBooking(new Date())}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-primary transition hover:bg-accent-light"
          >
            <Plus size={16} />
            <span>Add appointment</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="text-blue-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Total appointments</p>
              <p className="text-white font-bold text-xl">{bookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Confirmed</p>
              <p className="text-white font-bold text-xl">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4">
          <div className="flex items-center space-x-3">
            <Clock className="text-yellow-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-white font-bold text-xl">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="text-red-400" size={24} />
            <div>
              <p className="text-gray-400 text-sm">Cancelled</p>
              <p className="text-white font-bold text-xl">
                {bookings.filter(b => b.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-3 border-b border-white/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => navigateCalendar('prev')} aria-label="Previous period" className="calendar-nav-button"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => navigateCalendar('today')} className="calendar-today-button">Today</button>
            <button type="button" onClick={() => navigateCalendar('next')} aria-label="Next period" className="calendar-nav-button"><ChevronRight size={18} /></button>
            <h2 className="ml-1 truncate text-base font-semibold text-white sm:text-lg">{calendarTitle}</h2>
          </div>
          <div className="grid grid-cols-4 rounded-xl border border-white/10 bg-black/20 p-1">
            {([
              ['timeGridDay', 'Day'],
              ['timeGridWeek', 'Week'],
              ['dayGridMonth', 'Month'],
              ['listWeek', 'List'],
            ] as const).map(([view, label]) => (
              <button
                key={view}
                type="button"
                onClick={() => setCurrentView(view)}
                className={`rounded-lg px-2 py-2 text-xs font-medium transition sm:px-3 ${currentView === view ? 'bg-accent text-primary' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="calendar-container px-1 py-2 sm:p-5">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView}
            headerToolbar={false}
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            select={(selectionInfo) => openManualBooking(selectionInfo.start)}
            eventDrop={moveBooking}
            eventResize={moveBooking}
            dayMaxEvents={3}
            weekends={true}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            height="auto"
            locale="fr"
            allDaySlot={false}
            nowIndicator={true}
            slotDuration="00:15:00"
            slotLabelInterval="01:00:00"
            scrollTime="09:00:00"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            expandRows={true}
            stickyHeaderDates={true}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: '09:00',
              endTime: '18:00'
            }}
            datesSet={(dateInfo) => setCalendarTitle(dateInfo.view.title)}
            eventDidMount={(info) => {
              // Styles personnalisés pour les événements
              const element = info.el
              element.style.cursor = 'pointer'
              
              if (info.event.extendedProps.type === 'booking') {
                const booking = info.event.extendedProps.data as Booking
                element.style.touchAction = 'manipulation'
                element.title = `${booking.name} - ${booking.service}\n${booking.phone}\nStatus: ${booking.status}`
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
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-white/10 bg-[#181818] p-5 shadow-2xl sm:rounded-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {modalType === 'create' && (
              <form className="space-y-4" onSubmit={createManualBooking}>
                <div>
                  <h2 className="text-xl font-bold text-white">Add appointment</h2>
                  <p className="text-gray-400 text-sm mt-1">Tarek&apos;s schedule</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input required placeholder="Customer name" value={manualBooking.name} onChange={(e) => setManualBooking({ ...manualBooking, name: e.target.value })} className="admin-calendar-input" />
                  <input required type="tel" placeholder="Phone" value={manualBooking.phone} onChange={(e) => setManualBooking({ ...manualBooking, phone: e.target.value })} className="admin-calendar-input" />
                  <input required type="email" placeholder="Email" value={manualBooking.email} onChange={(e) => setManualBooking({ ...manualBooking, email: e.target.value })} className="admin-calendar-input" />
                  <select required value={manualBooking.service} onChange={(e) => setManualBooking({ ...manualBooking, service: e.target.value })} className="admin-calendar-input">
                    <option value="">Choose a service</option>
                    {services.map(service => <option key={service.id} value={service.name}>{service.name} · {service.duration} min</option>)}
                  </select>
                  <input required type="date" value={manualBooking.date} onChange={(e) => setManualBooking({ ...manualBooking, date: e.target.value })} className="admin-calendar-input" />
                  <input required type="time" step="900" value={manualBooking.time} onChange={(e) => setManualBooking({ ...manualBooking, time: e.target.value })} className="admin-calendar-input" />
                </div>
                <textarea placeholder="Note (optional)" value={manualBooking.message} onChange={(e) => setManualBooking({ ...manualBooking, message: e.target.value })} className="admin-calendar-input min-h-20" />
                <button disabled={manualBookingLoading} className="w-full bg-accent text-primary px-4 py-3 rounded-lg font-semibold disabled:opacity-50">
                  {manualBookingLoading ? 'Adding...' : 'Add to calendar'}
                </button>
              </form>
            )}

            {modalType === 'booking' && selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                    <User className="text-accent" size={20} />
                    Appointment details
                  </h2>
                  <span className="rounded-full bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent">
                    Select an action
                  </span>
                </div>
                
                {(() => {
                  const booking = selectedEvent.extendedProps.data as Booking
                  return (
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">Customer</p>
                        <p className="text-white font-medium">{booking.name}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Date</p>
                          <p className="text-white">{new Date(booking.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Time</p>
                          <p className="text-white">{booking.time}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Service</p>
                        <p className="text-white">{booking.service}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Contact</p>
                        <a href={`mailto:${booking.email}`} className="block break-all text-accent hover:underline">{booking.email}</a>
                        <a href={`tel:${booking.phone}`} className="block text-accent hover:underline">{booking.phone}</a>
                      </div>
                      
                      {booking.message && (
                        <div>
                          <p className="text-gray-400 text-sm">Message</p>
                          <p className="text-white text-sm">{booking.message}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-gray-400 text-sm">Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-600 text-white' :
                          booking.status === 'cancelled' ? 'bg-red-600 text-white' :
                          'bg-yellow-600 text-black'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmed' :
                           booking.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                        </span>
                      </div>
                      
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <div className="grid grid-cols-1 gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
                          {booking.status === 'pending' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="min-h-11 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
                          >
                            Confirm appointment
                          </button>
                          )}
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="min-h-11 rounded-xl bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/25"
                          >
                            Cancel appointment
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
            
            {/* Modal for availabilities */}
            {modalType === 'availability' && selectedDate && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="text-blue-400" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Availability - {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Set availability hours
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
              Close
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Styles CSS pour FullCalendar */}
      <style jsx global>{`
        .calendar-container .fc {
          font-family: inherit;
          color: #d6d3d1;
        }
        
        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th {
          border-color: rgba(255, 255, 255, 0.08);
        }
        
        .calendar-container .fc-theme-standard .fc-scrollgrid {
          border-color: rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .calendar-container .fc-col-header {
          background: #1b1b1b;
        }
        
        .calendar-container .fc-col-header-cell {
          background: #1b1b1b;
          color: #a8a29e;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 10px 6px;
          text-transform: uppercase;
        }
        
        .calendar-container .fc-daygrid-day {
          background: #151515;
        }
        
        .calendar-container .fc-daygrid-day:hover {
          background: #202020;
        }
        
        .calendar-container .fc-day-today {
          background: rgba(184, 115, 51, 0.13) !important;
        }
        
        .calendar-container .fc-daygrid-day-number {
          color: #d6d3d1;
          font-weight: 500;
          padding: 8px;
        }
        
        .calendar-container .fc-timegrid-col,
        .calendar-container .fc-timegrid-axis,
        .calendar-container .fc-timegrid-slot {
          background: #151515;
        }
        
        .calendar-container .fc-timegrid-slot-label {
          color: #78716c;
          font-size: 0.7rem;
        }
        
        .calendar-container .fc-timegrid-now-indicator-line {
          border-color: #d97706;
          border-width: 2px;
        }

        .calendar-container .fc-timegrid-now-indicator-arrow {
          border-bottom-color: #d97706;
          border-top-color: #d97706;
        }
        
        .calendar-container .fc-event {
          border-radius: 7px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
          font-size: 12px;
          font-weight: 500;
          min-height: 30px;
          padding: 3px 5px;
        }
        
        .calendar-container .fc-event-main {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .calendar-container .fc-list {
          border-color: rgba(255, 255, 255, 0.08);
        }

        .calendar-container .fc-list-day-cushion {
          background: #24201d;
        }

        .calendar-container .fc-list-event td {
          background: #151515;
          border-color: rgba(255, 255, 255, 0.06);
          padding: 10px 8px;
        }
        
        .calendar-container .fc-list-event:hover td {
          background: #24201d;
        }

        .calendar-nav-button,
        .calendar-today-button {
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #d6d3d1;
          display: inline-flex;
          justify-content: center;
          min-height: 38px;
          transition: background-color 150ms ease, color 150ms ease;
        }

        .calendar-nav-button {
          border-radius: 0.65rem;
          min-width: 38px;
        }

        .calendar-today-button {
          border-radius: 0.65rem;
          font-size: 0.78rem;
          padding: 0 0.75rem;
        }

        .calendar-nav-button:hover,
        .calendar-today-button:hover {
          background: rgba(184, 115, 51, 0.15);
          color: #f0b27a;
        }

        .calendar-container .fc-list-event {
          cursor: pointer;
        }

        .admin-calendar-input {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 0.5rem;
          background: #171717;
          color: white;
          padding: 0.7rem 0.8rem;
        }

        @media (max-width: 640px) {
          .calendar-container {
            font-size: 0.8rem;
          }

          .calendar-container .fc-timegrid-slot {
            height: 3rem;
          }

          .calendar-container .fc-timegrid-axis {
            width: 3.25rem;
            font-size: 0.7rem;
          }

          .calendar-container .fc-event {
            font-size: 0.68rem;
            line-height: 1.2;
            min-height: 32px;
            padding: 3px;
          }

          .calendar-container .fc-col-header-cell {
            font-size: 0.62rem;
            padding: 8px 2px;
          }

          .calendar-container .fc-daygrid-day-number {
            padding: 6px;
          }
        }
      `}</style>
    </div>
  )
}