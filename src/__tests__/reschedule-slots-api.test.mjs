import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { openingHours } from '../lib/data.ts'
import * as calendar from '../lib/booking-calendar.ts'
import * as availability from '../lib/reschedule-availability.ts'

const source = readFileSync(new URL('../app/api/bookings/availability/route.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText

function setup({ blocked = [], existing = [], failedTable = '' } = {}) {
  const supabase = { from(table) {
    const filter = {}
    const query = {
      select() { return this }, eq(key, value) { filter[key] = value; return this }, in() { return this },
      maybeSingle() {
        return Promise.resolve({
          data: table === 'bookings'
            ? { email: 'client@example.invalid', service: 'Cut', duration_minutes: 60, status: 'confirmed' }
            : { value: filter.key === 'opening_hours' ? openingHours : 4 },
          error: table === failedTable ? { message: 'unavailable' } : null,
        })
      },
      then(resolve, reject) {
        const data = table === 'bookings' ? existing : table === 'blocked_time_slots' ? blocked : []
        return Promise.resolve({ data, error: table === failedTable ? { message: 'unavailable' } : null }).then(resolve, reject)
      },
    }
    return query
  } }
  const deps = {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    '@supabase/supabase-js': { createClient: () => supabase },
    '@/lib/data': { openingHours },
    '@/lib/booking-calendar': calendar,
    '@/lib/reschedule-availability': availability,
    '@/lib/admin-session': { verifyAdminToken: async token => token === 'admin' },
    '@/lib/reschedule-token': { bearerToken: value => value?.replace('Bearer ', ''), verifyRescheduleToken: async (token, id) => token === 'signed' && id === 'id-1' },
  }
  const exports = {}
  runInNewContext(compiled, { exports, require: name => { if (!deps[name]) throw Error(name); return deps[name] },
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test' } },
    URL, console: { error() {} },
  })
  return (params, token, admin) => exports.GET({
    url: `https://example.invalid/api/bookings/availability?${params}`,
    headers: { get: () => token && `Bearer ${token}` },
    cookies: { get: () => admin && { value: admin } },
  })
}

test('rescheduling slots use real duration and exclude overlaps and same-client gap', async () => {
  const day = new Date(Date.now() + 7 * 86400000)
  if (day.getUTCDay() === 0) day.setUTCDate(day.getUTCDate() + 1)
  const date = day.toISOString().slice(0, 10)
  const request = setup({
    blocked: [{ start_time: '10:45', end_time: '11:00' }],
    existing: [{ id: 'b', time: '13:00', duration_minutes: 30, service: 'Cut', email: 'client@example.invalid', status: 'confirmed' }],
  })
  const response = await request(`date=${date}&duration=15&excludeBookingId=id-1`, 'signed')
  assert.equal(response.status, 200)
  assert.ok(!response.body.availableSlots.includes('10:00'))
  assert.ok(!response.body.availableSlots.includes('11:30'))
  assert.ok(response.body.availableSlots.includes('14:30'))
})

test('cannot exclude an appointment without authorization and fails closed on missing block table', async () => {
  const request = setup({ failedTable: 'blocked_time_slots' })
  assert.equal((await request('date=2026-11-13&excludeBookingId=id-1')).status, 401)
  assert.equal((await request('date=2026-11-13&excludeBookingId=id-1', undefined, 'admin')).status, 500)
})
