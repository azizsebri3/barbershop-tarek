import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// Vérifier si l'utilisateur est connecté et est super_admin
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  if (!token) return null

  try {
    const sessionData = JSON.parse(Buffer.from(token, 'base64').toString())
    if (sessionData.exp < Date.now()) return null
    return sessionData
  } catch {
    return null
  }
}

// GET: Liste tous les utilisateurs
export async function GET(request: NextRequest) {
  const session = await verifyAuth(request)
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
  }

  const { data: users, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, username, email, role, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch users error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users })
}

// POST: Inviter un nouvel utilisateur
export async function POST(request: NextRequest) {
  const session = await verifyAuth(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const { email, role } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    // Vérifier si l'email existe déjà
    const { data: existing } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Générer un token d'invitation
    const invitationToken = Buffer.from(
      `${email}:${Date.now()}:${Math.random()}`
    ).toString('base64')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 jours

    // Créer l'utilisateur en attente (sans username - il sera défini lors de l'activation)
    const tempPassword = Math.random().toString(36).slice(-12)
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    const { data: newUser, error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        username: `temp_${Date.now()}`, // Username temporaire
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: role || 'admin',
        status: 'invited',
        invited_by: session.userId,
        invitation_token: invitationToken,
        invitation_expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // TODO: Envoyer email d'invitation ici
    const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/accept-invitation?token=${invitationToken}`

    console.log('=== INVITATION ===')
    console.log('Email:', email)
    console.log('Lien:', invitationLink)
    console.log('==================')

    return NextResponse.json({
      success: true,
      message: 'Invitation envoyée',
      invitationLink, // Pour le dev, à retirer en prod
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      }
    })

  } catch (error) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE: Supprimer un utilisateur
export async function DELETE(request: NextRequest) {
  const session = await verifyAuth(request)
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    // Ne pas se supprimer soi-même
    if (userId === session.userId) {
      return NextResponse.json(
        { error: 'Impossible de se supprimer soi-même' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    const { error } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
