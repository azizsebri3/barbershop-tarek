import { createHash } from 'node:crypto'
import { isValidDateKey } from './booking-calendar.ts'

export function createBookingCalendar(params: URLSearchParams, now = new Date()): string {
  const date = params.get('date') || ''
  const time = params.get('time') || ''
  const service = params.get('service') || ''
  const salon = params.get('salon') || ''
  const address = params.get('address') || ''
  const duration = params.get('duration')
  if (!isValidDateKey(date) || !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time) ||
      !service || service.length > 200 || !salon || salon.length > 200 || address.length > 500 ||
      (duration !== null && (!/^\d+$/.test(duration) || Number(duration) < 1 || Number(duration) > 1440))) {
    throw new Error('Invalid calendar details')
  }
  const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n')
    .replace(/,/g, '\\,').replace(/;/g, '\\;')
  const fold = (line: string) => {
    const lines: string[] = []
    let current = ''
    let size = 0
    for (const char of line) {
      const length = Buffer.byteLength(char)
      if (size + length > 75) {
        lines.push(current)
        current = ' '
        size = 1
      }
      current += char
      size += length
    }
    lines.push(current)
    return lines.join('\r\n')
  }
  const uid = createHash('sha256').update(`${date}|${time}|${service}|${salon}`).digest('hex')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tarek Salon//Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Brussels',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${uid}@tareksalon.be`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
    `DTSTART;TZID=Europe/Brussels:${date.replace(/-/g, '')}T${time.slice(0, 5).replace(':', '')}00`,
    ...(duration ? [`DURATION:PT${duration}M`] : []),
    `SUMMARY:${escape(`${salon} - ${service}`)}`,
    ...(address ? [`LOCATION:${escape(address)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
