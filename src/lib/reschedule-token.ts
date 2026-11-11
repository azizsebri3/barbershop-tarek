import { SignJWT, jwtVerify, errors } from 'jose'

function signingKey(): Uint8Array {
  const secret = process.env.BOOKING_LINK_SECRET
  if (!secret || new TextEncoder().encode(secret).length < 32 || secret === 'your_booking_link_secret_here') {
    throw new Error('BOOKING_LINK_SECRET must be configured with at least 32 bytes')
  }
  return new TextEncoder().encode(secret)
}

export async function createRescheduleToken(bookingId: string): Promise<string> {
  return new SignJWT({ purpose: 'reschedule' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(bookingId)
    .setIssuedAt()
    .setExpirationTime('1y')
    .sign(signingKey())
}

export async function verifyRescheduleToken(token: string | undefined, bookingId: string): Promise<boolean> {
  if (!token) return false
  const key = signingKey()
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'], requiredClaims: ['sub', 'iat', 'exp'],
    })
    return payload.sub === bookingId && payload.purpose === 'reschedule'
  } catch (error) {
    if (error instanceof errors.JOSEError) return false
    throw error
  }
}

export function bearerToken(header: string | null): string | undefined {
  return header?.match(/^Bearer ([^\s]+)$/)?.[1]
}
