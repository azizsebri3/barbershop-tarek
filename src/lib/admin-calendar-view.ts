export function calendarView(view: string, isMobile: boolean): string {
  return view === 'timeGridWeek' && isMobile ? 'timeGridThreeDays' : view
}

export const threeDayView = {
  type: 'timeGrid',
  duration: { days: 3 },
  dateIncrement: { days: 3 },
  dateAlignment: 'day',
}
