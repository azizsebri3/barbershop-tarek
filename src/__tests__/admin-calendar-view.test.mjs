import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calendarView, threeDayView } from '../lib/admin-calendar-view.ts'

test('week view shows three navigable days on mobile and a full week on desktop', () => {
  assert.equal(calendarView('timeGridWeek', true), 'timeGridThreeDays')
  assert.equal(calendarView('timeGridWeek', false), 'timeGridWeek')
  assert.equal(threeDayView.type, 'timeGrid')
  assert.deepEqual(threeDayView.duration, { days: 3 })
  assert.deepEqual(threeDayView.dateIncrement, { days: 3 })
  assert.equal(threeDayView.dateAlignment, 'day')
})

test('day, month and list views stay unchanged on either screen size', () => {
  for (const view of ['timeGridDay', 'dayGridMonth', 'listWeek']) {
    assert.equal(calendarView(view, true), view)
    assert.equal(calendarView(view, false), view)
  }
})
