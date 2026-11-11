import { test } from 'node:test'
import assert from 'node:assert/strict'
import { availabilityEvent, weeklyAvailabilityEvents } from '../lib/admin-calendar-availability.ts'
import { openingHours } from '../lib/data.ts'

const slot = {
  id: 'test-slot',
  date: '2026-11-13',
  start_time: '09:00:00',
  end_time: '18:00:00',
  is_available: true,
  is_all_day: false,
}

test('available hours are shown as an editable blue availability', () => {
  const event = availabilityEvent(slot)
  assert.equal(event.title, 'Available')
  assert.deepEqual(event.classNames, ['availability-event'])
  assert.equal(event.start, '2026-11-13T09:00:00')
  assert.equal(event.end, '2026-11-13T18:00:00')
  assert.equal(event.durationEditable, true)
  assert.equal(event.extendedProps.data, slot)
})

test('an unavailable day is shown as unavailable for the whole day', () => {
  const event = availabilityEvent({ ...slot, is_available: false })
  assert.equal(event.title, 'Unavailable')
  assert.deepEqual(event.classNames, ['unavailable-event'])
  assert.equal(event.start, '2026-11-13T00:00:00')
  assert.equal(event.end, '2026-11-14T00:00:00')
  assert.equal(event.durationEditable, false)
})

test('a closed day is displayed over its usual opening hours without changing the saved closure', () => {
  const closure = { ...slot, is_available: false }
  const event = availabilityEvent(closure, openingHours)
  assert.equal(event.start, '2026-11-13T09:30')
  assert.equal(event.end, '2026-11-13T19:00')
  assert.equal(event.extendedProps.data, closure)
  assert.equal(event.durationEditable, false)
})

test('a normally closed day remains visible as a full-day closure', () => {
  const event = availabilityEvent({ ...slot, date: '2026-11-15', is_available: false }, openingHours)
  assert.equal(event.start, '2026-11-15T00:00:00')
  assert.equal(event.end, '2026-11-16T00:00:00')
})

test('an all-day available exception is not shortened to weekly hours', () => {
  const event = availabilityEvent({ ...slot, is_all_day: true }, openingHours)
  assert.equal(event.start, '2026-11-13T00:00:00')
  assert.equal(event.end, '2026-11-14T00:00:00')
})

test('all-day availability remains visible and ends on the following day', () => {
  const event = availabilityEvent({ ...slot, date: '2026-12-31', is_all_day: true })
  assert.equal(event.title, 'Available')
  assert.equal(event.start, '2026-12-31T00:00:00')
  assert.equal(event.end, '2027-01-01T00:00:00')
  assert.equal(event.durationEditable, false)
})

test('weekly hours generate blue events only for future open days in the visible range', () => {
  const events = weeklyAvailabilityEvents(
    new Date(2026, 10, 8),
    new Date(2026, 10, 15),
    openingHours,
    [],
    new Date(2026, 10, 10, 15),
  )

  assert.deepEqual(events.map(event => event.extendedProps.data.date), [
    '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14',
  ])
  assert.equal(events[0].start, '2026-11-10T09:30')
  assert.equal(events[0].end, '2026-11-10T19:00')
  assert.equal(events[0].durationEditable, false)
  assert.equal(events[0].extendedProps.weekly, true)
  assert.deepEqual(events[0].classNames, ['availability-event'])
})

test('dated overrides replace weekly events, including when a closed day is opened', () => {
  const exceptions = [
    { ...slot, date: '2026-11-10', is_available: false },
    { ...slot, date: '2026-11-15', is_available: true },
  ]
  const events = weeklyAvailabilityEvents(
    new Date(2026, 10, 10),
    new Date(2026, 10, 16),
    openingHours,
    exceptions,
    new Date(2026, 10, 10),
  )

  assert.deepEqual(events.map(event => event.extendedProps.data.date), [
    '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14',
  ])
  assert.equal(availabilityEvent(exceptions[0]).title, 'Unavailable')
  assert.equal(availabilityEvent(exceptions[1]).title, 'Available')
})

test('week view uses background events so working hours do not cover appointments', () => {
  const events = weeklyAvailabilityEvents(
    new Date(2026, 10, 10),
    new Date(2026, 10, 12),
    openingHours,
    [],
    new Date(2026, 10, 10),
    'week',
  )

  assert.equal(events.length, 2)
  assert.equal(events[0].display, 'background')
  assert.deepEqual(events[0].classNames, ['weekly-availability-background'])
  assert.equal(events[0].start, '2026-11-10T09:30')
  assert.equal(events[0].end, '2026-11-10T19:00')
  assert.equal(events[0].durationEditable, false)
})
