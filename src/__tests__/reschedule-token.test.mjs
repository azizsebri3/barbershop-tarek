import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SignJWT } from 'jose'
import { bearerToken, createRescheduleToken, verifyRescheduleToken } from '../lib/reschedule-token.ts'

test('rescheduling tokens are signed, scoped to a booking and reject tampering', async () => {
  process.env.BOOKING_LINK_SECRET = 'test-secret-123456789012345678901234567890'
  const token = await createRescheduleToken('booking-a')
  assert.equal(await verifyRescheduleToken(token, 'booking-a'), true)
  assert.equal(await verifyRescheduleToken(token, 'booking-b'), false)
  assert.equal(await verifyRescheduleToken(`${token}x`, 'booking-a'), false)
  assert.equal(await verifyRescheduleToken(undefined, 'booking-a'), false)
  assert.equal(bearerToken(`Bearer ${token}`), token)
  assert.equal(bearerToken('Bearer invalid value'), undefined)
  const expired = await new SignJWT({ purpose: 'reschedule' })
    .setProtectedHeader({ alg: 'HS256' }).setSubject('booking-a').setIssuedAt()
    .setExpirationTime('1 second ago').sign(new TextEncoder().encode(process.env.BOOKING_LINK_SECRET))
  assert.equal(await verifyRescheduleToken(expired, 'booking-a'), false)
})
