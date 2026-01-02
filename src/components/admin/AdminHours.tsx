'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, RefreshCw, Clock } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { openingHours as defaultHours } from '@/lib/data'
import { adminTranslations } from '@/lib/admin-translations'

interface OpeningHours {
  monday: { open: string; close: string; closed: boolean }
  tuesday: { open: string; close: string; closed: boolean }
  wednesday: { open: string; close: string; closed: boolean }
  thursday: { open: string; close: string; closed: boolean }
  friday: { open: string; close: string; closed: boolean }
  saturday: { open: string; close: string; closed: boolean }
  sunday: { open: string; close: string; closed: boolean }
}

export default function AdminHours() {
  const t = adminTranslations.hours
  const [hours, setHours] = useState<OpeningHours>(defaultHours)
  const [isSaving, setIsSaving] = useState(false)

  const daysOfWeek = [
    { key: 'monday', label: t.monday },
    { key: 'tuesday', label: t.tuesday },
    { key: 'wednesday', label: t.wednesday },
    { key: 'thursday', label: t.thursday },
    { key: 'friday', label: t.friday },
    { key: 'saturday', label: t.saturday },
    { key: 'sunday', label: t.sunday },
  ]

  useEffect(() => {
    loadHours()
  }, [])

  const loadHours = async () => {
    try {
      const response = await fetch('/api/hours')
      const data = await response.json()

      if (data.error) {
        console.error('❌ Erreur API:', data.error)
        // Fallback to localStorage
        const saved = localStorage.getItem('admin_opening_hours')
        if (saved) {
          setHours(JSON.parse(saved))
        }
      } else if (data.hours) {
        setHours(data.hours)
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des horaires:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem('admin_opening_hours')
      if (saved) {
        setHours(JSON.parse(saved))
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Erreur API:', data.error)
        // Fallback to localStorage
        localStorage.setItem('admin_opening_hours', JSON.stringify(hours))
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      // Also save to localStorage as backup
      localStorage.setItem('admin_opening_hours', JSON.stringify(hours))
      toast.success(t.hoursSaved)
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      // Fallback to localStorage
      localStorage.setItem('admin_opening_hours', JSON.stringify(hours))
      toast.error(t.error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateHours = (day: keyof OpeningHours, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">{t.title}</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 disabled:opacity-50 text-sm sm:text-base"
        >
          {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Saving...' : t.save}
        </motion.button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {daysOfWeek.map((day) => (
          <motion.div
            key={day.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/50 rounded-lg p-3 sm:p-4 border border-accent/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="text-accent" size={18} />
                <h3 className="text-base sm:text-lg font-semibold text-white">{day.label}</h3>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={hours[day.key as keyof OpeningHours].closed}
                  onChange={(e) => updateHours(day.key as keyof OpeningHours, 'closed', e.target.checked)}
                  className="rounded border-accent/20 bg-primary text-accent focus:ring-accent w-4 h-4"
                />
                <span className="text-gray-300">{t.closed}</span>
              </label>
            </div>

            {!hours[day.key as keyof OpeningHours].closed && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1">
                    {t.openTime}
                  </label>
                  <input
                    type="time"
                    value={hours[day.key as keyof OpeningHours].open}
                    onChange={(e) => updateHours(day.key as keyof OpeningHours, 'open', e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-accent/20 rounded text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-1">
                    {t.closeTime}
                  </label>
                  <input
                    type="time"
                    value={hours[day.key as keyof OpeningHours].close}
                    onChange={(e) => updateHours(day.key as keyof OpeningHours, 'close', e.target.value)}
                    className="w-full px-3 py-2 bg-secondary border border-accent/20 rounded text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}