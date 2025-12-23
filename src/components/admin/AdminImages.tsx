'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, RefreshCw, Upload, X, Image as ImageIcon } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

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

  useEffect(() => {
    // Load images from localStorage
    const saved = localStorage.getItem('admin_images')
    if (saved) {
      setImages(JSON.parse(saved))
    }
  }, [])

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