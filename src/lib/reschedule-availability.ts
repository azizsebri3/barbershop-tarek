import { openingHours as defaultHours, type OpeningHours } from './data.ts'
import { isWithinBookingHorizon, weekdayKeyForDate } from './booking-calendar.ts'

interface Range { start_time: string; end_time: string }
interface Availability extends Range { is_available: boolean; is_all_day: boolean }
interface ExistingBooking { time: string; service: string; duration_minutes?: number | null; email: string; status: string }

export function durationForBooking(duration: number | null | undefined, service: string): number {
  return Number.isInteger(duration) && duration! > 0 ? duration! : service === 'Barbe + Coupe' ? 60 : 30
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function overlapping(start: number, end: number, otherStart: number, otherEnd: number): boolean {
  return start < otherEnd && end > otherStart
}

export function validateRescheduleTime(options: {
  date: string
  time: string
  duration: number
  horizon: number
  availability: Availability[]
  blocked: Range[]
  bookings: ExistingBooking[]
  email: string
  hours: OpeningHours | null
  now?: Date
}): string | null {
  const { date, time, duration, horizon, availability, blocked, bookings, email } = options
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || !Number.isInteger(duration) || duration <= 0) return 'Invalid appointment time'
  const start = toMinutes(time)
  const end = start + duration
  if (end > 1440) return 'Appointment ends after midnight'
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(options.now || new Date())
  const get = (type: string) => parts.find(part => part.type === type)?.value
  const today = `${get('year')}-${get('month')}-${get('day')}`
  const salonToday = new Date(Number(get('year')), Number(get('month')) - 1, Number(get('day')), 12)
  if (!isWithinBookingHorizon(date, horizon, salonToday)) return 'Date is outside the booking window'
  if (date === today && start <= Number(get('hour')) * 60 + Number(get('minute'))) return 'Appointment time has passed'
  const weekday = weekdayKeyForDate(date)
  if (!weekday) return 'Invalid date'
  const weeklyHours = (options.hours || defaultHours)[weekday]
  const ranges = availability.length
    ? availability.filter(slot => slot.is_available).map(slot => ({
      start: slot.is_all_day ? 0 : toMinutes(slot.start_time),
      end: slot.is_all_day ? 1440 : toMinutes(slot.end_time),
    }))
    : weeklyHours && !weeklyHours.closed ? [{ start: toMinutes(weeklyHours.open), end: toMinutes(weeklyHours.close) }] : []
  if (!ranges.some(range => start >= range.start && end <= range.end && (start - range.start) % 15 === 0)) {
    return 'This time is outside available hours'
  }
  if (availability.some(slot => !slot.is_available && overlapping(start, end,
    slot.is_all_day ? 0 : toMinutes(slot.start_time), slot.is_all_day ? 1440 : toMinutes(slot.end_time)))) {
    return 'This day is unavailable'
  }
  if (blocked.some(slot => overlapping(start, end, toMinutes(slot.start_time), toMinutes(slot.end_time)))) {
    return 'This time is blocked'
  }
  for (const booking of bookings) {
    const otherStart = toMinutes(booking.time)
    const otherEnd = otherStart + durationForBooking(booking.duration_minutes, booking.service)
    if (overlapping(start, end, otherStart, otherEnd)) return 'This time is already booked'
    if (booking.status === 'confirmed' && booking.email.toLowerCase() === email.toLowerCase() &&
      ((start >= otherEnd && start - otherEnd < 60) || (otherStart >= end && otherStart - end < 60))) {
      return 'Minimum 1 hour gap required between appointments'
    }
  }
  return null
}
