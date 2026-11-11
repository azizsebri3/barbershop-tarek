export function brusselsDateTime(now: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` }
}

export function appointmentStarted(date: string, time: string, now: Date): boolean {
  const current = brusselsDateTime(now)
  return date < current.date || (date === current.date && time.slice(0, 5) <= current.time)
}

export function freeSlotRanges(slots: string[]): Array<{ start: string; end: string }> {
  const values = Array.from(new Set(slots)).sort().map(time => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  })
  const ranges: Array<{ start: number; end: number }> = []
  for (const start of values) {
    const last = ranges[ranges.length - 1]
    if (last && last.end === start) last.end += 15
    else ranges.push({ start, end: start + 15 })
  }
  const label = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  return ranges.map(range => ({ start: label(range.start), end: label(range.end) }))
}
