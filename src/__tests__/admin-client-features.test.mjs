import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { appointmentStarted } from '../lib/admin-today.ts'

function setup(feature, options = {}) {
  const source = readFileSync(new URL(`../app/api/admin/${feature}/route.ts`, import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const writes = []
  const filters = []
  const booking = options.booking || { id: 'one', status: 'confirmed', date: '2020-01-01', time: '10:00' }
  const db = { from(table) {
    let writing = false
    const query = {
      select() { return this },
      eq(key, value) { filters.push([key, value]); return this },
      update(data) { writes.push({ table, operation: 'update', data }); writing = true; return this },
      upsert(data) { writes.push({ table, operation: 'upsert', data }); return this },
      delete() { writes.push({ table, operation: 'delete' }); return this },
      maybeSingle: async () => ({ data: writing ? (options.stale ? null : { id: 'one' }) : table === 'bookings' ? booking : options.note ? { note: options.note } : null, error: options.error || null }),
      then(resolve, reject) { return Promise.resolve({ error: options.error || null }).then(resolve, reject) },
    }
    return query
  } }
  const modules = {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@supabase/supabase-js': { createClient: () => db },
    '@/lib/admin-session': { verifyAdminToken: async token => token ? {} : null },
    '@/lib/admin-today': { appointmentStarted },
  }
  const exports = {}
  runInNewContext(compiled, { exports, require: name => { if (!modules[name]) throw Error(name); return modules[name] },
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test' } }, console: { error() {} },
  })
  const request = (body, authorized = true) => ({
    cookies: { get: () => authorized ? { value: 'token' } : undefined }, json: async () => body,
    nextUrl: { searchParams: new URLSearchParams({ email: body.email || '' }) },
  })
  return { put: (body, auth) => exports.PUT(request(body, auth)), get: (body, auth) => exports.GET(request(body, auth)), writes, filters }
}

test('only admins can set or correct visit outcomes, without changing reservation status', async () => {
  for (const outcome of ['completed', 'no_show', null]) {
    const state = setup('visit-outcome')
    assert.equal((await state.put({ id: 'one', outcome }, false)).status, 401)
    assert.equal(state.writes.length, 0)
    assert.equal((await state.put({ id: 'one', outcome })).status, 200)
    assert.equal(state.writes[0].data.visit_outcome, outcome)
    assert.deepEqual(Object.keys(state.writes[0].data), ['visit_outcome'])
    assert.ok(state.filters.some(([key, value]) => key === 'status' && value === 'confirmed'))
  }
})

test('visit outcomes reject future, unconfirmed, invalid and stale appointments', async () => {
  for (const booking of [
    { id: 'one', status: 'confirmed', date: '2999-01-01', time: '10:00' },
    { id: 'one', status: 'cancelled', date: '2020-01-01', time: '10:00' },
    { id: 'one', status: 'pending', date: '2020-01-01', time: '10:00' },
  ]) {
    const state = setup('visit-outcome', { booking })
    assert.equal((await state.put({ id: 'one', outcome: 'completed' })).status, 409)
    assert.equal(state.writes.length, 0)
  }
  assert.equal((await setup('visit-outcome').put({ id: 'one', outcome: 'other' })).status, 400)
  assert.equal((await setup('visit-outcome', { stale: true }).put({ id: 'one', outcome: 'completed' })).status, 409)
})

test('private notes require admin and normalize email; empty notes are deleted', async () => {
  const state = setup('client-notes', { note: 'Existing' })
  assert.equal((await state.get({ email: 'client@example.invalid' }, false)).status, 401)
  assert.equal((await state.put({ email: 'client@example.invalid', note: 'abc' }, false)).status, 401)
  assert.equal(state.writes.length, 0)
  assert.equal((await state.get({ email: ' Client@Example.invalid ' })).body.note, 'Existing')
  assert.ok(state.filters.some(([key, value]) => key === 'email' && value === 'client@example.invalid'))
  assert.equal((await state.put({ email: ' Client@Example.invalid ', note: '  Cut short  ' })).status, 200)
  assert.equal(state.writes[0].data.email, 'client@example.invalid')
  assert.equal(state.writes[0].data.note, 'Cut short')
  assert.equal((await state.put({ email: 'client@example.invalid', note: '   ' })).status, 200)
  assert.equal(state.writes[1].operation, 'delete')
  assert.equal((await state.put({ email: 'client@example.invalid', note: 'x'.repeat(4001) })).status, 400)
})

test('private note database errors are reported', async () => {
  const state = setup('client-notes', { error: { message: 'unavailable' } })
  assert.equal((await state.get({ email: 'client@example.invalid' })).status, 500)
  assert.equal((await state.put({ email: 'client@example.invalid', note: 'x' })).status, 500)
})
