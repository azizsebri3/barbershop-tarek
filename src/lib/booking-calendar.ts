import { addMonths, format, isValid, parseISO, startOfDay } from 'date-fns'
import type { OpeningHours } from './data'

export const DEFAULT_BOOKING_HORIZON_MONTHS = 4
export const MIN_BOOKING_HORIZON_MONTHS = 1
export const MAX_BOOKING_HORIZON_MONTHS = 12

export function normalizeBookingHorizonMonths(value: unknown): number {
  if (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_BOOKING_HORIZON_MONTHS &&
    value <= MAX_BOOKING_HORIZON_MONTHS
  ) {
    return value
  }

  return DEFAULT_BOOKING_HORIZON_MONTHS
}

export function isValidDateKey(dateKey: string): boolean {
  const date = parseISO(dateKey)
  return isValid(date) && format(date, 'yyyy-MM-dd') === dateKey
}

export function isPastDateKey(dateKey: string, now = new Date()): boolean {
  return isValidDateKey(dateKey) && dateKey < format(now, 'yyyy-MM-dd')
}

export function isWithinBookingHorizon(
  dateKey: string,
  horizonMonths = DEFAULT_BOOKING_HORIZON_MONTHS,
  now = new Date(),
): boolean {
  if (!isValidDateKey(dateKey)) return false

  const today = format(now, 'yyyy-MM-dd')
  const lastBookableDay = format(
    addMonths(startOfDay(now), normalizeBookingHorizonMonths(horizonMonths)),
    'yyyy-MM-dd',
  )

  return dateKey >= today && dateKey <= lastBookableDay
}

export function weekdayKeyForDate(dateKey: string): keyof OpeningHours | null {
  if (!isValidDateKey(dateKey)) return null

  const [year, month, day] = dateKey.split('-').map(Number)
  const weekdays: Array<keyof OpeningHours> = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]

  return weekdays[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
}
