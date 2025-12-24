'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'

interface Photo {
  id: string
  name: string
  url: string
  createdAt: string
}

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      console.log('📸 Données reçues de l\'API:', data)
      console.log('📸 Nombre de photos:', data.photos?.length || 0)
      setPhotos(data.photos || [])
    } catch (error) {
      console.error('❌ Erreur chargement photos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  console.log('🖼️ Gallery render - photos:', photos.length)

  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Aucune photo pour le moment</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg bg-secondary"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.url}
              alt="Photo salon"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                console.error('❌ Erreur chargement image:', photo.url)
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23333" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em"%3EImage non disponible%3C/text%3E%3C/svg%3E'
              }}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="text-white w-8 h-8" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-accent transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={32} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-5xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt="Photo salon"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
