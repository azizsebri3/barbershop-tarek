import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../lib/email-service.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

function setup({ settingsError = null } = {}) {
  const messages = []
  const rendered = []
  const errors = []
  class Resend {
    emails = { send: async message => { messages.push(message); return { data: { id: 'mail-id' }, error: null } } }
  }
  const client = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { value: { address: 'Configured address' } }, error: settingsError }),
        }),
      }),
    }),
  }
  const dependencies = {
    resend: { Resend },
    '@supabase/supabase-js': { createClient: () => client },
    './reschedule-token': { createRescheduleToken: async id => `signed-${id}` },
    './booking-email-template': {
      renderBookingEmail: args => { rendered.push(args); return { subject: 'Subject', html: '<p>Body</p>' } },
      escapeHtml: value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    },
  }
  const exports = {}
  runInNewContext(compiled, {
    exports,
    require: name => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`)
      return dependencies[name]
    },
    process: { env: { RESEND_API_KEY: 'test', NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test' } },
    console: { log() {}, error: (...args) => errors.push(args) },
  })
  return { api: exports, messages, rendered, errors }
}

const booking = {
  id: 'booking-id', name: 'Client', email: 'client@example.invalid', phone: '123',
  date: '2026-11-13', time: '10:30', service: 'Cut', language: 'nl', duration_minutes: 45,
}

test('all client email paths select their template and preserve booking data', async () => {
  const { api, messages, rendered } = setup()
  await api.sendClientConfirmation({ ...booking, status: 'pending' })
  await api.sendClientConfirmation({ ...booking, status: 'confirmed' })
  await api.sendBookingConfirmedEmail(booking)
  await api.sendBookingRescheduledEmail(booking)
  await api.sendClientCancellationConfirmation(booking)
  await api.sendBookingCancelledEmail(booking)
  await api.sendAdminModifiedBookingEmail(booking, { ...booking, time: '11:00' })
  assert.deepEqual(rendered.map(item => item.kind), [
    'received', 'confirmed', 'confirmed', 'rescheduled', 'clientCancelled', 'salonCancelled', 'adminModified',
  ])
  assert.equal(messages.length, 7)
  assert.ok(rendered.every(item => item.lang === 'nl' && item.address === 'Configured address'))
  assert.equal(rendered[6].oldBooking, booking)
  assert.equal(rendered[6].booking.time, '11:00')
})

test('address lookup errors are logged without inventing an address', async () => {
  const { api, messages, rendered, errors } = setup({ settingsError: { message: 'database unavailable' } })
  const result = await api.sendBookingConfirmedEmail(booking)
  assert.equal(result.success, true)
  assert.equal(rendered[0].address, '')
  assert.equal(messages.length, 1)
  assert.equal(errors.length, 1)
})

test('admin cancellation notification escapes the reason', async () => {
  const { api, messages } = setup()
  const result = await api.sendAdminCancellationNotification({ ...booking, cancelNote: '<script>test</script>' }, 'en')
  assert.equal(result.success, true)
  assert.match(messages[0].html, /&lt;script&gt;test&lt;\/script&gt;/)
  assert.doesNotMatch(messages[0].html, /<script>/)
})
