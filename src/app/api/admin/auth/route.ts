import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SecureAdminP@ss2025!'
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 })
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    // Créer un token JWT pour l'authentification
    const token = await new SignJWT({ role: 'admin', loginTime: Date.now() })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(JWT_SECRET))

    // Créer la réponse avec le token
    const response = NextResponse.json({
      success: true,
      message: 'Authentification réussie'
    })

    // Définir le token dans un cookie httpOnly
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 heures
    })

    return response
  } catch (error) {
    console.error('Erreur authentification admin:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })
    return response
  } catch (error) {
    console.error('Erreur déconnexion admin:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}