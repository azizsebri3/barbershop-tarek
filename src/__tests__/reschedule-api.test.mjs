import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { validateRescheduleTime, durationForBooking } from '../lib/reschedule-availability.ts'
import { openingHours } from '../lib/data.ts'

const source = readFileSync(new URL('../app/api/bookings/[id]/reschedule/route.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const futureDate = new Date(Date.now() + 7 * 86400000)
if (futureDate.getUTCDay() === 0) futureDate.setUTCDate(futureDate.getUTCDate() + 1)
const future = futureDate.toISOString().slice(0, 10)

function setup({ blocked = [], existing = [], failedTable = '', bookingStatus = 'confirmed', updateMatch = true, emailSuccess = true, visitOutcome = null } = {}) {
  const writes = []
  const emails = []
  const pushes = []
  const booking = {
    id: 'id-1', name: 'Client', email: 'client@example.invalid', phone: '123',
    date: '2026-01-01', time: '10:00:00', service: 'Coupe Homme', duration_minutes: 60, status: bookingStatus, visit_outcome: visitOutcome,
  }
  const supabase = { from(table) {
    const filters = {}
    let update = false
    const query = {
      select() { return this }, eq(k, v) { filters[k] = v; return this },
      neq() { return this }, in() { return this },
      update(data) { writes.push(data); update = true; return this },
      maybeSingle() {
        if (table === 'settings') return Promise.resolve({ data: { value: filters.key === 'opening_hours' ? openingHours : 4 }, error: null })
        if (table === 'bookings') return Promise.resolve(update ? { data: updateMatch ? { id: 'id-1' } : null, error: null } : { data: booking, error: null })
      },
      then(resolve, reject) {
        const data = table === 'blocked_time_slots' ? blocked : table === 'bookings' ? existing : []
        return Promise.resolve({ data, error: table === failedTable ? { message: 'database unavailable' } : null }).then(resolve, reject)
      },
    }
    return query
  } }
  const deps = {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    '@supabase/supabase-js': { createClient: () => supabase },
    '@/lib/email-service': { sendBookingRescheduledEmail: async (...args) => { emails.push(args); return { success: emailSuccess, error: emailSuccess ? undefined : 'email failed' } } },
    '@/lib/admin-booking-push': { sendAdminBookingPush: async (_db, details) => { pushes.push(details) } },
    '@/lib/booking-calendar': { DEFAULT_BOOKING_HORIZON_MONTHS: 4, normalizeBookingHorizonMonths: value => value },
    '@/lib/reschedule-token': { bearerToken: value => value?.replace('Bearer ', ''), verifyRescheduleToken: async (token, id) => token === 'signed' && id === 'id-1' },
    '@/lib/reschedule-availability': { durationForBooking, validateRescheduleTime },
  }
  const exports = {}
  runInNewContext(compiled, { exports, require: name => { if (!deps[name]) throw Error(name); return deps[name] },
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test' } },
    console: { error() {} },
  })
  const request = (token, body = {}) => ({ headers: { get: () => token && `Bearer ${token}` }, json: async () => body })
  return {
    get: token => exports.GET(request(token), { params: Promise.resolve({ id: 'id-1' }) }),
    put: (token, changes = {}) => exports.PUT(request(token, { newDate: future, newTime: '10:00', lang: 'fr', ...changes }), { params: Promise.resolve({ id: 'id-1' }) }),
    writes, emails, pushes,
  }
}

test('requires a valid signed token before reading or changing appointment data', async () => {
  const state = setup()
  assert.equal((await state.get(null)).status, 401)
  assert.equal((await state.put(null)).status, 401)
  assert.equal(state.writes.length, 0)
  assert.equal(state.pushes.length, 0)
  const response = await state.get('signed')
  assert.equal(response.status, 200)
  assert.equal(response.body.booking.email, undefined)
  assert.equal(response.body.booking.duration_minutes, 60)
})

test('rejects blocked time, overlapping appointments, errors and stale updates without sending email', async () => {
  for (const options of [
    { blocked: [{ start_time: '10:45', end_time: '11:30' }] },
    { existing: [{ time: '10:45', duration_minutes: 30, service: 'Cut', email: 'other', status: 'pending' }] },
    { failedTable: 'blocked_time_slots' }, { bookingStatus: 'cancelled' },
  ]) {
    const state = setup(options)
    const response = await state.put('signed')
    assert.ok(response.status >= 400)
    assert.equal(state.writes.length, 0)
    assert.equal(state.emails.length, 0)
    assert.equal(state.pushes.length, 0)
  }
  const stale = setup({ updateMatch: false })
  assert.equal((await stale.put('signed')).status, 409)
  assert.equal(stale.emails.length, 0)
  assert.equal(stale.pushes.length, 0)
})

test('saves a valid change and reports email failure separately from the successful update', async () => {
  const state = setup({ emailSuccess: false })
  const response = await state.put('signed', { newDate: future, newTime: '10:00' })
  assert.equal(response.status, 200)
  assert.equal(response.body.emailSent, false)
  assert.equal(state.writes.length, 1)
  assert.equal(state.emails.length, 1)
  assert.equal(state.emails[0][0].duration_minutes, 60)
  assert.equal(state.pushes.length, 1)
  assert.equal(state.pushes[0].kind, 'rescheduled')
  assert.equal(state.pushes[0].oldDate, '2026-01-01')
  assert.equal(state.pushes[0].oldTime, '10:00:00')
  assert.equal(state.pushes[0].date, future)
  assert.equal(state.pushes[0].time, '10:00')
})

test('rescheduling clears a previously recorded visit outcome', async () => {
  const state = setup({ visitOutcome: 'no_show' })
  assert.equal((await state.put('signed')).status, 200)
  assert.equal(state.writes[0].visit_outcome, null)
})
