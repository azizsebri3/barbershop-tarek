import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_BOOKING_HORIZON_MONTHS,
  isPastDateKey,
  isValidDateKey,
  isWithinBookingHorizon,
  normalizeBookingHorizonMonths,
  weekdayKeyForDate,
} from '../lib/booking-calendar.ts'

const today = new Date(2026, 10, 10, 12)

test('booking window uses a configurable calendar-month limit', () => {
  assert.equal(isWithinBookingHorizon('2026-11-10', 4, today), true)
  assert.equal(isWithinBookingHorizon('2027-03-10', 4, today), true)
  assert.equal(isWithinBookingHorizon('2027-03-11', 4, today), false)
  assert.equal(isWithinBookingHorizon('2027-01-10', 2, today), true)
  assert.equal(isWithinBookingHorizon('2027-01-11', 2, today), false)
})

test('past and malformed dates are not bookable', () => {
  assert.equal(isPastDateKey('2026-11-09', today), true)
  assert.equal(isPastDateKey('2026-11-10', today), false)
  assert.equal(isValidDateKey('2026-02-30'), false)
  assert.equal(isWithinBookingHorizon('not-a-date', 4, today), false)
})

test('booking horizon setting is constrained to one through twelve months', () => {
  assert.equal(normalizeBookingHorizonMonths(8), 8)
  assert.equal(normalizeBookingHorizonMonths(0), DEFAULT_BOOKING_HORIZON_MONTHS)
  assert.equal(normalizeBookingHorizonMonths(13), DEFAULT_BOOKING_HORIZON_MONTHS)
})

test('weekday is derived from the date string without timezone shifts', () => {
  assert.equal(weekdayKeyForDate('2026-11-10'), 'tuesday')
  assert.equal(weekdayKeyForDate('invalid'), null)
})
