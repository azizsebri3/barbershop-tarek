'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  Plus,
  RefreshCw
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { format, parseISO, subDays } from 'date-fns'
import { useRealtimeBookings } from '@/lib/useRealtimeBookings'
import { useOpeningHours } from '@/lib/useOpeningHoursCached'
import { Booking } from '@/lib/supabase'
import { useServices } from '@/lib/useServicesCached'
import { weeklyAvailabilityEvents, type AvailabilitySlot } from '@/lib/admin-calendar-availability'
import { bookingLanguageLabel, buildAdminCalendarEvents, type BlockedTimeSlot, type PendingBlockedRange } from '@/lib/admin-calendar-events'
import { calendarView, threeDayView } from '@/lib/admin-calendar-view'
import { isPastDateKey, weekdayKeyForDate } from '@/lib/booking-calendar'
import { appointmentStarted } from '@/lib/admin-today'
import AvailabilityForm from './AvailabilityForm'
import '@/styles/admin-calendar.css'


function manualBookingError(message: unknown): string {
  if (typeof message !== 'string') return 'Unable to create the appointment'

  const translations: Record<string, string> = {
    'Tous les champs requis doivent être remplis': 'All required fields must be completed',
    'Erreur lors du chargement des paramètres de réservation': 'Unable to load booking settings',
    'Erreur lors de la vérification des disponibilités': 'Unable to check availability',
    'Erreur lors de la vérification des réservations client': 'Unable to check customer appointments',
    'Erreur lors de la création de la réservation': 'Unable to create the appointment',
  }
  const nextTime = message.match(/^Vous avez déjà un RDV ce jour\. Vous pouvez reprendre un RDV à partir de (\d{2}:\d{2})\.$/)
  if (nextTime) return `This customer already has an appointment today. The next appointment can start at ${nextTime[1]}.`
  return translations[message] || message
}

export default function AdminCalendar() {
  const calendarRef = useRef<FullCalendar>(null)
  
  // Utilisation du hook Realtime pour les réservations
  const { 
    bookings,
    loading: bookingsLoading,
    isRealtimeConnected,
    refetch: refetchBookings
  } = useRealtimeBookings({
    enableNotifications: true // Afficher des notifications toast
  })

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const { hours: openingHours, loading: hoursLoading, error: hoursError, refetch: refetchHours } = useOpeningHours()
  const [visibleRange, setVisibleRange] = useState<{ start: string; end: string } | null>(null)
  const [loadedAvailabilityRange, setLoadedAvailabilityRange] = useState<{ startDate: string; endDate: string } | null>(null)
  const availabilityRequest = useRef(0)
  const blockedSlotsRequest = useRef(0)
  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>([])
  const [blockMode, setBlockMode] = useState(false)
  const [pendingBlockedRanges, setPendingBlockedRanges] = useState<PendingBlockedRange[]>([])
  const [pendingUnblockIds, setPendingUnblockIds] = useState<string[]>([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [calendarRefreshing, setCalendarRefreshing] = useState(false)
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  const [blockedSlotsSaving, setBlockedSlotsSaving] = useState(false)
  const [blockedSlotDeleting, setBlockedSlotDeleting] = useState(false)
  const [calendarActionLoading, setCalendarActionLoading] = useState(false)
  const [calendarActionLabel, setCalendarActionLabel] = useState('')
  const availabilityEditingEnabled = true
  const [isMobile, setIsMobile] = useState(false)
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'
  )
  const [showAvailability, setShowAvailability] = useState(true)
  const [calendarTitle, setCalendarTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'booking' | 'availability' | 'blocked' | 'create'>('booking')
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilitySlot | undefined>()
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
  const [bookingStartTime, setBookingStartTime] = useState('')
  const [bookingEndTime, setBookingEndTime] = useState('')
  const [bookingDurationSaving, setBookingDurationSaving] = useState(false)
  const [showCancellation, setShowCancellation] = useState(false)
  const [cancellationNote, setCancellationNote] = useState('')
  const [cancellationSaving, setCancellationSaving] = useState(false)
  const [visitSaving, setVisitSaving] = useState(false)

  // Plus besoin de loadBookings - géré par le hook Realtime

  const getCalendarDateRange = useCallback(() => {
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + 60)
    if (visibleRange) {
      const visibleStart = parseISO(visibleRange.start)
      if (visibleStart < start) start.setTime(visibleStart.getTime())
      const lastVisibleDay = parseISO(visibleRange.end)
      lastVisibleDay.setDate(lastVisibleDay.getDate() - 1)
      if (lastVisibleDay > end) end.setTime(lastVisibleDay.getTime())
    }
    const formatDate = (date: Date) => [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
    return { startDate: formatDate(start), endDate: formatDate(end) }
  }, [visibleRange])

  // Load availabilities (PAS de realtime pour les disponibilités selon les specs)
  const loadAvailability = useCallback(async () => {
    const requestId = ++availabilityRequest.current
    try {
      const { startDate, endDate } = getCalendarDateRange()
      
      const response = await fetch(`/api/availability?startDate=${startDate}&endDate=${endDate}`, {
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        if (requestId === availabilityRequest.current) {
          setAvailability(data)
          setLoadedAvailabilityRange({ startDate, endDate })
        }
        return true
      } else {
        throw new Error('Unable to load availability')
      }
    } catch (error) {
      console.error('Error loading availability:', error)
      if (requestId === availabilityRequest.current) setLoadedAvailabilityRange(null)
      toast.error('Unable to load availability')
      return false
    }
  }, [getCalendarDateRange])

  const loadBlockedSlots = useCallback(async () => {
    const requestId = ++blockedSlotsRequest.current
    try {
      const { startDate, endDate } = getCalendarDateRange()
      const response = await fetch(`/api/blocked-slots?startDate=${startDate}&endDate=${endDate}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('Unable to load blocked time slots')
      const data = await response.json()
      if (requestId === blockedSlotsRequest.current) setBlockedSlots(data)
      return true
    } catch (error) {
      console.error('Error loading blocked slots:', error)
      toast.error('Unable to load blocked time slots')
      return false
    }
  }, [getCalendarDateRange])

  const refreshCalendar = async () => {
    setCalendarRefreshing(true)
    try {
      const results = await Promise.all([refetchBookings(), loadAvailability(), loadBlockedSlots(), refetchHours()])
      if (results.every(Boolean)) {
        toast.success('Calendar refreshed')
      } else {
        toast.error('Calendar refresh incomplete. Please try again.')
      }
    } catch (error) {
      console.error('Error refreshing calendar:', error)
      toast.error('Unable to refresh calendar')
    } finally {
      setCalendarRefreshing(false)
    }
  }

  // Sauvegarder les disponibilités
  const saveAvailability = async (slot: AvailabilitySlot) => {
    if (!availabilityEditingEnabled) {
      toast.error('Availability controls are temporarily disabled')
      return
    }
    if (isPastDateKey(slot.date)) {
      toast.error('Past availability cannot be changed')
      return
    }

    setAvailabilitySaving(true)
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
        await loadBlockedSlots()
        setShowModal(false)
        setSelectedEvent(null)
        setSelectedAvailability(undefined)
        toast.success('Availability saved')
      } else {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Error saving availability')
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      toast.error(error instanceof Error ? error.message : 'Error saving availability')
      throw error
    } finally {
      setAvailabilitySaving(false)
    }
  }

  // Delete an availability
  const deleteAvailability = async (slotId: string) => {
    if (!availabilityEditingEnabled) {
      toast.error('Availability controls are temporarily disabled')
      return
    }
    const slot = availability.find(item => item.id === slotId)
    if (slot && isPastDateKey(slot.date)) {
      toast.error('Past availability cannot be changed')
      return
    }

    setAvailabilitySaving(true)
    try {
      const response = await fetch(`/api/availability/${slotId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadAvailability()
        toast.success('Availability deleted')
      } else {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Error deleting availability')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error(error instanceof Error ? error.message : 'Error deleting availability')
    } finally {
      setAvailabilitySaving(false)
    }
  }

  useEffect(() => {
    if (!visibleRange) return
    let active = true
    setCalendarLoading(true)
    Promise.all([loadAvailability(), loadBlockedSlots()]).finally(() => {
      if (active) setCalendarLoading(false)
    })
    return () => { active = false }
  }, [visibleRange, loadAvailability, loadBlockedSlots])

  useEffect(() => {
    if (hoursError) toast.error('Unable to load opening hours; weekly availability is hidden')
  }, [hoursError])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const updateMobile = () => setIsMobile(mediaQuery.matches)
    updateMobile()
    mediaQuery.addEventListener('change', updateMobile)
    return () => mediaQuery.removeEventListener('change', updateMobile)
  }, [])

  useEffect(() => {
    calendarRef.current?.getApi().changeView(calendarView(currentView, isMobile))
  }, [currentView, isMobile])

  useEffect(() => {
    const calendar = calendarRef.current?.getApi()
    if (!calendar || !currentView.startsWith('timeGrid')) return
    calendar.scrollToTime('09:00:00')
  }, [currentView])

  const navigateCalendar = (action: 'prev' | 'next' | 'today') => {
    const calendar = calendarRef.current?.getApi()
    if (!calendar) return
    calendar[action]()
  }

  const getServiceDuration = useCallback((serviceName: string): number => {
    const service = services.find(item =>
      item.name === serviceName ||
      item.nameEn === serviceName ||
      item.id === serviceName
    )
    return service?.duration || 30
  }, [services])

  // Convert data to events for FullCalendar
  const visibleRangeLoaded = visibleRange && loadedAvailabilityRange &&
    loadedAvailabilityRange.startDate <= visibleRange.start &&
    loadedAvailabilityRange.endDate >= format(subDays(parseISO(visibleRange.end), 1), 'yyyy-MM-dd')
  const weeklyEvents = (currentView === 'dayGridMonth' || currentView === 'timeGridWeek') &&
    visibleRange && visibleRangeLoaded && !hoursLoading && !hoursError
    ? weeklyAvailabilityEvents(
      parseISO(visibleRange.start),
      parseISO(visibleRange.end),
      openingHours,
      availability,
      new Date(),
      currentView === 'timeGridWeek' ? 'week' : 'month',
    )
    : []
  const events = buildAdminCalendarEvents({
    bookings, availability, weeklyEvents, blockedSlots, pendingBlockedRanges,
    pendingUnblockIds, blockMode, showAvailability, hoursLoading, hoursError,
    openingHours, addMinutes, getServiceDuration,
  })

  // Fonction utilitaire pour ajouter des minutes
  function addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  const calendarBusinessHours = [
    { key: 'monday', day: 1 },
    { key: 'tuesday', day: 2 },
    { key: 'wednesday', day: 3 },
    { key: 'thursday', day: 4 },
    { key: 'friday', day: 5 },
    { key: 'saturday', day: 6 },
    { key: 'sunday', day: 0 },
  ].flatMap(({ key, day }) => {
    const hours = openingHours[key as keyof typeof openingHours]
    return hours.closed
      ? []
      : [{ daysOfWeek: [day], startTime: hours.open, endTime: hours.close }]
  })

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

  const addBlockedRange = (selectionInfo: any) => {
    const start = selectionInfo.start as Date
    const end = selectionInfo.end as Date
    const date = [
      start.getFullYear(),
      String(start.getMonth() + 1).padStart(2, '0'),
      String(start.getDate()).padStart(2, '0'),
    ].join('-')
    const startTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
    const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`

    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = end.getHours() * 60 + end.getMinutes()
    const overlappingBlockedSlots = blockedSlots.filter(slot => {
      if (slot.date !== date || pendingUnblockIds.includes(slot.id)) return false
      const blockedStart = Number(slot.start_time.slice(0, 2)) * 60 + Number(slot.start_time.slice(3, 5))
      const blockedEnd = Number(slot.end_time.slice(0, 2)) * 60 + Number(slot.end_time.slice(3, 5))
      return startMinutes < blockedEnd && endMinutes > blockedStart
    })

    if (overlappingBlockedSlots.length > 0) {
      setPendingUnblockIds(ids => [
        ...ids,
        ...overlappingBlockedSlots.map(slot => slot.id).filter(id => !ids.includes(id)),
      ])
      toast.success(`${overlappingBlockedSlots.length} blocked slot${overlappingBlockedSlots.length === 1 ? '' : 's'} selected to unblock`)
    } else {
      setPendingBlockedRanges(ranges => [...ranges, { date, start_time: startTime, end_time: endTime }])
      toast.success('Time range selected to block')
    }
    calendarRef.current?.getApi().unselect()
  }

  const confirmBlockedRanges = async () => {
    if (pendingBlockedRanges.length === 0 && pendingUnblockIds.length === 0) return
    setBlockedSlotsSaving(true)
    try {
      const response = await fetch('/api/blocked-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: pendingBlockedRanges, unblockIds: pendingUnblockIds }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to block these time slots')
      await loadBlockedSlots()
      setPendingBlockedRanges([])
      setPendingUnblockIds([])
      setBlockMode(false)
      toast.success('Time slot changes saved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to block these time slots')
    } finally {
      setBlockedSlotsSaving(false)
    }
  }

  const cancelBlockedRanges = () => {
    setPendingBlockedRanges([])
    setPendingUnblockIds([])
    setBlockMode(false)
    calendarRef.current?.getApi().unselect()
  }

  const deleteBlockedSlot = async (slot: BlockedTimeSlot) => {
    setBlockedSlotDeleting(true)
    try {
      const response = await fetch(`/api/blocked-slots?id=${slot.id}`, { method: 'DELETE' })
      if (!response.ok) {
        toast.error('Unable to remove the block')
        return
      }
      const refreshed = await loadBlockedSlots()
      setShowModal(false)
      if (refreshed) {
        toast.success('Time slot is available again')
      } else {
        toast.error('The block was removed, but the calendar could not be refreshed')
      }
    } catch (error) {
      console.error('Error removing blocked slot:', error)
      toast.error('Unable to remove the block')
    } finally {
      setBlockedSlotDeleting(false)
    }
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
      if (!response.ok) throw new Error(manualBookingError(result.error))
      await refetchBookings()
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
    if (
      event.event.extendedProps.type !== 'booking' ||
      event.event.extendedProps.data.status === 'cancelled'
    ) {
      event.revert()
      toast.error('Cancelled appointments cannot be moved')
      return
    }

    const booking = event.event.extendedProps.data as Booking
    const start = event.event.start as Date
    const date = [
      start.getFullYear(),
      String(start.getMonth() + 1).padStart(2, '0'),
      String(start.getDate()).padStart(2, '0'),
    ].join('-')
    const time = [
      String(start.getHours()).padStart(2, '0'),
      String(start.getMinutes()).padStart(2, '0'),
    ].join(':')
    const updates = {
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date,
      time,
      service: booking.service,
      duration_minutes: booking.duration_minutes || getServiceDuration(booking.service),
      message: booking.message || '',
      lang: booking.language || 'fr',
      notifyClient: true,
    }

    setCalendarActionLabel('Updating appointment...')
    setCalendarActionLoading(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error((await response.json()).error || 'Time slot unavailable')
      await refetchBookings()
      toast.success('Appointment rescheduled')
    } catch (error) {
      event.revert()
      toast.error(error instanceof Error ? error.message : 'Unable to move the appointment')
    } finally {
      setCalendarActionLoading(false)
    }
  }

  const resizeBooking = async (event: any) => {
    if (event.event.extendedProps.type !== 'booking') {
      event.revert()
      return
    }

    const booking = event.event.extendedProps.data as Booking
    if (booking.status === 'cancelled' || !event.event.start || !event.event.end) {
      event.revert()
      toast.error('Cancelled appointments cannot be resized')
      return
    }

    const start = event.event.start as Date
    const end = event.event.end as Date
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
    const date = [
      start.getFullYear(),
      String(start.getMonth() + 1).padStart(2, '0'),
      String(start.getDate()).padStart(2, '0'),
    ].join('-')
    const time = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
    if (durationMinutes < 15) {
      event.revert()
      toast.error('Appointment duration must be at least 15 minutes')
      return
    }

    setCalendarActionLabel('Updating appointment duration...')
    setCalendarActionLoading(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          date,
          time,
          service: booking.service,
          duration_minutes: durationMinutes,
          message: booking.message || '',
          lang: booking.language || 'fr',
          notifyClient: true,
        }),
      })
      if (!response.ok) {
        throw new Error((await response.json()).error || 'Appointment overlaps another booking')
      }
      await refetchBookings()
      toast.success('Appointment duration updated')
    } catch (error) {
      event.revert()
      toast.error(error instanceof Error ? error.message : 'Unable to resize appointment')
    } finally {
      setCalendarActionLoading(false)
    }
  }

  const resizeAvailability = async (event: any) => {
    if (event.event.extendedProps.type !== 'availability') {
      event.revert()
      return
    }

    const slot = event.event.extendedProps.data as AvailabilitySlot
    if (slot.is_all_day || !event.event.start || !event.event.end) {
      event.revert()
      return
    }

    const start = event.event.start as Date
    const end = event.event.end as Date
    const updatedSlot: AvailabilitySlot = {
      ...slot,
      date: [
        start.getFullYear(),
        String(start.getMonth() + 1).padStart(2, '0'),
        String(start.getDate()).padStart(2, '0'),
      ].join('-'),
      start_time: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
      end_time: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
    }

    setCalendarActionLabel('Updating availability...')
    setCalendarActionLoading(true)
    try {
      await saveAvailability(updatedSlot)
      setSelectedAvailability(updatedSlot)
      toast.success('Availability hours updated')
    } catch (error) {
      event.revert()
      toast.error(error instanceof Error ? error.message : 'Unable to update availability')
    } finally {
      setCalendarActionLoading(false)
    }
  }

  // Gérer les clics sur les événements
  const handleEventClick = (clickInfo: any) => {
    clickInfo.jsEvent.preventDefault()
    clickInfo.jsEvent.stopPropagation()
    if (blockMode || clickInfo.event.extendedProps.type === 'pending-blocked') return
    setSelectedEvent(clickInfo.event)
    const eventType = clickInfo.event.extendedProps.type
    if (eventType === 'booking') {
      const booking = clickInfo.event.extendedProps.data as Booking
      setShowCancellation(false)
      setCancellationNote('')
      const duration = booking.duration_minutes || getServiceDuration(booking.service)
      setBookingStartTime(booking.time)
      setBookingEndTime(addMinutes(booking.time, duration))
    }
    if (eventType === 'availability') {
      const slot = clickInfo.event.extendedProps.data as AvailabilitySlot
      if (isPastDateKey(slot.date)) {
        toast.error('Past availability cannot be changed')
        return
      }
      setSelectedDate(slot.date)
      setSelectedAvailability(slot)
    }
    setModalType(eventType)
    setShowModal(true)
  }

  useEffect(() => {
    if (bookingsLoading) return
    const id = sessionStorage.getItem('admin-open-booking')
    if (!id) return
    sessionStorage.removeItem('admin-open-booking')
    const booking = bookings.find(item => item.id === id)
    if (!booking) {
      toast.error('Appointment could not be found')
      return
    }
    setSelectedEvent({ extendedProps: { data: booking } })
    setBookingStartTime(booking.time)
    setBookingEndTime(addMinutes(booking.time, booking.duration_minutes || getServiceDuration(booking.service)))
    setCancellationNote('')
    setShowCancellation(false)
    setModalType('booking')
    setShowModal(true)
  }, [bookings, bookingsLoading, getServiceDuration])

  const updateVisitOutcome = async (booking: Booking, outcome: Booking['visit_outcome']) => {
    setVisitSaving(true)
    try {
      const response = await fetch('/api/admin/visit-outcome', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, outcome }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to update visit status')
      setSelectedEvent({ extendedProps: { data: { ...booking, visit_outcome: outcome } } })
      await refetchBookings()
      toast.success('Visit status updated')
    } catch (error) {
      console.error('Unable to update visit status:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to update visit status')
    } finally {
      setVisitSaving(false)
    }
  }

  const saveBookingDuration = async (booking: Booking) => {
    const startMinutes = toMinutes(bookingStartTime)
    const endMinutes = toMinutes(bookingEndTime)
    const durationMinutes = endMinutes - startMinutes

    if (!bookingStartTime || !bookingEndTime || durationMinutes < 15 || durationMinutes % 15 !== 0) {
      toast.error('End time must be at least 15 minutes after start time')
      return
    }

    setBookingDurationSaving(true)
    setCalendarActionLabel('Updating appointment duration...')
    setCalendarActionLoading(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          date: booking.date,
          time: bookingStartTime,
          service: booking.service,
          duration_minutes: durationMinutes,
          message: booking.message || '',
          lang: booking.language || 'fr',
          notifyClient: true,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || 'Unable to update appointment duration')
      await refetchBookings()
      setShowModal(false)
      toast.success('Appointment duration updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update appointment duration')
    } finally {
      setBookingDurationSaving(false)
      setCalendarActionLoading(false)
    }

    function toMinutes(time: string): number {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }
  }

  // Gérer les clics sur les dates
  const handleDateClick = (dateInfo: any) => {
    if (blockMode) return
    if (!availabilityEditingEnabled) {
      toast.error('Availability controls are temporarily disabled')
      return
    }

    const dateTime = String(dateInfo.dateStr)
    const date = dateTime.slice(0, 10)
    if (isPastDateKey(date)) {
      toast.error('Past availability cannot be changed')
      return
    }
    const matchingSlot = availability.find(slot => slot.date === date)

    setSelectedDate(date)
    setSelectedEvent(null)
    setSelectedAvailability(matchingSlot)
    setModalType('availability')
    setShowModal(true)
  }

  const deleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment?')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })
      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.error || 'Unable to delete appointment')
      }

      await refetchBookings()
      setShowModal(false)
      setSelectedEvent(null)
      toast.success('Appointment deleted')
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to delete appointment')
    }
  }

  // Change booking status
  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled', note = '') => {
    if (status === 'cancelled') setCancellationSaving(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status === 'cancelled' ? { status, cancel_note: note.trim() } : { status })
      })

      if (response.ok) {
        const result = await response.json()
        await refetchBookings()
        toast.success(`Booking ${status === 'confirmed' ? 'confirmed' : 'cancelled'}`)
        if (status === 'cancelled' && result.clientNotified === false) {
          toast.error('Appointment cancelled, but the client email could not be sent.')
        }
        // Pas besoin de recharger - Realtime met à jour automatiquement
        // loadBookings()
        setShowModal(false)
      } else {
        throw new Error('Error updating booking')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error updating booking status')
    } finally {
      if (status === 'cancelled') setCancellationSaving(false)
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
          <button
            type="button"
            onClick={refreshCalendar}
            disabled={calendarLoading || calendarRefreshing || calendarActionLoading || blockedSlotsSaving || pendingBlockedRanges.length > 0 || pendingUnblockIds.length > 0}
            title={pendingBlockedRanges.length > 0 || pendingUnblockIds.length > 0 ? 'Save or cancel your selected time slots before refreshing' : 'Refresh calendar'}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={calendarRefreshing ? 'animate-spin' : undefined} />
            <span>{calendarRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
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
            onClick={() => setBlockMode(mode => !mode)}
            className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
              blockMode ? 'border-gray-400 bg-gray-500/30 text-white' : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Clock size={16} />
            <span>{blockMode ? 'Select more time slots' : 'Block time slots'}</span>
          </button>
          {blockMode && (
            <p className="w-full text-xs text-gray-400 sm:text-sm">
              Drag across working hours to block them. On a phone, touch and hold, then drag. Tap a blocked slot, then choose Make available to unblock it.
            </p>
          )}
          {blockMode && (pendingBlockedRanges.length > 0 || pendingUnblockIds.length > 0) && (
            <>
              <button
                type="button"
                onClick={confirmBlockedRanges}
                disabled={blockedSlotsSaving}
                className="min-h-11 rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-primary transition hover:bg-accent-light disabled:opacity-50"
              >
                {blockedSlotsSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    Saving...
                  </span>
                ) : (
                  `Save changes (${pendingBlockedRanges.length + pendingUnblockIds.length})`
                )}
              </button>
              <button
                type="button"
                onClick={cancelBlockedRanges}
                className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10"
              >
                Cancel
              </button>
            </>
          )}
          
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
        <div className="calendar-container relative min-h-[18rem] px-1 py-2 sm:p-5">
          {(calendarLoading || calendarActionLoading || calendarRefreshing) && (
            <div className="calendar-loading-overlay absolute inset-0 z-10 flex min-h-[18rem] items-center justify-center overflow-hidden bg-[#151515]/90 px-3">
              <div className="flex max-w-full items-center gap-2 rounded-xl bg-black/50 px-3 py-3 text-center text-xs text-gray-200 sm:gap-3 sm:px-4 sm:text-sm">
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
                <span className="truncate">
                  {calendarLoading ? 'Loading calendar...' : calendarRefreshing ? 'Refreshing calendar...' : calendarActionLabel}
                </span>
              </div>
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView}
            views={{ timeGridThreeDays: threeDayView }}
            headerToolbar={false}
            events={events}
            eventOrder={isMobile ? 'calendarOrder,start,-duration,title' : 'start,-duration,allDay,title'}
            eventOrderStrict={isMobile}
            editable={availabilityEditingEnabled}
            eventStartEditable={availabilityEditingEnabled}
            eventDurationEditable={availabilityEditingEnabled}
            eventAllow={(_dropInfo, draggedEvent) =>
              draggedEvent !== null &&
              ((draggedEvent.extendedProps.type === 'booking' &&
                draggedEvent.extendedProps.data.status !== 'cancelled') ||
                draggedEvent.extendedProps.type === 'availability')
            }
            selectMirror={true}
            eventDrop={moveBooking}
            eventResize={(event) => {
              if (event.event.extendedProps.type === 'availability') {
                return resizeAvailability(event)
              }
              return resizeBooking(event)
            }}
            eventResizableFromStart={true}
            eventOverlap={true}
            slotEventOverlap={true}
            dayMaxEvents={3}
            weekends={true}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            selectable={blockMode}
            longPressDelay={300}
            selectLongPressDelay={300}
            selectAllow={(selectionInfo) => {
              if (!blockMode) return false
              const start = selectionInfo.start as Date
              const end = selectionInfo.end as Date
              const date = [
                start.getFullYear(),
                String(start.getMonth() + 1).padStart(2, '0'),
                String(start.getDate()).padStart(2, '0'),
              ].join('-')
              if (start.toDateString() !== end.toDateString()) return false
              if (isPastDateKey(format(start, 'yyyy-MM-dd'))) return false

              const startMinutes = start.getHours() * 60 + start.getMinutes()
              const endMinutes = end.getHours() * 60 + end.getMinutes()
              const dateAvailability = availability.filter(slot => slot.date === date)
              if (dateAvailability.length > 0) {
                return dateAvailability.some(slot => {
                  if (!slot.is_available) return false
                  const availabilityStart = slot.is_all_day ? 0 : Number(slot.start_time.slice(0, 2)) * 60 + Number(slot.start_time.slice(3, 5))
                  const availabilityEnd = slot.is_all_day ? 24 * 60 : Number(slot.end_time.slice(0, 2)) * 60 + Number(slot.end_time.slice(3, 5))
                  return startMinutes >= availabilityStart && endMinutes <= availabilityEnd
                })
              }

              const weekday = weekdayKeyForDate(date)
              if (!weekday) return false
              const weeklyHours = openingHours[weekday]
              if (weeklyHours.closed) return false
              const openingMinutes = Number(weeklyHours.open.slice(0, 2)) * 60 + Number(weeklyHours.open.slice(3, 5))
              const closingMinutes = Number(weeklyHours.close.slice(0, 2)) * 60 + Number(weeklyHours.close.slice(3, 5))
              return startMinutes >= openingMinutes && endMinutes <= closingMinutes
            }}
            select={addBlockedRange}
            height={currentView.startsWith('timeGrid') ? '70vh' : 'auto'}
            locale="fr"
            allDaySlot={false}
            nowIndicator={true}
            slotDuration="00:15:00"
            slotLabelInterval="00:15:00"
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            scrollTime="09:00:00"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            expandRows={true}
            stickyHeaderDates={true}
            businessHours={calendarBusinessHours}
            datesSet={(dateInfo) => {
              setCalendarTitle(dateInfo.view.title)
              const start = format(dateInfo.start, 'yyyy-MM-dd')
              const end = format(dateInfo.end, 'yyyy-MM-dd')
              setVisibleRange(previous =>
                previous?.start === start && previous.end === end ? previous : { start, end },
              )
            }}
            eventDidMount={(info) => {
              // Styles personnalisés pour les événements
              const element = info.el
              if (!info.event.extendedProps.weekly || currentView !== 'timeGridWeek') {
                element.style.cursor = 'pointer'
              }
              
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
      {showModal && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => { if (!cancellationSaving && !visitSaving) setShowModal(false) }}
        >
          <div
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

                      <div>
                        <p className="text-gray-400 text-sm">Booking language</p>
                        <p className="text-white">{bookingLanguageLabel(booking.language)}</p>
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

                      {booking.status !== 'cancelled' && (
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <label className="mb-2 block text-sm text-gray-400">
                            Appointment time
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="time"
                              step="900"
                              value={bookingStartTime}
                              onChange={(event) => setBookingStartTime(event.target.value)}
                              disabled={bookingDurationSaving || cancellationSaving || visitSaving}
                              className="admin-calendar-input"
                            />
                            <input
                              type="time"
                              step="900"
                              value={bookingEndTime}
                              onChange={(event) => setBookingEndTime(event.target.value)}
                              disabled={bookingDurationSaving || cancellationSaving || visitSaving}
                              className="admin-calendar-input"
                            />
                            <button
                              type="button"
                              onClick={() => saveBookingDuration(booking)}
                              disabled={bookingDurationSaving || cancellationSaving || visitSaving}
                              className="min-w-24 rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-primary disabled:opacity-50"
                            >
                              {bookingDurationSaving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">Start time - End time</p>
                        </div>
                      )}
                      
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

                      {booking.status === 'cancelled' && booking.cancel_note && (
                        <div>
                          <p className="text-gray-400 text-sm">Cancellation reason</p>
                          <p className="text-white text-sm whitespace-pre-wrap">{booking.cancel_note}</p>
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

                      {booking.status === 'confirmed' && appointmentStarted(booking.date, booking.time, new Date()) && (
                        <div className="space-y-2 rounded-xl border border-white/10 p-3">
                          <p className="text-sm text-gray-400">Visit status</p>
                          <p className="text-white">{booking.visit_outcome === 'completed' ? 'Completed' : booking.visit_outcome === 'no_show' ? 'No-show' : 'Not recorded'}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button type="button" disabled={visitSaving || bookingDurationSaving || cancellationSaving} onClick={() => updateVisitOutcome(booking, 'completed')} className="min-h-11 rounded-xl bg-emerald-500/20 px-3 text-sm text-emerald-300 disabled:opacity-50">Mark completed</button>
                            <button type="button" disabled={visitSaving || bookingDurationSaving || cancellationSaving} onClick={() => updateVisitOutcome(booking, 'no_show')} className="min-h-11 rounded-xl bg-orange-500/20 px-3 text-sm text-orange-300 disabled:opacity-50">Mark no-show</button>
                          </div>
                          {booking.visit_outcome && <button type="button" disabled={visitSaving} onClick={() => updateVisitOutcome(booking, null)} className="min-h-11 text-sm text-gray-300 underline disabled:opacity-50">Clear visit status</button>}
                        </div>
                      )}
                      
                      {!showCancellation && (booking.status === 'pending' || booking.status === 'confirmed') && (
                        <div className="grid grid-cols-1 gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
                          {booking.status === 'pending' && (
                          <button
                            disabled={bookingDurationSaving || visitSaving}
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="min-h-11 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
                          >
                            Confirm appointment
                          </button>
                          )}
                          <button
                            disabled={bookingDurationSaving || visitSaving}
                            onClick={() => { setCancellationNote(''); setShowCancellation(true) }}
                            className="min-h-11 rounded-xl bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-50"
                          >
                            Cancel appointment
                          </button>
                        </div>
                      )}

                      {showCancellation && (booking.status === 'pending' || booking.status === 'confirmed') && (
                        <div className="space-y-3 rounded-xl border border-red-500/30 p-4">
                          <p className="text-gray-300 text-sm">Cancel this appointment? The reason, if provided, is included in the client&apos;s email.</p>
                          <label htmlFor="calendar-cancellation-note" className="block text-sm text-gray-300">Cancellation reason (optional)</label>
                          <textarea
                            id="calendar-cancellation-note"
                            value={cancellationNote}
                            onChange={event => setCancellationNote(event.target.value)}
                            disabled={cancellationSaving || visitSaving}
                            rows={3}
                            className="admin-calendar-input"
                          />
                          <div className="flex gap-2">
                            <button type="button" disabled={cancellationSaving} onClick={() => setShowCancellation(false)}
                              className="flex-1 rounded-xl bg-gray-700 px-3 py-2 text-white disabled:opacity-50">Back</button>
                            <button type="button" disabled={cancellationSaving} onClick={() => updateBookingStatus(booking.id, 'cancelled', cancellationNote)}
                              className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-white disabled:opacity-50">
                              {cancellationSaving ? 'Cancelling...' : 'Confirm cancellation'}
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={cancellationSaving || visitSaving}
                        onClick={() => deleteBooking(booking.id)}
                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Delete appointment permanently
                      </button>
                    </div>
                  )
                })()}
              </div>
            )}
            
            {/* Modal for availabilities */}
            {modalType === 'blocked' && selectedEvent && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Blocked time slot</h2>
                <p className="text-gray-300">
                  {selectedEvent.extendedProps.data.start_time} - {selectedEvent.extendedProps.data.end_time}
                </p>
                <button
                  type="button"
                  onClick={() => deleteBlockedSlot(selectedEvent.extendedProps.data as BlockedTimeSlot)}
                  disabled={blockedSlotDeleting}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black disabled:opacity-50"
                >
                  {blockedSlotDeleting ? 'Making available...' : 'Make available'}
                </button>
              </div>
            )}

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
                  key={`${selectedDate}-${selectedAvailability?.id || 'new'}`}
                  date={selectedDate}
                  existingSlot={
                    selectedAvailability
                  }
                  onSave={saveAvailability}
                  onDelete={deleteAvailability}
                  isSaving={availabilitySaving}
                />
              </div>
            )}
            
            <button
              onClick={() => setShowModal(false)}
              disabled={cancellationSaving}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}