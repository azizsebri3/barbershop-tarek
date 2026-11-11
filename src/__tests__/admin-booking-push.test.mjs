import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../lib/admin-booking-push.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText

function setup({ missingKeys = false, lookupError = false, failedEndpoint = '', statusCode = 410, deleteError = false } = {}) {
  const sent = []
  const deleted = []
  const errors = []
  const client = {
    from() {
      return {
        select: async () => ({ data: lookupError ? null : [{ endpoint: 'bad', subscription: { endpoint: 'bad' } }, { endpoint: 'good', subscription: { endpoint: 'good' } }], error: lookupError ? { message: 'unavailable' } : null }),
        delete() { return this },
        eq: async (_key, value) => { deleted.push(value); return { error: deleteError ? { message: 'delete failed' } : null } },
      }
    },
  }
  const webpush = {
    setVapidDetails() {},
    async sendNotification(subscription, payload) {
      if (subscription.endpoint === failedEndpoint) throw { statusCode }
      sent.push({ endpoint: subscription.endpoint, payload: JSON.parse(payload) })
    },
  }
  const modules = { 'node:crypto': { randomUUID: () => 'unique-id' }, 'web-push': webpush }
  const exports = {}
  runInNewContext(compiled, {
    exports, require: name => { if (!modules[name]) throw Error(name); return modules[name] },
    process: { env: missingKeys ? {} : { NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'test-public', VAPID_PRIVATE_KEY: 'test-private' } },
    console: { error: (...args) => errors.push(args) },
  })
  return { send: booking => exports.sendAdminBookingPush(client, booking), sent, deleted, errors }
}

const booking = { name: 'Client', service: 'Cut', date: '2026-11-15', time: '10:30:00' }

test('push contains cancellation or old and new appointment times, never the cancellation reason', async () => {
  const state = setup()
  await state.send({ ...booking, kind: 'created' })
  await state.send({ ...booking, kind: 'cancelled', cancelNote: 'Private reason' })
  await state.send({ ...booking, kind: 'rescheduled', oldDate: '2026-11-14', oldTime: '09:00:00' })
  assert.equal(state.sent.length, 6)
  const created = state.sent[0].payload
  assert.equal(created.title, '🔔 New booking')
  assert.match(created.body, /2026-11-15 at 10:30/)
  const cancellation = state.sent[2].payload
  assert.equal(cancellation.title, 'Appointment cancelled by client')
  assert.match(cancellation.body, /Client - Cut/)
  assert.match(cancellation.body, /2026-11-15 at 10:30/)
  assert.doesNotMatch(JSON.stringify(cancellation), /Private reason/)
  const moved = state.sent[4].payload
  assert.equal(moved.title, 'Appointment rescheduled by client')
  assert.match(moved.body, /Previous: 2026-11-14 at 09:00/)
  assert.match(moved.body, /Now: 2026-11-15 at 10:30/)
})

test('service worker fallback push and action labels are in English', async () => {
  const source = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8')
  const listeners = {}
  let notification
  runInNewContext(source, {
    self: {
      addEventListener: (name, callback) => { listeners[name] = callback },
      registration: {
        showNotification: async (title, options) => { notification = { title, ...options } },
      },
    },
    console: { log() {} },
  })

  const event = { waitUntil: promise => promise }
  await listeners.push(event)
  assert.equal(notification.title, 'New booking!')
  assert.equal(notification.body, 'A client has just booked an appointment.')
  assert.equal(notification.actions.map(action => action.title).join(', '), 'View, Dismiss')
})

test('failed deliveries do not prevent other devices; only expired subscriptions are removed', async () => {
  for (const [statusCode, expectedDeleted] of [[410, 1], [404, 1], [500, 0]]) {
    const state = setup({ failedEndpoint: 'bad', statusCode })
    await state.send({ ...booking, kind: 'created' })
    assert.equal(state.sent.length, 1)
    assert.equal(state.deleted.length, expectedDeleted)
    assert.equal(state.errors.length, 1)
  }
  const cleanup = setup({ failedEndpoint: 'bad', deleteError: true })
  await cleanup.send({ ...booking, kind: 'cancelled' })
  assert.equal(cleanup.sent.length, 1)
  assert.equal(cleanup.errors.length, 2)
})

test('missing keys and database errors are logged without throwing', async () => {
  for (const options of [{ missingKeys: true }, { lookupError: true }]) {
    const state = setup(options)
    await state.send({ ...booking, kind: 'cancelled' })
    assert.equal(state.sent.length, 0)
    assert.equal(state.errors.length, 1)
  }
})
