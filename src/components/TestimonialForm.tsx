'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, Sparkles, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface TestimonialFormProps {
  onSuccess?: () => void
}

export default function TestimonialForm({ onSuccess }: TestimonialFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    message: '',
    service: '',
  })

  const [hoveredStar, setHoveredStar] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit testimonial')
      }

      setSubmitted(true)
      toast.success('Merci pour votre feedback ! 🌟')
      
      // Reset form after delay
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
        setFormData({
          name: '',
          email: '',
          rating: 5,
          message: '',
          service: '',
        })
        onSuccess?.()
      }, 2500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 group"
      >
        <div className="relative">
          {/* Pulsating ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-accent/30 rounded-full blur-xl"
          />
          
          {/* Button */}
          <div className="relative flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-accent via-yellow-400 to-accent text-black font-bold rounded-full shadow-2xl shadow-accent/50">
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">Laissez votre avis</span>
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border border-white/10 shadow-2xl"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[150px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[100px]" />

              <div className="relative p-6 sm:p-8">
                {!submitted ? (
                  <>
                    {/* Header */}
                    <div className="text-center mb-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-yellow-500 rounded-2xl mb-4 shadow-lg shadow-accent/20"
                      >
                        <Star className="w-8 h-8 text-black fill-current" />
                      </motion.div>
                      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                        Partagez votre{' '}
                        <span className="bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
                          expérience
                        </span>
                      </h2>
                      <p className="text-gray-400">Votre avis compte beaucoup pour nous</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nom *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:bg-white/10 transition-all"
                            placeholder="Votre nom"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:bg-white/10 transition-all"
                            placeholder="votre@email.com"
                          />
                        </div>
                      </div>

                      {/* Service */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Service (optionnel)
                        </label>
                        <input
                          type="text"
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:bg-white/10 transition-all"
                          placeholder="Ex: Coupe homme, Dégradé, etc."
                        />
                      </div>

                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Note *
                        </label>
                        <div className="flex gap-2 justify-center sm:justify-start">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              type="button"
                              whileHover={{ scale: 1.2, rotate: 10 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setFormData({ ...formData, rating: star })}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-10 h-10 transition-all ${
                                  star <= (hoveredStar || formData.rating)
                                    ? 'fill-accent text-accent'
                                    : 'text-gray-600'
                                }`}
                              />
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Votre message *
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:bg-white/10 transition-all resize-none"
                          placeholder="Partagez votre expérience avec nous..."
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsOpen(false)}
                          disabled={isSubmitting}
                          className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                          Annuler
                        </motion.button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSubmitting}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-yellow-500 text-black font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                              />
                              Envoi...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Envoyer
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* Success State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6"
                    >
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">Merci !</h3>
                    <p className="text-gray-400">
                      Votre avis a été envoyé avec succès.<br />
                      Il sera publié après validation.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
