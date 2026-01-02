'use client'

import { useState, useEffect } from 'react'

interface Photo {
  id: string
  name: string
  url: string
  createdAt: string
}

let cachedPhotos: Photo[] | null = null
let pendingPromise: Promise<Photo[]> | null = null

async function fetchPhotos(): Promise<Photo[]> {
  const res = await fetch('/api/gallery')
  const data = await res.json()
  return data.photos || []
}

export function useGallery() {
  const [photos, setPhotos] = useState<Photo[]>(cachedPhotos || [])
  const [loading, setLoading] = useState<boolean>(!cachedPhotos)

  useEffect(() => {
    let mounted = true

    if (cachedPhotos) {
      setPhotos(cachedPhotos)
      setLoading(false)
      return
    }

    if (pendingPromise) {
      pendingPromise.then(p => {
        if (!mounted) return
        setPhotos(p)
        setLoading(false)
      }).catch(() => {
        if (!mounted) return
        setPhotos([])
        setLoading(false)
      })
      return
    }

    pendingPromise = fetchPhotos()
    pendingPromise.then(p => {
      cachedPhotos = p
      pendingPromise = null
      if (!mounted) return
      setPhotos(p)
      setLoading(false)
    }).catch(err => {
      console.error('❌ Erreur chargement photos (cached):', err)
      pendingPromise = null
      if (!mounted) return
      setPhotos([])
      setLoading(false)
    })

    return () => { mounted = false }
  }, [])

  const refetch = async () => {
    setLoading(true)
    try {
      const p = await fetchPhotos()
      cachedPhotos = p
      setPhotos(p)
    } catch (err) {
      console.error('❌ Erreur rechargement photos:', err)
    } finally {
      setLoading(false)
    }
  }

  return { photos, loading, refetch }
}
