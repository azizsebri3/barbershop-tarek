import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { verifyAdminToken } from '@/lib/admin-session'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const file = (await request.formData()).get('file')
    if (!(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Choose a JPEG, PNG or WebP image up to 5 MB' }, { status: 400 })
    }
    let image: Buffer
    try {
      image = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40000000 }).rotate().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
    } catch (error) {
      console.error('Invalid product image:', error)
      return NextResponse.json({ error: 'The image could not be processed' }, { status: 400 })
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase environment variables')
    const path = `products/${crypto.randomUUID()}.webp`
    const { error } = await createClient(url, key).storage.from('product-photos').upload(path, image, { contentType: 'image/webp', upsert: false })
    if (error) throw error
    return NextResponse.json({ path }, { status: 201 })
  } catch (error) {
    console.error('Unable to upload product photo:', error)
    return NextResponse.json({ error: 'Unable to upload product photo' }, { status: 500 })
  }
}
