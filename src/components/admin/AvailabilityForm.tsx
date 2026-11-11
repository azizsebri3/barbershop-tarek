'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import type { AvailabilitySlot } from '@/lib/admin-calendar-availability'

export default function AvailabilityForm({
  date,
  existingSlot,
  onSave,
  onDelete,
  isSaving = false,
}: {
  date: string
  existingSlot?: AvailabilitySlot
  onSave: (slot: AvailabilitySlot) => Promise<void>
  onDelete?: (slotId: string) => void
  isSaving?: boolean
}) {
  const [isAllDay, setIsAllDay] = useState(existingSlot?.is_all_day ?? false)
  const [startTime, setStartTime] = useState(existingSlot?.start_time ?? '09:00')
  const [endTime, setEndTime] = useState(existingSlot?.end_time ?? '18:00')
  const [isAvailable, setIsAvailable] = useState(existingSlot?.is_available ?? true)

  useEffect(() => {
    setIsAllDay(existingSlot?.is_all_day ?? false)
    setStartTime(existingSlot?.start_time ?? '09:00')
    setEndTime(existingSlot?.end_time ?? '18:00')
    setIsAvailable(existingSlot?.is_available ?? true)
  }, [existingSlot, date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const slot: AvailabilitySlot = {
      id: existingSlot?.id,
      date,
      start_time: isAllDay ? '00:00' : startTime,
      end_time: isAllDay ? '23:59' : endTime,
      is_available: isAvailable,
      is_all_day: isAllDay
    }

    try {
      await onSave(slot)
    } catch {
      // The save handler already reports the server error.
    }
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
          disabled={isSaving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </span>
          ) : 'Save'}
        </button>
        {existingSlot?.id && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(existingSlot.id!)}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </form>
  )
}

