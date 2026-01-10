import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    // Trouver l'utilisateur avec ce token
    const { data: user, error: userError } = await supabaseAdmin
      .from('admin_users')
      .select('id, username, email, reset_token_expires_at')
      .eq('reset_token', token)
      .eq('status', 'active')
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Vérifier que le token n'est pas expiré
    const now = new Date()
    const expiresAt = new Date(user.reset_token_expires_at)

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    // Mettre à jour le mot de passe et supprimer le token
    const { error: updateError } = await supabaseAdmin
      .from('admin_users')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Error updating password' },
        { status: 500 }
      )
    }

    console.log('✅ Password reset successfully for user:', user.username)

    return NextResponse.json(
      { 
        success: true,
        message: 'Password reset successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
