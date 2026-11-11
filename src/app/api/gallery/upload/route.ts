import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { randomUUID } from 'crypto'

const BUCKET = 'salon-photos'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed (JPEG, PNG, WEBP)' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File is too large (maximum 10MB)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `photo-${randomUUID()}.${ext}`

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 })
    }

    const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      photo: {
        name: fileName,
        path: data.path,
        url: pub.publicUrl,
      },
    })
  } catch (e: any) {
    console.error('❌ Upload error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
