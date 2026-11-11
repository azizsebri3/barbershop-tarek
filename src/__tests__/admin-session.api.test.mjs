import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SignJWT } from 'jose'

const baseUrl = process.env.TEST_BASE_URL
const secret = process.env.JWT_SECRET
if (!baseUrl || !secret || secret.length < 32) {
  throw new Error('Set TEST_BASE_URL and the test server JWT_SECRET before running this test')
}

const key = new TextEncoder().encode(secret)
const claims = { username: 'test-admin', email: 'admin@example.invalid', role: 'admin' }
const sign = (payload, expiration = '1h') => new SignJWT(payload)
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject('test-admin-id')
  .setIssuedAt()
  .setExpirationTime(expiration)
  .sign(key)

async function request(path, method = 'GET', token, body) {
  return fetch(`${baseUrl}${path}`, {
    method,
    redirect: 'manual',
    headers: {
      ...(token ? { Cookie: `admin_token=${token}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

const routes = [
  ['/api/availability', 'POST'],
  ['/api/availability', 'DELETE'],
  ['/api/availability/test-id', 'PUT'],
  ['/api/availability/test-id', 'DELETE'],
  ['/api/blocked-slots', 'GET'],
  ['/api/blocked-slots', 'POST'],
  ['/api/blocked-slots', 'DELETE'],
  ['/api/bookings/test-id', 'GET'],
  ['/api/bookings/test-id', 'PUT'],
  ['/api/bookings/test-id', 'DELETE'],
  ['/api/bookings', 'GET'],
  ['/api/admin/profile', 'GET'],
  ['/api/admin/change-password', 'POST'],
]

test('protected routes reject absent and forged sessions', async () => {
  const forged = Buffer.from(JSON.stringify({
    userId: 'test-admin-id', username: 'test', role: 'admin', exp: Date.now() + 3600000,
  })).toString('base64')
  for (const [path, method] of routes) {
    for (const token of [undefined, forged]) {
      const response = await request(path, method, token)
      assert.equal(response.status, 401, `${method} ${path}`)
    }
  }
})

test('session check accepts signed admin tokens and rejects invalid roles and expiration', async () => {
  for (const [token, expected] of [
    [await sign(claims), true],
    [await sign({ ...claims, role: 'customer' }), false],
    [await sign(claims, '1s ago'), false],
    ['not-a-token', false],
  ]) {
    const response = await request('/api/admin/check', 'GET', token)
    assert.equal(response.status, 200)
    assert.equal((await response.json()).authenticated, expected)
  }
})

test('valid session reaches protected validation without modifying data', async () => {
  const token = await sign(claims)
  const availability = await request('/api/availability', 'POST', token, {})
  assert.equal(availability.status, 400)
  assert.equal((await availability.json()).error, 'Date and time range are required')
  assert.equal((await request('/api/blocked-slots', 'POST', token, { slots: [] })).status, 400)
  assert.equal((await request('/api/bookings/availability')).status, 400)
  assert.equal((await request('/api/admin/auth', 'POST', undefined, {})).status, 410)

  const login = await request('/api/admin/login', 'POST', undefined, {})
  assert.equal(login.status, 400)
  assert.equal((await login.json()).error, 'Username and password are required')
})
