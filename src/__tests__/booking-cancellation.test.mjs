import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const booking = {
  id: 'booking-1', name: 'Client', email: 'client@example.invalid', phone: '123',
  date: '2026-11-13', time: '10:00', service: 'Cut', status: 'confirmed',
}

function setup({ client = false, writeError = null, emailSuccess = true, emailThrows = false, stale = false } = {}) {
  const file = client ? '../app/api/bookings/[id]/cancel/route.ts' : '../app/api/bookings/[id]/route.ts'
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const writes = []
  const notifications = []
  const pushes = []
  const supabase = {
    from() {
      return {
        select() { return this },
        eq() { return this },
        single: async () => ({ data: booking, error: null }),
        update(value) {
          writes.push(value)
          const query = {
            eq() { return this },
            select() { return this },
            maybeSingle: async () => ({ data: stale ? null : { id: booking.id }, error: writeError }),
            then(resolve, reject) { return Promise.resolve({ error: writeError }).then(resolve, reject) },
          }
          return query
        },
      }
    },
  }
  const notify = kind => async details => {
    notifications.push({ kind, details })
    if (emailThrows) throw new Error('mail failed')
    return { success: emailSuccess }
  }
  const modules = {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@supabase/supabase-js': { createClient: () => supabase },
    '@/lib/admin-session': { verifyAdminToken: async token => Boolean(token) },
    '@/lib/admin-booking-push': { sendAdminBookingPush: async (_db, details) => { pushes.push(details) } },
    '@/lib/email-service': {
      sendBookingCancelledEmail: notify('client'),
      sendClientCancellationConfirmation: notify('client'),
      sendAdminCancellationNotification: notify('admin'),
    },
  }
  const exports = {}
  runInNewContext(compiled, {
    exports,
    require: name => {
      if (!(name in modules)) throw new Error(`Unexpected dependency: ${name}`)
      return modules[name]
    },
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test' } },
    console: { error() {}, log() {} },
  })
  const request = (body, authorized = true) => (client ? exports.POST : exports.PUT)({
    json: async () => body,
    cookies: { get: () => authorized ? { value: 'token' } : undefined },
  }, { params: Promise.resolve({ id: booking.id }) })
  return { request, writes, notifications, pushes }
}

for (const client of [false, true]) {
  const actor = client ? 'client' : 'admin'
  const body = reason => client
    ? { email: ' Client@example.invalid ', cancelNote: reason }
    : { status: 'cancelled', cancel_note: reason }

  test(`${actor} cancellation stores and sends a trimmed optional reason`, async () => {
    for (const [reason, expected] of [['  Not available  ', 'Not available'], ['', null], [undefined, null], ['  ', null]]) {
      const state = setup({ client })
      const response = await state.request(body(reason))
      assert.equal(response.status, 200)
      assert.equal(state.writes[0].status, 'cancelled')
      assert.equal(state.writes[0].cancelled_by, actor)
      assert.equal(state.writes[0].cancel_note, expected)
      assert.equal(state.notifications.length, client ? 2 : 1)
      assert.equal(state.pushes.length, client ? 1 : 0)
      if (client) {
        assert.equal(state.pushes[0].kind, 'cancelled')
        assert.equal(state.pushes[0].name, booking.name)
        assert.equal(state.pushes[0].date, booking.date)
        assert.equal(state.pushes[0].time, booking.time)
        assert.equal(state.pushes[0].cancelNote, undefined)
      }
      assert.ok(state.notifications.every(item => item.details.cancelNote === (expected || undefined)))
      assert.equal(response.body.clientNotified, true)
      if (client) assert.equal(response.body.adminNotified, true)
    }
  })

  test(`${actor} cancellation rejects invalid reasons and database errors`, async () => {
    const invalid = setup({ client })
    assert.equal((await invalid.request(body({ value: 'bad' }))).status, 400)
    assert.equal(invalid.writes.length, 0)
    assert.equal(invalid.notifications.length, 0)
    const failed = setup({ client, writeError: { message: 'write failed' } })
    assert.equal((await failed.request(body('Reason'))).status, 500)
    assert.equal(failed.notifications.length, 0)
    assert.equal(failed.pushes.length, 0)
  })

  test(`${actor} cancellation reports failed notifications without undoing cancellation`, async () => {
    for (const options of [{ emailSuccess: false }, { emailThrows: true }]) {
      const state = setup({ client, ...options })
      const response = await state.request(body('Reason'))
      assert.equal(response.status, 200)
      assert.equal(state.writes.length, 1)
      assert.equal(response.body.clientNotified, false)
      assert.equal(state.pushes.length, client ? 1 : 0)
      if (client) assert.equal(response.body.adminNotified, false)
    }
  })
}

test('a concurrent booking change prevents cancellation notifications', async () => {
  const state = setup({ client: true, stale: true })
  const response = await state.request({ email: booking.email, cancelNote: 'Test' })
  assert.equal(response.status, 409)
  assert.equal(state.pushes.length, 0)
  assert.equal(state.notifications.length, 0)
})

test('cancellation requires the correct client email or an admin session', async () => {
  const client = setup({ client: true })
  assert.equal((await client.request({ email: 'wrong@example.invalid' })).status, 403)
  assert.equal(client.writes.length, 0)
  assert.equal(client.pushes.length, 0)
  const admin = setup()
  assert.equal((await admin.request({ status: 'cancelled' }, false)).status, 401)
  assert.equal(admin.writes.length, 0)
})
