'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, RefreshCw, Upload, X, Image as ImageIcon } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'

interface SiteImages {
  hero: string
  logo: string
  portfolio: string[]
  testimonials: string[]
}

export default function AdminImages() {
  const [images, setImages] = useState<SiteImages>({
    hero: '/hero-bg.svg',
    logo: '/logo.svg',
    portfolio: ['/portfolio1.svg', '/portfolio2.svg', '/portfolio3.svg'],
    testimonials: []
  })
  const [isSaving, setIsSaving] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingGallery, setLoadingGallery] = useState(true)
  const [uploading, setUploading] = useState(false)

  interface Photo {
    id?: string
    name: string
    path?: string
    url: string
    createdAt?: string
    size?: number
  }

  const fetchPhotos = useCallback(async () => {
    setLoadingGallery(true)
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      setPhotos(data.photos || [])
    } catch (error) {
      console.error('❌ Erreur chargement photos:', error)
      toast.error('Erreur de chargement des photos')
    } finally {
      setLoadingGallery(false)
    }
  }, [])

  useEffect(() => {
    // Load images from localStorage
    const saved = localStorage.getItem('admin_images')
    if (saved) {
      setImages(JSON.parse(saved))
    }
    fetchPhotos()
  }, [fetchPhotos])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('admin_images', JSON.stringify(images))
      toast.success('Images sauvegardées avec succès !')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: keyof SiteImages) => {
    const file = event.target.files?.[0]
    if (!file) return

    // In a real app, you would upload to a cloud storage service
    // For now, we'll just create a local URL
    const url = URL.createObjectURL(file)

    if (type === 'portfolio' || type === 'testimonials') {
      setImages(prev => ({
        ...prev,
        [type]: [...(prev[type] as string[]), url]
      }))
    } else {
      setImages(prev => ({
        ...prev,
        [type]: url
      }))
    }

    toast.success('Image ajoutée ! N\'oubliez pas de sauvegarder.')
  }

  const removeImage = (type: keyof SiteImages, index?: number) => {
    if (type === 'portfolio' || type === 'testimonials') {
      setImages(prev => ({
        ...prev,
        [type]: (prev[type] as string[]).filter((_, i) => i !== index)
      }))
    } else {
      setImages(prev => ({
        ...prev,
        [type]: ''
      }))
    }
  }

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
    maxSize: 10 * 1024 * 1024,
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

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erreur de suppression')
        return
      }

      toast.success('Photo supprimée')
      fetchPhotos()
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur de suppression')
    }
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Gestion des Images</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 disabled:opacity-50 text-sm sm:text-base"
        >
          {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          Sauvegarder
        </motion.button>
      </div>

      <div className="space-y-4 sm:space-y-8">
        {/* Galerie Supabase */}
        <div className="bg-primary/50 rounded-lg p-3 sm:p-6 border border-accent/20">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Galerie (Supabase)</h3>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-accent bg-accent/10'
                : 'border-gray-600 hover:border-accent/50 bg-secondary'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto text-accent mb-3" size={36} />
            {uploading ? (
              <p className="text-white font-semibold">Upload en cours...</p>
            ) : isDragActive ? (
              <p className="text-white font-semibold">Déposez les photos ici...</p>
            ) : (
              <>
                <p className="text-white font-semibold mb-1">Glissez-déposez des photos</p>
                <p className="text-gray-400 text-sm">ou cliquez pour sélectionner (JPG, PNG, WEBP - Max 10 MB)</p>
              </>
            )}
          </div>

          {/* Liste des photos */}
          <div className="mt-6">
            {loadingGallery ? (
              <div className="flex justify-center py-8 text-gray-400">Chargement...</div>
            ) : photos.length === 0 ? (
              <div className="text-center py-8 bg-secondary rounded-xl">
                <ImageIcon className="mx-auto text-gray-600 mb-3" size={48} />
                <p className="text-gray-400">Aucune photo pour le moment</p>
                <p className="text-gray-500 text-sm mt-1">Uploadez vos premières photos ci-dessus</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.name + index}
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
                        <X size={18} />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs truncate">{photo.name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Statistiques */}
          <div className="mt-4 text-gray-400 text-sm">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} dans la galerie
          </div>
        </div>

        {/* Hero Image */}
        <div className="bg-primary/50 rounded-lg p-3 sm:p-6 border border-accent/20">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Image Hero (Arrière-plan)</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-32 h-32 sm:h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
              {images.hero ? (
                <img src={images.hero} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'hero')}
                  className="hidden"
                />
                <div className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 cursor-pointer transition-colors text-sm sm:text-base">
                  <Upload size={16} />
                  Changer l&apos;image hero
                </div>
              </label>
              {images.hero && (
                <button
                  onClick={() => removeImage('hero')}
                  className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                >
                  <X size={14} />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-primary/50 rounded-lg p-3 sm:p-6 border border-accent/20">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Logo du Salon</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-24 h-24 sm:w-20 sm:h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
              {images.logo ? (
                <img src={images.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="hidden"
                />
                <div className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 cursor-pointer transition-colors text-sm sm:text-base">
                  <Upload size={16} />
                  Changer le logo
                </div>
              </label>
              {images.logo && (
                <button
                  onClick={() => removeImage('logo')}
                  className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                >
                  <X size={14} />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Images */}
        <div className="bg-primary/50 rounded-lg p-3 sm:p-6 border border-accent/20">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Images Portfolio</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {images.portfolio.map((image, index) => (
              <div key={index} className="relative group">
                <div className="w-full h-20 sm:h-24 bg-secondary rounded-lg overflow-hidden">
                  <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => removeImage('portfolio', index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            <label className="w-full h-20 sm:h-24 bg-secondary/50 border-2 border-dashed border-accent/30 rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent/10 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'portfolio')}
                className="hidden"
              />
              <div className="text-center">
                <Upload size={20} className="text-accent mx-auto mb-1" />
                <p className="text-xs text-gray-400">Ajouter</p>
              </div>
            </label>
          </div>
        </div>

        {/* Testimonials Images */}
        <div className="bg-primary/50 rounded-lg p-3 sm:p-6 border border-accent/20">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Photos de Témoignages</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {images.testimonials.map((image, index) => (
              <div key={index} className="relative group">
                <div className="w-full h-20 sm:h-24 bg-secondary rounded-lg overflow-hidden">
                  <img src={image} alt={`Témoignage ${index + 1}`} className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => removeImage('testimonials', index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            <label className="w-full h-20 sm:h-24 bg-secondary/50 border-2 border-dashed border-accent/30 rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent/10 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'testimonials')}
                className="hidden"
              />
              <div className="text-center">
                <Upload size={20} className="text-accent mx-auto mb-1" />
                <p className="text-xs text-gray-400">Ajouter</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-accent/10 rounded-lg border border-accent/20">
        <h4 className="text-accent font-semibold mb-2 text-sm sm:text-base">ℹ️ Informations</h4>
        <p className="text-xs sm:text-sm text-gray-300">
          Les images sont stockées localement pour la démonstration. En production, utilisez un service de stockage cloud comme AWS S3 ou Cloudinary.
        </p>
      </div>
    </div>
  )
}