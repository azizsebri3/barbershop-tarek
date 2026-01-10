import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Décoder le token
    const sessionData = JSON.parse(Buffer.from(token, 'base64').toString())

    // Vérifier l'expiration
    if (sessionData.exp < Date.now()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }

    // Récupérer les données fraîches depuis la base de données
    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, username, email, role, created_at')
      .eq('id', sessionData.userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      profile: {
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
