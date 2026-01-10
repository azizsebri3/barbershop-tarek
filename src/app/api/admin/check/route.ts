import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    try {
      // Décoder le token base64
      const sessionData = JSON.parse(Buffer.from(token, 'base64').toString())

      // Vérifier l'expiration
      if (!sessionData.exp || sessionData.exp < Date.now()) {
        return NextResponse.json({ authenticated: false })
      }

      // Vérifier que les données nécessaires sont présentes
      if (!sessionData.userId || !sessionData.role) {
        return NextResponse.json({ authenticated: false })
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: sessionData.userId,
          username: sessionData.username,
          email: sessionData.email,
          role: sessionData.role
        }
      })
    } catch (error) {
      // Token invalide
      console.error('Token decode error:', error)
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    console.error('Erreur vérification admin:', error)
    return NextResponse.json({ authenticated: false })
  }
}