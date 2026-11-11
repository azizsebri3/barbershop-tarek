import { test } from 'node:test'
import assert from 'node:assert/strict'
import { durationForBooking, validateRescheduleTime } from '../lib/reschedule-availability.ts'
import { openingHours } from '../lib/data.ts'

const now = new Date('2026-11-10T09:00:00Z')
const base = {
  date: '2026-11-13', time: '10:00', duration: 60, horizon: 4, now,
  availability: [], blocked: [], bookings: [], email: 'client@example.invalid', hours: openingHours,
}
const testSlot = changes => validateRescheduleTime({ ...base, ...changes })

test('allows an open free slot and respects configured opening and closures', () => {
  assert.equal(testSlot({}), null)
  assert.match(testSlot({ time: '09:00' }), /outside/)
  assert.match(testSlot({ time: '18:15' }), /outside/)
  assert.match(testSlot({ date: '2026-11-15' }), /outside/)
  assert.match(testSlot({ availability: [{ start_time: '00:00', end_time: '23:59', is_all_day: true, is_available: false }] }), /outside/)
  assert.equal(testSlot({ date: '2026-11-15', availability: [{ start_time: '10:00', end_time: '12:00', is_all_day: false, is_available: true }] }), null)
  assert.match(testSlot({ time: '10:07' }), /outside/)
})

test('checks the entire duration against pauses and other appointments', () => {
  assert.match(testSlot({ blocked: [{ start_time: '10:45', end_time: '11:15' }] }), /blocked/)
  assert.equal(testSlot({ blocked: [{ start_time: '11:00', end_time: '11:15' }] }), null)
  const booked = { time: '10:45', duration_minutes: 45, service: 'Cut', email: 'other@example.invalid', status: 'pending' }
  assert.match(testSlot({ bookings: [booked] }), /already booked/)
  assert.match(testSlot({ time: '11:15', duration: 30, bookings: [booked] }), /already booked/)
  assert.equal(testSlot({ time: '11:30', duration: 30, bookings: [booked] }), null)
  assert.equal(durationForBooking(75, 'Cut'), 75)
  assert.equal(durationForBooking(null, 'Barbe + Coupe'), 60)
})

test('applies client gap on the destination date and checks date and time inputs', () => {
  const sameClient = { time: '11:30', duration_minutes: 30, service: 'Cut', email: 'CLIENT@example.invalid', status: 'confirmed' }
  assert.match(testSlot({ bookings: [sameClient] }), /1 hour/)
  assert.equal(testSlot({ time: '09:30', bookings: [sameClient] }), null)
  assert.match(testSlot({ date: '2026-11-09' }), /booking window/)
  assert.match(testSlot({ date: '2026-02-30' }), /booking window/)
  assert.match(testSlot({ time: 'abc' }), /Invalid/)
  assert.match(testSlot({ date: '2026-11-10', time: '09:45' }), /passed/)
})

test('booking window uses the salon date around Brussels midnight', () => {
  const beforeMidnightUtc = new Date('2026-11-10T23:30:00Z')
  assert.match(testSlot({ now: beforeMidnightUtc, date: '2026-11-10' }), /booking window/)
  assert.equal(testSlot({ now: beforeMidnightUtc, date: '2026-11-11', time: '10:00' }), null)
})
