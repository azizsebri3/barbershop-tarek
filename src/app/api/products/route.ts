import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/admin-session'
import { validateProduct } from '@/lib/products'

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const noCache = { 'Cache-Control': 'no-store, max-age=0' }

export async function GET(request: NextRequest) {
  try {
    const admin = request.nextUrl.searchParams.get('admin') === 'true'
    if (admin && !await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    let query = client().from('products').select('*').order('created_at', { ascending: false })
    if (!admin) query = query.eq('active', true).or('stock.gt.0,show_when_out_of_stock.eq.true')
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ products: data }, { headers: noCache })
  } catch (error) {
    console.error('Unable to load products:', error)
    return NextResponse.json({ error: 'Unable to load products' }, { status: 500, headers: noCache })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const input = validateProduct(await request.json())
    if (!input) return NextResponse.json({ error: 'Invalid product details' }, { status: 400 })
    const { data, error } = await client().from('products').insert(input).select().single()
    if (error) throw error
    return NextResponse.json({ product: data }, { status: 201 })
  } catch (error) {
    console.error('Unable to create product:', error)
    return NextResponse.json({ error: 'Unable to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const input = validateProduct(body)
    if (!input || typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id)) return NextResponse.json({ error: 'Invalid product details' }, { status: 400 })
    const { data, error } = await client().from('products').update({ ...input, updated_at: new Date().toISOString() }).eq('id', body.id).select().maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Unable to update product:', error)
    return NextResponse.json({ error: 'Unable to update product' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
    try {
      if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const body: unknown = await request.json()
      if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid product details' }, { status: 400 })
      const record = body as Record<string, unknown>
      const keys = Object.keys(record)
      if (typeof record.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(record.id) || keys.some(key => !['id', 'stock', 'price_cents', 'active'].includes(key)) || keys.length < 2) {
        return NextResponse.json({ error: 'Invalid product details' }, { status: 400 })
      }

      const update: { stock?: number; price_cents?: number; active?: boolean; updated_at: string } = { updated_at: new Date().toISOString() }
      if ('stock' in record) {
        if (typeof record.stock !== 'number' || !Number.isSafeInteger(record.stock) || record.stock < 0 || record.stock > 100000) return NextResponse.json({ error: 'Invalid stock' }, { status: 400 })
        update.stock = record.stock
      }
      if ('price_cents' in record) {
        if (typeof record.price_cents !== 'number' || !Number.isSafeInteger(record.price_cents) || record.price_cents < 0 || record.price_cents > 10000000) return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
        update.price_cents = record.price_cents
      }
      if ('active' in record) {
        if (typeof record.active !== 'boolean') return NextResponse.json({ error: 'Invalid visibility' }, { status: 400 })
        update.active = record.active
      }
      const { data, error } = await client().from('products').update(update).eq('id', record.id).select().maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      return NextResponse.json({ product: data })
    } catch (error) {
      console.error('Unable to update product:', error)
      return NextResponse.json({ error: 'Unable to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!await verifyAdminToken(request.cookies.get('admin_token')?.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const { data, error } = await client().from('products').delete().eq('id', id).select('id').maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unable to delete product:', error)
    return NextResponse.json({ error: 'Unable to delete product' }, { status: 500 })
  }
}
