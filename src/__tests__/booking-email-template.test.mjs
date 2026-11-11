import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderBookingEmail } from '../lib/booking-email-template.ts'
import { createBookingCalendar } from '../lib/booking-ics.ts'

const booking = {
  id: 'id-1', name: 'Jean & Co', email: 'client+test@example.invalid', phone: '123',
  date: '2026-11-13', time: '10:30:00', service: 'Coupe & barbe', duration_minutes: 60,
}
const args = { booking, salonName: 'Tarek Salon', address: 'Rue Rogier 7A, 5000 Namur', siteUrl: 'https://salon.example', rescheduleToken: 'signed-token' }

test('confirmation and pending requests have distinct accurate wording in each language', () => {
  for (const [lang, pending, confirmed] of [
    ['fr', 'doit encore la confirmer', 'rendez-vous est confirmé'],
    ['en', 'still needs to confirm', 'appointment is confirmed'],
    ['nl', 'moet deze nog bevestigen', 'afspraak is bevestigd'],
  ]) {
    const request = renderBookingEmail({ ...args, kind: 'received', lang })
    const confirmation = renderBookingEmail({ ...args, kind: 'confirmed', lang })
    assert.ok(request.html.includes(pending))
    assert.ok(confirmation.html.includes(confirmed))
    assert.ok(confirmation.html.includes('2026-11-13'))
    assert.ok(confirmation.html.includes('10:30'))
    assert.ok(confirmation.html.includes('Coupe &amp; barbe'))
    assert.ok(confirmation.html.includes('Rue Rogier'))
    assert.ok(confirmation.html.includes(`/${lang}/booking/reschedule/id-1#signed-token`))
    assert.ok(confirmation.html.includes(`/${lang}/booking/cancel/id-1?email=client%2Btest%40example.invalid`))
    assert.ok(confirmation.html.includes('/api/booking-calendar?'))
  }
})

test('modified appointment emphasizes new details and retains prior changes', () => {
  const updated = { ...booking, date: '2026-11-14', time: '15:15', service: 'Barbe', phone: '456' }
  const { html } = renderBookingEmail({ ...args, booking: updated, oldBooking: booking, kind: 'adminModified', lang: 'fr' })
  assert.ok(html.includes('2026-11-14'))
  assert.ok(html.includes('15:15'))
  assert.ok(html.includes('2026-11-13'))
  assert.ok(html.includes('Coupe &amp; barbe'))
  assert.ok(html.includes('456'))
  assert.ok(html.includes('/api/booking-calendar?'))
})

test('calendar link in confirmation produces a calendar file for the same appointment', () => {
  const { html } = renderBookingEmail({ ...args, kind: 'confirmed', lang: 'fr' })
  const link = html.match(/href="([^"]*\/api\/booking-calendar\?[^"]*)"/)
  assert.ok(link)
  const url = new URL(link[1].replaceAll('&amp;', '&'))
  const ics = createBookingCalendar(url.searchParams)
  assert.ok(ics.includes('DTSTART;TZID=Europe/Brussels:20261113T103000\r\n'))
  assert.ok(ics.includes('DURATION:PT60M\r\n'))
  assert.ok(ics.includes('LOCATION:Rue Rogier 7A\\, 5000 Namur\r\n'))
  assert.ok(ics.includes('SUMMARY:Tarek Salon - Coupe & barbe\r\n'))
})

test('rescheduling shows the new time and preserves the previous date and time', () => {
  const { html } = renderBookingEmail({
    ...args,
    booking: { ...booking, date: '2026-11-14', time: '14:45', oldDate: booking.date, oldTime: booking.time },
    kind: 'rescheduled', lang: 'fr',
  })
  assert.ok(html.includes('Votre rendez-vous a été déplacé'))
  assert.ok(html.includes('2026-11-14'))
  assert.ok(html.includes('14:45'))
  assert.ok(html.includes('2026-11-13 · 10:30'))
})

test('both cancellation types link to localized booking without calendar actions', () => {
  for (const kind of ['clientCancelled', 'salonCancelled']) {
    const { html } = renderBookingEmail({ ...args, kind, lang: 'nl', booking: { ...booking, cancelNote: '<b>test</b>' } })
    assert.ok(html.includes('/nl/booking'))
    assert.ok(html.includes('&lt;b&gt;test&lt;/b&gt;'))
    assert.ok(!html.includes('/api/booking-calendar?'))
    assert.ok(!html.includes('/booking/cancel/'))
  }
})

test('calendar download contains Brussels time, real duration and escaped details', () => {
  const params = new URLSearchParams({ date: booking.date, time: booking.time, service: 'Coupe,\nINJECT:1', salon: 'Salon', address: 'Rue; 7', duration: '60' })
  const ics = createBookingCalendar(params, new Date('2026-10-01T10:00:00Z'))
  assert.ok(ics.includes('DTSTART;TZID=Europe/Brussels:20261113T103000\r\n'))
  assert.ok(ics.includes('DURATION:PT60M\r\n'))
  assert.ok(ics.includes('SUMMARY:Salon - Coupe\\,\\nINJECT:1\r\n'))
  assert.ok(ics.includes('LOCATION:Rue\\; 7\r\n'))
  assert.ok(ics.includes('DTSTAMP:20261001T100000Z\r\n'))
})

test('calendar download omits unknown duration and rejects invalid input', () => {
  const params = new URLSearchParams({ date: booking.date, time: '10:30', service: 'Cut', salon: 'Salon' })
  assert.ok(!createBookingCalendar(params).includes('DURATION:'))
  params.set('date', '2026-02-30')
  assert.throws(() => createBookingCalendar(params), /Invalid calendar details/)
  params.set('date', booking.date)
  params.set('duration', '-30')
  assert.throws(() => createBookingCalendar(params), /Invalid calendar details/)
})

test('calendar content folds long UTF-8 lines without exceeding 75 bytes', () => {
  const params = new URLSearchParams({ date: booking.date, time: '10:30', service: 'É'.repeat(100), salon: 'Salon' })
  const lines = createBookingCalendar(params).split('\r\n')
  assert.ok(lines.every(line => Buffer.byteLength(line) <= 75))
  assert.ok(lines.some(line => line.startsWith(' ')))
})
