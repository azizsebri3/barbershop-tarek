import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))

      // Vérifier si le token n'est pas expiré (24h)
      const loginTime = payload.loginTime as number
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000

      if (now - loginTime > twentyFourHours) {
        return NextResponse.json({ authenticated: false })
      }

      return NextResponse.json({
        authenticated: true,
        loginTime: payload.loginTime
      })
    } catch (error) {
      // Token invalide
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    console.error('Erreur vérification admin:', error)
    return NextResponse.json({ authenticated: false })
  }
}