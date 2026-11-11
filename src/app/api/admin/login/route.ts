import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { createAdminToken } from '@/lib/admin-session'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration is missing' },
        { status: 500 }
      )
    }

    // Récupérer l'utilisateur
    const { data: user, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('status', 'active')
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Incorrect username or password' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Incorrect username or password' },
        { status: 401 }
      )
    }

    // Note: last_login field can be added later if needed
    // await supabaseAdmin
    //   .from('admin_users')
    //   .update({ last_login: new Date().toISOString() })
    //   .eq('id', user.id)

    // Créer le token de session
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Incorrect username or password' }, { status: 401 })
    }

    const token = await createAdminToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    })

    // Créer la réponse avec cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24h
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
