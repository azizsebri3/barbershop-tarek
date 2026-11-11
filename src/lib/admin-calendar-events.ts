import { availabilityEvent, type AvailabilitySlot, type weeklyAvailabilityEvents } from './admin-calendar-availability.ts'
import { isPastDateKey } from './booking-calendar.ts'
import type { OpeningHours } from './data'
import type { Booking } from './supabase'

export interface PendingBlockedRange {
  date: string
  start_time: string
  end_time: string
}

export interface BlockedTimeSlot extends PendingBlockedRange {
  id: string
  reason?: string | null
}

interface CalendarEventOptions {
  bookings: Booking[]
  availability: AvailabilitySlot[]
  weeklyEvents: ReturnType<typeof weeklyAvailabilityEvents>
  blockedSlots: BlockedTimeSlot[]
  pendingBlockedRanges: PendingBlockedRange[]
  pendingUnblockIds: string[]
  blockMode: boolean
  showAvailability: boolean
  hoursLoading: boolean
  hoursError: unknown
  openingHours: OpeningHours
  addMinutes: (time: string, minutes: number) => string
  getServiceDuration: (serviceName: string) => number
}

export function bookingLanguageLabel(language: Booking['language'] | null): string {
  switch (language) {
    case 'fr': return 'French'
    case 'en': return 'English'
    case 'nl': return 'Dutch'
    default: return 'Not recorded'
  }
}

export function buildAdminCalendarEvents({
  bookings, availability, weeklyEvents, blockedSlots, pendingBlockedRanges,
  pendingUnblockIds, blockMode, showAvailability, hoursLoading, hoursError,
  openingHours, addMinutes, getServiceDuration,
}: CalendarEventOptions) {
  return [
    // Bookings
    ...bookings.map(booking => ({
      id: `booking-${booking.id}`,
      title: `${booking.service} - ${booking.name}`,
      start: `${booking.date}T${booking.time}`,
      end: `${booking.date}T${addMinutes(booking.time, booking.duration_minutes || getServiceDuration(booking.service))}`,
      backgroundColor: booking.status === 'confirmed' ? '#10b981' : 
                      booking.status === 'cancelled' ? '#ef4444' : '#f59e0b',
      borderColor: booking.status === 'confirmed' ? '#059669' : 
                   booking.status === 'cancelled' ? '#dc2626' : '#d97706',
      editable: booking.status !== 'cancelled',
      classNames: ['booking-event'],
      durationEditable: booking.status !== 'cancelled',
      startEditable: booking.status !== 'cancelled',
      extendedProps: {
        type: 'booking',
        calendarOrder: 0,
        data: booking
      }
    })),
    // Disponibilités (hidden while selecting blocked ranges)
    ...(!blockMode && showAvailability
      ? [
        ...availability.filter(slot => !isPastDateKey(slot.date)).map(slot =>
          availabilityEvent(slot, !hoursLoading && !hoursError ? openingHours : undefined),
        ),
        ...weeklyEvents,
      ]
      : []),
    ...(blockMode ? availability
      .filter(slot => !isPastDateKey(slot.date) && slot.is_available && !slot.is_all_day)
      .flatMap(slot => ([
        {
          id: `availability-boundary-start-${slot.id || slot.date}`,
          title: '',
          start: `${slot.date}T${slot.start_time}`,
          end: `${slot.date}T${addMinutes(slot.start_time, 15)}`,
          backgroundColor: 'transparent',
          borderColor: '#ef4444',
          editable: false,
          classNames: ['availability-boundary-event'],
          extendedProps: { type: 'availability-boundary' },
        },
        {
          id: `availability-boundary-end-${slot.id || slot.date}`,
          title: '',
          start: `${slot.date}T${addMinutes(slot.end_time, -15)}`,
          end: `${slot.date}T${slot.end_time}`,
          backgroundColor: 'transparent',
          borderColor: '#ef4444',
          editable: false,
          classNames: ['availability-boundary-event'],
          extendedProps: { type: 'availability-boundary' },
        },
      ])) : []),
    ...blockedSlots
      .filter(slot => !isPastDateKey(slot.date) && !pendingUnblockIds.includes(slot.id))
      .map(slot => ({
      id: `blocked-${slot.id}`,
      title: 'Occupé - salon',
      start: `${slot.date}T${slot.start_time}`,
      end: `${slot.date}T${slot.end_time}`,
      backgroundColor: '#6b7280',
      borderColor: '#4b5563',
      editable: false,
      classNames: ['blocked-time-event'],
      extendedProps: { type: 'blocked', calendarOrder: 0, data: slot }
      })),
    ...pendingBlockedRanges.map((slot, index) => ({
      id: `pending-blocked-${index}`,
      title: 'Pending block',
      start: `${slot.date}T${slot.start_time}`,
      end: `${slot.date}T${slot.end_time}`,
      backgroundColor: '#9ca3af',
      borderColor: '#d1d5db',
      editable: false,
      classNames: ['blocked-time-event'],
      extendedProps: { type: 'pending-blocked', calendarOrder: 0 }
    }))
  ]
}
