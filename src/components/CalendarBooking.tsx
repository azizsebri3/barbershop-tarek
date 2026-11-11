'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import Calendar from 'react-calendar'
import { format, addMonths, isSameDay, isToday, isBefore, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, ChevronRight, Sparkles } from 'lucide-react'
import { useOpeningHours } from '@/lib/useOpeningHoursCached'
import { useServices } from '@/lib/useServicesCached'
import { useLanguage } from '@/lib/language-context'
import { weekdayKeyForDate } from '@/lib/booking-calendar'
import '../styles/calendar.css'

type CalendarValue = Date | Date[] | null | [Date | null, Date | null]

interface CalendarBookingProps {
  onBookingSelect: (booking: { date: string; time: string; service: string }) => void
  selectedService?: string
}

interface TimeSlot {
  time: string
  available: boolean
  isBooked?: boolean
}

export default function CalendarBooking({ onBookingSelect, selectedService }: CalendarBookingProps) {
  const { t, locale } = useLanguage()
  const {
    hours: openingHours,
    bookingHorizonMonths,
    refetch: refetchOpeningHours,
  } = useOpeningHours()
  const { services } = useServices()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [currentService, setCurrentService] = useState<string>(selectedService || '')
  const [step, setStep] = useState<'service' | 'date' | 'time'>('service')
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [configuredSlots, setConfiguredSlots] = useState<string[] | null>(null)
  const [availabilityByDate, setAvailabilityByDate] = useState<
    Record<string, Array<{ is_available: boolean }>>
  >({})
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState(false)

  const loadCalendarAvailability = useCallback(async () => {
    const today = new Date()
    const endDate = addMonths(today, bookingHorizonMonths)
    const startDate = format(today, 'yyyy-MM-dd')
    const endDateString = format(endDate, 'yyyy-MM-dd')

    try {
      const response = await fetch(
        `/api/availability?startDate=${startDate}&endDate=${endDateString}`,
        { cache: 'no-store' },
      )
      if (!response.ok) throw new Error('Unable to load availability')

      const slots: Array<{ date: string; is_available: boolean }> = await response.json()
      const grouped = slots.reduce<Record<string, Array<{ is_available: boolean }>>>(
        (result, slot) => {
          if (!result[slot.date]) result[slot.date] = []
          result[slot.date].push({ is_available: slot.is_available })
          return result
        },
        {},
      )
      setAvailabilityByDate(grouped)
    } catch (error) {
      console.error('Error loading calendar availability:', error)
    }
  }, [bookingHorizonMonths])

  useEffect(() => {
    loadCalendarAvailability()
    refetchOpeningHours()
    const interval = window.setInterval(() => {
      loadCalendarAvailability()
      refetchOpeningHours()
    }, 15000)
    return () => window.clearInterval(interval)
  }, [loadCalendarAvailability, refetchOpeningHours])

  // Sync external selectedService prop into internal state so
  // CalendarBooking shows the date/time UI when parent already selected a service.
  useEffect(() => {
    if (selectedService) {
      setCurrentService(selectedService)
      setStep('date')
    } else {
      // if parent clears selection, reset internal state
      setCurrentService('')
      setStep('service')
    }
  }, [selectedService])

  // Obtenir le nom du service (au cas où currentService serait un ID)
  const currentServiceName = useMemo(() => {
    if (!currentService) return ''
    
    // Vérifier si c'est un ID (format UUID) ou un nom
    const serviceById = services.find(s => s.id === currentService)
    if (serviceById) return t.services.serviceCatalog[serviceById.translationKey as keyof typeof t.services.serviceCatalog]?.name || serviceById.name
    
    // Sinon c'est déjà un nom
    return currentService
  }, [currentService, services, t])

  // Générer les créneaux horaires disponibles
  const generateTimeSlots = useCallback((date: Date, serviceDuration: number = 30) => {
    const dayOfWeek = format(date, 'EEEE', { locale: fr }).toLowerCase()
    const dayKey = dayOfWeek === 'lundi' ? 'monday' :
                  dayOfWeek === 'mardi' ? 'tuesday' :
                  dayOfWeek === 'mercredi' ? 'wednesday' :
                  dayOfWeek === 'jeudi' ? 'thursday' :
                  dayOfWeek === 'vendredi' ? 'friday' :
                  dayOfWeek === 'samedi' ? 'saturday' :
                  'sunday'

    const dayHours = openingHours[dayKey as keyof typeof openingHours]
    if (!dayHours || dayHours.closed) return []

    const slots: TimeSlot[] = []
    const [openHour, openMin] = dayHours.open.split(':').map(Number)
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number)
    
    const startTime = openHour * 60 + openMin
    const endTime = closeHour * 60 + closeMin
    
    for (let time = startTime; time <= endTime - serviceDuration; time += 15) {
      const hour = Math.floor(time / 60)
      const min = time % 60
      const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
      
      // Si c'est aujourd'hui, vérifier que l'heure n'est pas passée
      const isAvailable = isToday(date) ? 
        (new Date().getHours() * 60 + new Date().getMinutes()) < time :
        true
      
      const isBooked = bookedSlots.includes(`${format(date, 'yyyy-MM-dd')}_${timeString}`)
      
      slots.push({
        time: timeString,
        available: isAvailable && !isBooked,
        isBooked
      })
    }
    
    return slots
  }, [openingHours, bookedSlots])

  // Charger les créneaux calculés avec les disponibilités configurées par l'admin.
  const loadAvailableSlots = useCallback(async (date: Date, duration: number) => {
    try {
      setIsLoadingSlots(true)
      setSlotsError(false)
      setConfiguredSlots(null)
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/bookings/availability?date=${dateStr}&duration=${duration}`,
        { cache: 'no-store' }
      )
      if (response.ok) {
        const data: { allSlots: string[]; availableSlots: string[] } = await response.json()
        setConfiguredSlots(data.allSlots)
        setBookedSlots(data.allSlots.filter(time => !data.availableSlots.includes(time)).map(time => `${dateStr}_${time}`))
      } else {
        console.error('Error loading availability slots:', response.status)
        setSlotsError(true)
        setConfiguredSlots([])
      }
    } catch (error) {
      console.error('Error loading availability slots:', error)
      setSlotsError(true)
      setConfiguredSlots([])
    } finally {
      setIsLoadingSlots(false)
    }
  }, [])

  // Memoiser les créneaux pour éviter les recalculs inutiles
  const memoizedTimeSlots = useMemo(() => {
    if (!currentService || !selectedDate || services.length === 0) return []
    
    // Rechercher le service par ID ou par nom
    const service = services.find(s => s.id === currentService || s.name === currentService)
    if (configuredSlots) {
      return configuredSlots.map(time => ({
        time,
        available: !bookedSlots.includes(`${format(selectedDate, 'yyyy-MM-dd')}_${time}`) &&
          (isToday(selectedDate)
          ? (new Date().getHours() * 60 + new Date().getMinutes()) <
            Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
          : true),
        isBooked: bookedSlots.includes(`${format(selectedDate, 'yyyy-MM-dd')}_${time}`),
      }))
    }
    return generateTimeSlots(selectedDate, service?.duration || 30);
  }, [selectedDate, currentService, services, configuredSlots, bookedSlots, generateTimeSlots])

  // Effet pour charger les créneaux réservés uniquement quand nécessaire
  useEffect(() => {
    if (selectedDate && step === 'time') {
      const service = services.find(s => s.id === currentService || s.name === currentService)
      loadAvailableSlots(selectedDate, service?.duration || 30)
    }
  }, [selectedDate, step, currentService, services, loadAvailableSlots])

  useEffect(() => {
    if (step !== 'time' || !selectedDate || !currentService) return

    const service = services.find(s => s.id === currentService || s.name === currentService)
    const refreshSlots = () => {
      loadAvailableSlots(selectedDate, service?.duration || 30)
    }
    const interval = window.setInterval(refreshSlots, 15000)

    return () => window.clearInterval(interval)
  }, [selectedDate, step, currentService, services, loadAvailableSlots])

  const handleDateChange = (value: CalendarValue) => {
    if (!value) return
    const date = Array.isArray(value) ? value[0] : value
    if (date instanceof Date) {
      setSelectedDate(date)
      setSelectedTime('')
      setStep('time')
    }
  }

  const handleTimeSelect = (time: string) => {
    // Récupérer le nom du service sélectionné
    const selectedServiceData = services.find(s => s.id === currentService)
    const serviceName = selectedServiceData
      ? t.services.serviceCatalog[selectedServiceData.translationKey as keyof typeof t.services.serviceCatalog]?.name || selectedServiceData.name
      : currentService

    setSelectedTime(time)
    onBookingSelect({
      date: format(selectedDate, 'yyyy-MM-dd'),
      time,
      service: serviceName
    })
  }

  const handleServiceSelect = (serviceName: string) => {
    setCurrentService(serviceName)
    setStep('date')
  }

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const today = startOfDay(new Date())
      const isBeforeToday = isBefore(date, today)
      const dateKey = format(date, 'yyyy-MM-dd')
      const configuredDay = availabilityByDate[dateKey]
      const hasAvailableSlot = configuredDay?.some(slot => slot.is_available) ?? false

      if (isBeforeToday) return true
      if (configuredDay) return !hasAvailableSlot
      const weekday = weekdayKeyForDate(dateKey)
      return !weekday || openingHours[weekday].closed
    }
    return false
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      if (isToday(date)) return 'today'
      if (isSameDay(date, selectedDate)) return 'selected'
    }
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Navigation des étapes */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${step === 'service' ? 'text-accent' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'service' ? 'bg-accent text-black' : 'bg-gray-600'}`}>1</div>
          <span className="hidden sm:block font-medium">Service</span>
        </div>
        <ChevronRight className="text-gray-600" size={16} />
        <div className={`flex items-center space-x-2 ${step === 'date' ? 'text-accent' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'date' ? 'bg-accent text-black' : 'bg-gray-600'}`}>2</div>
          <span className="hidden sm:block font-medium">Date</span>
        </div>
        <ChevronRight className="text-gray-600" size={16} />
        <div className={`flex items-center space-x-2 ${step === 'time' ? 'text-accent' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'time' ? 'bg-accent text-black' : 'bg-gray-600'}`}>3</div>
          <span className="hidden sm:block font-medium">Heure</span>
        </div>
      </div>

      {/* Étape 1: Sélection du service */}
      {step === 'service' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-white mb-6">Choisissez votre service</h3>
          <div className="grid gap-4">
            {services.map((service) => (
              <motion.button
                key={service.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleServiceSelect(service.name)}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-accent/50 hover:bg-white/10 transition-all duration-300 text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-white">{t.services.serviceCatalog[service.translationKey as keyof typeof t.services.serviceCatalog]?.name || service.name}</h4>
                    <p className="text-gray-400 text-sm mt-1">{t.services.serviceCatalog[service.translationKey as keyof typeof t.services.serviceCatalog]?.description || service.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-accent font-medium">{service.price}€</span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock size={14} />
                        {service.duration} {t.services.durationUnit}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Étape 2: Sélection de la date */}
      {step === 'date' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{t.booking.chooseDate}</h3>
            <button
              onClick={() => setStep('service')}
              className="text-accent hover:text-accent/80 text-sm"
            >
              ← {t.booking.changeService}
            </button>
          </div>
          
          <div className="calendar-container bg-white/5 rounded-xl p-4">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileDisabled={tileDisabled}
              tileClassName={tileClassName}
              minDate={new Date()}
              maxDate={addMonths(new Date(), bookingHorizonMonths)}
              locale={locale === 'nl' ? 'nl-NL' : locale === 'en' ? 'en-GB' : 'fr-FR'}
              className="modern-calendar"
            />
          </div>
          
          <div className="text-sm text-gray-400 text-center">
            {t.booking.closedSunday}
          </div>
        </motion.div>
      )}

      {/* Étape 3: Sélection de l'heure */}
      {step === 'time' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              {t.booking.availableSlots}
            </h3>
            <button
              onClick={() => setStep('date')}
              className="text-accent hover:text-accent/80 text-sm"
            >
              ← {t.booking.changeDate}
            </button>
          </div>
          
          <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
            <div className="text-center">
              <p className="text-accent font-medium">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
              <p className="text-gray-400 text-sm">{currentServiceName}</p>
            </div>
          </div>

          {slotsError ? (
            <p role="alert" className="text-red-300">
              {locale === 'fr' ? 'Impossible de charger les disponibilités. Réessayez.' :
                locale === 'nl' ? 'Beschikbaarheid kon niet worden geladen. Probeer opnieuw.' :
                  'Unable to load availability. Please try again.'}
            </p>
          ) : memoizedTimeSlots.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, staggerChildren: 0.05 }}
              className="grid grid-cols-3 sm:grid-cols-4 gap-3"
            >
              {memoizedTimeSlots.map((slot, index) => (
                <motion.button
                  key={slot.time}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={slot.available ? { 
                    scale: 1.05,
                    boxShadow: '0 8px 20px rgba(212, 175, 55, 0.2)'
                  } : {}}
                  whileTap={slot.available ? { scale: 0.95 } : {}}
                  onClick={() => slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available || isLoadingSlots}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden
                    ${slot.available && !isLoadingSlots
                      ? 'bg-white/5 border border-white/20 hover:border-accent hover:bg-accent/10 text-white' 
                      : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                    }
                    ${slot.isBooked ? 'bg-red-900/50 border-red-700' : ''}
                    ${selectedTime === slot.time ? 'bg-accent text-black border-accent shadow-lg shadow-accent/30' : ''}
                    ${isLoadingSlots ? 'loading-time-slot' : ''}
                  `}
                >
                  {slot.time}
                  {slot.isBooked && (
                    <span className="absolute inset-0 flex items-center justify-center bg-red-900/80 text-red-200 text-xs">
                      {t.booking.occupied}
                    </span>
                  )}
                  {selectedTime === slot.time && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Sparkles className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-400 text-lg">{t.booking.noSlots}</p>
              <p className="text-gray-500 text-sm mt-2">{t.booking.tryAnotherDay}</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}