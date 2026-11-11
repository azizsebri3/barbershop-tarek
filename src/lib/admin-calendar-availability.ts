import { addDays, format, parseISO, startOfDay } from 'date-fns'
import type { OpeningHours } from './data'

export interface AvailabilitySlot {
  id?: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  is_all_day: boolean
}

export function availabilityEvent(slot: AvailabilitySlot, hours?: OpeningHours) {
  const spansWholeDay = slot.is_all_day || !slot.is_available
  const nextDate = spansWholeDay ? format(addDays(parseISO(slot.date), 1), 'yyyy-MM-dd') : ''
  const weekdays: Array<keyof OpeningHours> = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
  ]
  const dayHours = hours?.[weekdays[parseISO(slot.date).getDay()]]
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
  const showDuringOpeningHours = !slot.is_available && dayHours && !dayHours.closed &&
    timePattern.test(dayHours.open) && timePattern.test(dayHours.close) &&
    dayHours.open < dayHours.close

  return {
    id: `availability-${slot.id || slot.date}`,
    title: slot.is_available ? 'Available' : 'Unavailable',
    start: showDuringOpeningHours
      ? `${slot.date}T${dayHours.open}`
      : spansWholeDay ? `${slot.date}T00:00:00` : `${slot.date}T${slot.start_time}`,
    end: showDuringOpeningHours
      ? `${slot.date}T${dayHours.close}`
      : spansWholeDay ? `${nextDate}T00:00:00` : `${slot.date}T${slot.end_time}`,
    editable: false,
    durationEditable: slot.is_available && !slot.is_all_day,
    startEditable: false,
    resourceEditable: false,
    classNames: [slot.is_available ? 'availability-event' : 'unavailable-event'],
    extendedProps: { type: 'availability', calendarOrder: 1, data: slot },
  }
}

export function weeklyAvailabilityEvents(
  start: Date,
  end: Date,
  hours: OpeningHours,
  exceptions: AvailabilitySlot[],
  today = new Date(),
  presentation: 'month' | 'week' = 'month',
) {
  const exceptionDates = new Set(exceptions.map(slot => slot.date))
  const weekdays: Array<keyof OpeningHours> = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
  ]
  const events = []
  for (let date = startOfDay(start); date < end; date = addDays(date, 1)) {
    if (date < startOfDay(today)) continue
    const dateKey = format(date, 'yyyy-MM-dd')
    if (exceptionDates.has(dateKey)) continue

    const weekday = weekdays[date.getDay()]
    if (hours[weekday].closed) continue
    const { open, close } = hours[weekday]
    const slot: AvailabilitySlot = {
      date: dateKey,
      start_time: open,
      end_time: close,
      is_available: true,
      is_all_day: false,
    }

    events.push({
      ...availabilityEvent(slot),
      id: `weekly-availability-${dateKey}`,
      durationEditable: false,
      ...(presentation === 'week' ? {
        display: 'background' as const,
        classNames: ['weekly-availability-background'],
      } : {}),
      extendedProps: { type: 'availability', calendarOrder: 1, data: slot, weekly: true },
    })
  }
  return events
}
