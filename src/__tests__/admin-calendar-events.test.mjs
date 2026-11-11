import { test } from 'node:test'
import assert from 'node:assert/strict'
import { format, addDays } from 'date-fns'
import { bookingLanguageLabel, buildAdminCalendarEvents } from '../lib/admin-calendar-events.ts'
import { openingHours } from '../lib/data.ts'

const date = format(addDays(new Date(), 7), 'yyyy-MM-dd')
const availability = { id: 'a', date, start_time: '09:00', end_time: '18:00', is_available: true, is_all_day: false }
const booking = { id: 'b', date, time: '10:00', service: 'Cut', name: 'Client', status: 'confirmed', duration_minutes: 45 }
const block = { id: 'c', date, start_time: '12:00', end_time: '13:00' }
const addMinutes = (time, amount) => {
  const [hours, minutes] = time.split(':').map(Number)
  const result = hours * 60 + minutes + amount
  return `${String(Math.floor(result / 60)).padStart(2, '0')}:${String(result % 60).padStart(2, '0')}`
}
const options = {
  bookings: [booking], availability: [availability], weeklyEvents: [], blockedSlots: [block],
  pendingBlockedRanges: [], pendingUnblockIds: [], blockMode: false, showAvailability: true,
  hoursLoading: false, hoursError: null, openingHours, addMinutes, getServiceDuration: () => 30,
}

test('calendar events preserve booking, availability and block data and times', () => {
  const events = buildAdminCalendarEvents(options)
  assert.deepEqual(events.map(event => event.id), ['booking-b', 'availability-a', 'blocked-c'])
  assert.equal(events[0].end, `${date}T10:45`)
  assert.equal(events[0].extendedProps.data, booking)
  assert.equal(events[1].durationEditable, true)
  assert.equal(events[2].extendedProps.data, block)
})

test('block mode replaces availability with boundaries and excludes selected blocks', () => {
  const events = buildAdminCalendarEvents({
    ...options, blockMode: true, pendingUnblockIds: ['c'],
    pendingBlockedRanges: [{ date, start_time: '14:00', end_time: '15:00' }],
  })
  assert.deepEqual(events.map(event => event.id), [
    'booking-b', 'availability-boundary-start-a', 'availability-boundary-end-a', 'pending-blocked-0',
  ])
  assert.equal(events[1].end, `${date}T09:15`)
  assert.equal(events[2].start, `${date}T17:45`)
})

test('hiding availability leaves appointments and blocked slots visible', () => {
  assert.deepEqual(buildAdminCalendarEvents({ ...options, showAvailability: false }).map(event => event.id), [
    'booking-b', 'blocked-c',
  ])
})

test('booking language is labelled and missing or unexpected values are not guessed', () => {
  assert.equal(bookingLanguageLabel('fr'), 'French')
  assert.equal(bookingLanguageLabel('en'), 'English')
  assert.equal(bookingLanguageLabel('nl'), 'Dutch')
  assert.equal(bookingLanguageLabel(undefined), 'Not recorded')
  assert.equal(bookingLanguageLabel(null), 'Not recorded')
  assert.equal(bookingLanguageLabel('de'), 'Not recorded')
})
