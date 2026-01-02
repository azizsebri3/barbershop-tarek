'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface AdminBrandingProps {}

export default function AdminBranding({}: AdminBrandingProps) {
  const [logoUrl, setLogoUrl] = useState<string>('https://via.placeholder.com/200?text=Logo')
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Load current logo
  useEffect(() => {
    fetchLogoUrl()
    // Clear any stale preview
    setPreviewUrl(null)
  }, [])

  async function fetchLogoUrl() {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.logo_url && data.logo_url.trim()) {
          // Force component re-render by clearing state first
          setLogoUrl('')
          setTimeout(() => {
            setLogoUrl(data.logo_url)
          }, 10)
        } else {
          // No logo set, keep default placeholder
          setLogoUrl('https://via.placeholder.com/200?text=Logo')
        }
      }
    } catch (error) {
      console.error('Error fetching logo:', error)
      setLogoUrl('https://via.placeholder.com/200?text=Logo')
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2MB')
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/logo/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Erreur API:', error)
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      
      if (data.url && data.url.trim()) {
        // Clear preview and force reload of logo
        setPreviewUrl(null)
        setLogoUrl('')
        setTimeout(() => {
          setLogoUrl(data.url)
          toast.success('✅ Logo uploadé sur Supabase avec succès!')
        }, 10)

        // Reload page to reflect changes in header
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error('URL du logo manquante dans la réponse')
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      toast.error(`❌ Erreur: ${error.message}`)
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Logo & Identité</h2>
        <p className="text-gray-400">
          Gérez le logo de votre salon (favicon, PWA, en-têtes)
        </p>
      </div>

      {/* Current Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 rounded-2xl overflow-hidden">
            <img
              key={`${logoUrl}-${Date.now()}`}
              src={previewUrl || logoUrl || 'https://via.placeholder.com/200?text=Logo'}
              alt="Logo actuel"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('❌ Error loading logo:', e)
                // Don't fallback to deleted /logo.png
              }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Logo Actuel</h3>
            <p className="text-sm text-gray-400">Affiché sur tout le site</p>
          </div>
        </div>
      </motion.div>

      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-accent" />
          Changer le Logo
        </h3>

        <div className="space-y-4">
          {/* Upload Button */}
          <div>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <label htmlFor="logo-upload" className="block cursor-pointer">
              <div className="relative group">
                <div className="bg-gradient-to-r from-accent/20 to-yellow-500/20 rounded-xl p-8 border-2 border-dashed border-accent/30 group-hover:border-accent/60 transition-all duration-300">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full group-hover:scale-110 transition-transform">
                      {isUploading ? (
                        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-accent" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {isUploading ? 'Upload en cours...' : 'Cliquez pour uploader'}
                      </p>
                      <p className="text-sm text-gray-400">PNG, JPG, SVG (max 2MB)</p>
                    </div>
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Format recommandé</h4>
                  <p className="text-sm text-gray-400">
                    PNG transparent, 512x512px minimum
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Auto-génération</h4>
                  <p className="text-sm text-gray-400">
                    Les icônes PWA seront générées automatiquement
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Info */}
          <div className="bg-gradient-to-r from-accent/10 to-yellow-500/10 rounded-xl p-6 border border-accent/20">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent" />
              Où sera utilisé ce logo ?
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                Header du site web (en haut à gauche)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                Favicon (onglets du navigateur)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                PWA Icons (application mobile)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                Stocké sur Supabase Storage (CDN rapide)
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
