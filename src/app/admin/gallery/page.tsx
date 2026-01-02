'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import AdminNav from '@/components/admin/AdminNav'

interface Photo {
  id: string
  name: string
  path?: string
  url: string
  createdAt: string
  size: number
}

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      setPhotos(data.photos || [])
    } catch (error) {
      console.error('❌ Erreur chargement photos:', error)
      toast.error('Erreur de chargement des photos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)

    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/gallery/upload', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (!response.ok) {
          toast.error(data.error || 'Erreur upload')
          continue
        }

        toast.success(`Photo ${file.name} uploadée !`)
      } catch (error) {
        console.error('Erreur upload:', error)
        toast.error(`Erreur upload de ${file.name}`)
      }
    }

    setUploading(false)
    fetchPhotos()
  }, [fetchPhotos])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10 MB
    multiple: true
  })

  const deletePhoto = async (fileName: string, path?: string) => {
    if (!confirm('Supprimer cette photo ?')) return

    try {
      const response = await fetch('/api/gallery/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: path || fileName })
      })

      if (response.ok) {
        toast.success('Photo supprimée')
        fetchPhotos()
      } else {
        toast.error('Erreur de suppression')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur de suppression')
    }
  }

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNav />
      <div className="min-h-screen bg-primary py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            📸 <span className="text-accent">Galerie</span> Photos
          </h1>
          <p className="text-gray-400">Gérez les photos de votre salon</p>
        </motion.div>

        {/* Zone d'upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-accent bg-accent/10'
                : 'border-gray-600 hover:border-accent/50 bg-secondary'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto text-accent mb-4" size={48} />
            {uploading ? (
              <p className="text-white font-semibold">Upload en cours...</p>
            ) : isDragActive ? (
              <p className="text-white font-semibold">Déposez les photos ici...</p>
            ) : (
              <>
                <p className="text-white font-semibold mb-2">
                  Glissez-déposez des photos ici
                </p>
                <p className="text-gray-400 text-sm">
                  ou cliquez pour sélectionner (JPG, PNG, WEBP - Max 10 MB)
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Liste des photos */}
        {photos.length === 0 ? (
          <div className="text-center py-12 bg-secondary rounded-xl">
            <ImageIcon className="mx-auto text-gray-600 mb-4" size={64} />
            <p className="text-gray-400">Aucune photo pour le moment</p>
            <p className="text-gray-500 text-sm mt-2">
              Uploadez vos premières photos ci-dessus
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group aspect-square bg-secondary rounded-lg overflow-hidden"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => deletePhoto(photo.name, photo.path)}
                    className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs truncate">{photo.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          {photos.length} photo{photos.length !== 1 ? 's' : ''} dans la galerie
        </motion.div>
      </div>
    </div>
    </>
  )
}
