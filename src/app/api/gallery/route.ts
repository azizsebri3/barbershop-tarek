import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// GET /api/gallery - Liste toutes les photos
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .storage
      .from('salon-photos')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('❌ Erreur Supabase Storage:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Générer les URLs publiques
    const photos = data.map((file) => {
      const { data: publicUrlData } = supabase
        .storage
        .from('salon-photos')
        .getPublicUrl(file.name)

      return {
        id: file.id,
        name: file.name,
        path: file.name,
        url: publicUrlData.publicUrl,
        createdAt: file.created_at,
        size: file.metadata?.size || 0
      }
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('❌ Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/gallery - Upload une photo
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou WEBP.' },
        { status: 400 }
      )
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Maximum 10 MB.' },
        { status: 400 }
      )
    }

    // Générer un nom unique
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `photo-${timestamp}.${extension}`

    // Convertir en buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload vers Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('salon-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Erreur upload:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Récupérer l'URL publique
    const { data: publicUrlData } = supabase
      .storage
      .from('salon-photos')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      photo: {
        name: fileName,
        url: publicUrlData.publicUrl,
        path: data.path
      }
    })
  } catch (error) {
    console.error('❌ Erreur upload:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/gallery - Supprimer une photo
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('file')

    if (!fileName) {
      return NextResponse.json({ error: 'Nom de fichier manquant' }, { status: 400 })
    }

    const { error } = await supabase
      .storage
      .from('salon-photos')
      .remove([fileName])

    if (error) {
      console.error('❌ Erreur suppression:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur suppression:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
