'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Booking } from '@/lib/supabase'
import DateTimePicker from '@/components/DateTimePicker'

interface EditBookingModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onSave: (updates: Partial<Booking> & { notifyClient?: boolean }) => Promise<void>
  isSaving: boolean
}

export default function EditBookingModal({
  booking,
  isOpen,
  onClose,
  onSave,
  isSaving
}: EditBookingModalProps) {
  const [formData, setFormData] = useState<Partial<Booking>>(booking || {})
  const [hasChanges, setHasChanges] = useState(false)
  const [notifyClient, setNotifyClient] = useState(false)

  // Update form data when booking changes
  useEffect(() => {
    if (booking) {
      setFormData(booking)
      setHasChanges(false)
    }
  }, [booking, isOpen])

  const handleChange = (field: keyof Booking, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleSubmit = async () => {
    if (!hasChanges) {
      toast.error('No changes to save')
      return
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time || !formData.service) {
      toast.error('All fields are required')
      return
    }

    try {
      await onSave({ ...formData, notifyClient })
      setHasChanges(false)
      setNotifyClient(false)
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  if (!booking) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800">
                <h2 className="text-2xl font-bold text-white">Edit Booking</h2>
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className="text-gray-400 hover:text-white transition disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {hasChanges && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-blue-300 text-sm">You have unsaved changes</p>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-accent outline-none transition disabled:opacity-50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-accent outline-none transition disabled:opacity-50"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-accent outline-none transition disabled:opacity-50"
                  />
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Service *</label>
                  <input
                    type="text"
                    value={formData.service || ''}
                    onChange={(e) => handleChange('service', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-accent outline-none transition disabled:opacity-50"
                  />
                </div>

                {/* Date & Time Picker */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">📅 Date & Heure *</label>
                  <DateTimePicker
                    currentDate={formData.date || ''}
                    currentTime={formData.time || ''}
                    onDateChange={(date) => handleChange('date', date)}
                    onTimeChange={(time) => handleChange('time', time)}
                    excludeBookingId={formData.id}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Message/Notes</label>
                  <textarea
                    value={formData.message || ''}
                    onChange={(e) => handleChange('message', e.target.value)}
                    disabled={isSaving}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-accent outline-none transition disabled:opacity-50"
                  />
                </div>

                {/* Notify Client Checkbox */}
                <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <input
                    type="checkbox"
                    id="notifyClient"
                    checked={notifyClient}
                    onChange={(e) => setNotifyClient(e.target.checked)}
                    disabled={isSaving}
                    className="w-4 h-4 cursor-pointer accent-accent"
                  />
                  <label htmlFor="notifyClient" className="text-sm text-blue-300 cursor-pointer flex-1">
                    📧 Notifier le client des changements
                  </label>
                </div>

                {/* Current Status Info */}
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">
                    <strong>Status:</strong> <span className="text-accent capitalize">{formData.status}</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    <strong>Created:</strong> {new Date(formData.created_at || '').toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800">
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving || !hasChanges}
                  className="px-6 py-2 bg-accent hover:bg-accent-dark text-black font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={20} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
