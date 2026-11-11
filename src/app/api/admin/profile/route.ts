import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminToken } from '@/lib/admin-session'

export async function GET(request: NextRequest) {
  try {
    const sessionData = await verifyAdminToken(request.cookies.get('admin_token')?.value)
    if (!sessionData) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
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
