import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../app/api/bookings/[id]/route.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

const booking = {
  id: 'booking-1',
  name: 'Customer',
  email: 'customer@example.invalid',
  phone: '123456789',
  date: '2026-11-12',
  time: '09:00',
  service: 'Coupe Homme',
  duration_minutes: 60,
}

function setup({ blocks = [], blockError = null, visitOutcome = null } = {}) {
  const writes = []
  const queries = []
  let emails = 0
  const supabase = {
    from(table) {
      const filters = []
      const query = {
        select() { return this },
        eq(field, value) { filters.push([field, value]); return this },
        neq() { return this },
        in() { return this },
        update(value) { writes.push(value); return this },
        single() { return Promise.resolve({ data: { ...booking, visit_outcome: visitOutcome }, error: null }) },
        then(resolve, reject) {
          queries.push({ table, filters })
          let result = { data: [], error: null }
          if (table === 'availability_slots') {
            result = { data: [{ start_time: '09:00', end_time: '18:00', is_available: true, is_all_day: false }], error: null }
          } else if (table === 'blocked_time_slots') {
            result = { data: blocks, error: blockError }
          }
          return Promise.resolve(result).then(resolve, reject)
        },
      }
      return query
    },
  }
  const modules = {
    'next/server': {
      NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) },
    },
    '@supabase/supabase-js': { createClient: () => supabase },
    '@/lib/admin-session': { verifyAdminToken: async () => ({}) },
    '@/lib/email-service': {
      sendAdminModifiedBookingEmail: async () => { emails += 1 },
      sendBookingConfirmedEmail: async () => { emails += 1 },
      sendBookingCancelledEmail: async () => { emails += 1; return { success: true } },
    },
  }
  const exports = {}
  runInNewContext(compiled, {
    exports,
    require: name => {
      if (!(name in modules)) throw new Error(`Unexpected dependency: ${name}`)
      return modules[name]
    },
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-key' } },
    console: { error() {} },
  })

  const update = (changes = {}) => exports.PUT({
    cookies: { get: () => ({ value: 'test-token' }) },
    json: async () => ({ ...booking, date: '2026-11-13', time: '10:00', notifyClient: true, ...changes }),
  }, { params: Promise.resolve({ id: booking.id }) })
  return { update, writes, queries, emailCount: () => emails }
}

test('rejects overlaps without changing the booking, block, or sending email', async () => {
  for (const [time, duration] of [['09:30', 60], ['10:15', 15], ['10:30', 60], ['09:30', 120]]) {
    const state = setup({ blocks: [{ start_time: '10:00', end_time: '11:00' }] })
    const result = await state.update({ time, duration_minutes: duration })
    assert.equal(result.status, 409)
    assert.equal(result.body.error, 'This appointment overlaps a blocked time slot. Please unblock it first.')
    assert.equal(state.writes.length, 0)
    assert.equal(state.emailCount(), 0)
    assert.deepEqual(state.queries.find(query => query.table === 'blocked_time_slots').filters, [['date', '2026-11-13']])
  }
})

test('allows appointments that end or start exactly at a block boundary', async () => {
  for (const [time, duration] of [['09:30', 30], ['11:00', 30]]) {
    const state = setup({ blocks: [{ start_time: '10:00', end_time: '11:00' }] })
    const result = await state.update({ time, duration_minutes: duration })
    assert.equal(result.status, 200)
    assert.equal(state.writes.length, 1)
  }
})

test('uses the existing appointment duration when no duration is supplied', async () => {
  const state = setup({ blocks: [{ start_time: '10:45', end_time: '11:00' }] })
  const result = await state.update({ duration_minutes: undefined })
  assert.equal(result.status, 409)
  assert.equal(state.writes.length, 0)
})

test('fails closed if blocked slots cannot be checked', async () => {
  const state = setup({ blockError: { code: 'PGRST205', message: 'table unavailable' } })
  const result = await state.update()
  assert.equal(result.status, 500)
  assert.equal(result.body.error, 'Unable to verify blocked time slots.')
  assert.equal(state.writes.length, 0)
  assert.equal(state.emailCount(), 0)
})

test('leaves status-only updates independent of blocked-slot validation', async () => {
  const state = setup({ blockError: { code: 'PGRST205' } })
  const result = await state.update({ name: undefined, status: 'pending', notifyClient: false })
  assert.equal(result.status, 200)
  assert.equal(state.writes.length, 1)
  assert.equal(state.queries.some(query => query.table === 'blocked_time_slots'), false)
})

test('moving an appointment or changing its confirmation clears its prior visit outcome', async () => {
  const moved = setup({ visitOutcome: 'completed' })
  assert.equal((await moved.update()).status, 200)
  assert.equal(moved.writes[0].visit_outcome, null)
  const cancelled = setup({ visitOutcome: 'no_show' })
  assert.equal((await cancelled.update({ name: undefined, status: 'cancelled' })).status, 200)
  assert.equal(cancelled.writes[0].visit_outcome, null)
})
