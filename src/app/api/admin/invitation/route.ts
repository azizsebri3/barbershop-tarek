import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      )
    }

    // Récupérer l'invitation
    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
      .select('email, invitation_expires_at')
      .eq('invitation_token', token)
      .eq('status', 'invited')
      .single()

    console.log('Invitation lookup:', { token, user, error })

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invitation invalide ou expirée' },
        { status: 404 }
      )
    }

    // Vérifier l'expiration
    if (user.invitation_expires_at) {
      const expiresAt = new Date(user.invitation_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Cette invitation a expiré' },
          { status: 410 }
        )
      }
    }

    return NextResponse.json({
      email: user.email
    })

  } catch (error) {
    console.error('Invitation check error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
