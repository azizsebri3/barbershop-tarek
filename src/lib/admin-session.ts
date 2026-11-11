import { jwtVerify, SignJWT, errors } from 'jose'

export interface AdminSession {
  userId: string
  username: string
  email: string
  role: 'admin' | 'super_admin'
}

function signingKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || new TextEncoder().encode(secret).length < 32 || secret === 'your_jwt_secret_key_here') {
    throw new Error('JWT_SECRET must be configured with at least 32 bytes')
  }
  return new TextEncoder().encode(secret)
}

export async function createAdminToken(session: AdminSession): Promise<string> {
  return new SignJWT({ username: session.username, email: session.email, role: session.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(signingKey())
}

export async function verifyAdminToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null
  const key = signingKey()
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'], requiredClaims: ['sub', 'exp', 'iat'] })
    if (
      typeof payload.sub !== 'string' || !payload.sub ||
      typeof payload.username !== 'string' || !payload.username ||
      typeof payload.email !== 'string' || !payload.email ||
      (payload.role !== 'admin' && payload.role !== 'super_admin')
    ) return null
    return { userId: payload.sub, username: payload.username, email: payload.email, role: payload.role }
  } catch (error) {
    if (error instanceof errors.JOSEError) return null
    throw error
  }
}
