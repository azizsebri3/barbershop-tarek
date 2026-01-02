import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { randomUUID } from 'crypto'

const BUCKET = 'logos'
const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('logo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Type non autorisé (JPEG, PNG, WEBP, SVG)' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 2MB)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'png'
    const fileName = `logo-${randomUUID()}.${ext}`

    // Delete old logo if exists
    const { data: oldSettings } = await supabaseAdmin
      .from('settings')
      .select('logo_url, id')
      .limit(1)
      .single()

    if (oldSettings?.logo_url && oldSettings.logo_url.includes('supabase')) {
      const oldPath = oldSettings.logo_url.split('/').slice(-1)[0]
      if (oldPath) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldPath])
      }
    }

    // Upload new logo
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })

    if (error || !data) {
      console.error('❌ Upload error:', error)
      return NextResponse.json({ error: error?.message || 'Erreur upload' }, { status: 500 })
    }

    // Get public URL
    const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path)

    // Update settings table (use the actual ID from query)
    const { error: updateError } = await supabaseAdmin
      .from('settings')
      .update({ logo_url: pub.publicUrl })
      .eq('id', oldSettings?.id || '')
      .select()
      .single()

    if (updateError) {
      console.error('❌ Settings update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: pub.publicUrl,
      message: 'Logo uploadé avec succès sur Supabase Storage'
    })
  } catch (e: any) {
    console.error('❌ Server error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
