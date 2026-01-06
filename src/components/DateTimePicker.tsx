'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface DateTimePickerProps {
  currentDate: string
  currentTime: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  excludeBookingId?: string
}

export default function DateTimePicker({
  currentDate,
  currentTime,
  onDateChange,
  onTimeChange,
  excludeBookingId
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date(currentDate))

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          date: selectedDate
        })
        if (excludeBookingId) {
          params.append('excludeBookingId', excludeBookingId)
        }

        const response = await fetch(`/api/bookings/availability?${params}`)
        const data = await response.json()
        
        if (response.ok) {
          setAvailableSlots(data.availableSlots)
          setOccupiedTimes(data.occupiedTimes)
        }
      } catch (error) {
        console.error('Error fetching availability:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [selectedDate, excludeBookingId])

  const handleDateSelect = (day: number) => {
    const date = new Date(currentMonth)
    date.setDate(day)
    const dateStr = date.toISOString().split('T')[0]
    setSelectedDate(dateStr)
    onDateChange(dateStr)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const monthDays = Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth(currentMonth) }, () => null)
  const days = [...emptyDays, ...monthDays]

  const monthName = currentMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear()
  }

  const isSelected = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString()
      .split('T')[0]
    return dateStr === selectedDate
  }

  const isPastDate = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return checkDate < today
  }

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-600 rounded transition"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h3 className="text-white font-semibold capitalize">{monthName}</h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-600 rounded transition"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
            <div key={day} className="text-center text-gray-400 text-sm font-semibold p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => day && !isPastDate(day) && handleDateSelect(day)}
              disabled={!day || isPastDate(day)}
              className={`p-2 rounded text-sm font-medium transition ${
                !day
                  ? 'bg-transparent'
                  : isPastDate(day)
                  ? 'bg-gray-600 text-gray-500 cursor-not-allowed'
                  : isSelected(day)
                  ? 'bg-accent text-black'
                  : isToday(day)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-white hover:bg-gray-500'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Horaires disponibles</h4>
        
        {loading ? (
          <div className="text-gray-400 text-center py-4">Chargement...</div>
        ) : availableSlots.length === 0 ? (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded">
            <AlertCircle size={16} />
            <span className="text-sm">Aucun créneau disponible pour cette date</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {availableSlots.map(time => (
              <motion.button
                key={time}
                onClick={() => onTimeChange(time)}
                whileHover={{ scale: 1.05 }}
                className={`p-2 rounded text-sm font-medium transition ${
                  currentTime === time
                    ? 'bg-accent text-black'
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                {time}
              </motion.button>
            ))}
          </div>
        )}

        {occupiedTimes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <p className="text-gray-400 text-xs mb-2">Créneaux occupés: {occupiedTimes.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
