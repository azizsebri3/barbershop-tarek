import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BUCKET = 'salon-photos'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { path } = await request.json()
    if (!path) {
      return NextResponse.json({ error: 'Chemin du fichier requis' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path])
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('❌ Remove error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
