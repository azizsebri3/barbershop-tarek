import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, username, password } = await request.json()

    if (!token || !username || !password) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier que le username n'existe pas déjà
    const { data: existingUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur est déjà pris' },
        { status: 409 }
      )
    }

    // Récupérer l'invitation
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'invited')
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'Invitation invalide' },
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

    // Hasher le mot de passe
    const password_hash = await bcrypt.hash(password, 10)

    // Mettre à jour l'utilisateur
    const { error: updateError } = await supabaseAdmin
      .from('admin_users')
      .update({
        username: username.toLowerCase(),
        password_hash,
        status: 'active',
        invitation_token: null,
        invitation_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'activation du compte' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Compte activé avec succès'
    })

  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
