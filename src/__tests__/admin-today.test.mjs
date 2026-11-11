import { test } from 'node:test'
import assert from 'node:assert/strict'
import { appointmentStarted, brusselsDateTime, freeSlotRanges } from '../lib/admin-today.ts'

test('uses Brussels time across summer and winter offsets', () => {
  assert.deepEqual(brusselsDateTime(new Date('2026-01-02T23:30:00Z')), { date: '2026-01-03', time: '00:30' })
  assert.deepEqual(brusselsDateTime(new Date('2026-07-02T23:30:00Z')), { date: '2026-07-03', time: '01:30' })
  assert.equal(appointmentStarted('2026-07-03', '01:30:00', new Date('2026-07-02T23:30:00Z')), true)
  assert.equal(appointmentStarted('2026-07-03', '01:45', new Date('2026-07-02T23:30:00Z')), false)
})

test('groups contiguous free 15-minute slots without bridging gaps', () => {
  assert.deepEqual(freeSlotRanges(['10:15', '09:00', '09:15', '10:00', '09:15']), [
    { start: '09:00', end: '09:30' }, { start: '10:00', end: '10:30' },
  ])
  assert.deepEqual(freeSlotRanges([]), [])
  assert.deepEqual(freeSlotRanges(['23:45']), [{ start: '23:45', end: '24:00' }])
})
