'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, RefreshCw } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useGeneralSettings } from '@/lib/useGeneralSettings'
import { useLanguage } from '@/lib/language-context'
import { adminTranslations } from '@/lib/admin-translations'

export default function AdminGeneral() {
  const { t } = useLanguage()
  const t_admin = adminTranslations.general
  const { settings, updateSettings } = useGeneralSettings()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    console.log('💾 Début de la sauvegarde, paramètres actuels:', settings)
    try {
      await updateSettings(settings)
      console.log('✅ Sauvegarde terminée avec succès')
      toast.success(t_admin.settingsSaved)
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      toast.error(t_admin.error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: keyof typeof settings, value: string) => {
    updateSettings({ [key]: value })
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">{t_admin.title}</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 disabled:opacity-50 text-sm sm:text-base"
        >
          {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Saving...' : t_admin.save}
        </motion.button>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Salon Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t_admin.salonName}
          </label>
          <input
            type="text"
            value={settings.salonName}
            onChange={(e) => updateSetting('salonName', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t_admin.description}
          </label>
          <textarea
            rows={3}
            value={settings.description}
            onChange={(e) => updateSetting('description', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base resize-none"
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t_admin.phone}
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => updateSetting('phone', e.target.value)}
              className="w-full px-3 sm:px-4 py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t_admin.email}
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => updateSetting('email', e.target.value)}
              className="w-full px-3 sm:px-4 py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t_admin.address}
          </label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => updateSetting('address', e.target.value)}
            className="w-full px-3 sm:px-4 py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base"
          />
        </div>

        {/* Social Media */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t_admin.facebook} (optional)
            </label>
            <input
              type="url"
              value={settings.facebook}
              onChange={(e) => updateSetting('facebook', e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full px-3 sm:px-4 py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t_admin.instagram} (optional)
            </label>
            <input
              type="url"
              value={settings.instagram}
              onChange={(e) => updateSetting('instagram', e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full px-3 sm:px-4 py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent text-sm sm:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  )
}