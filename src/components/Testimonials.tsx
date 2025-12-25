'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, Sparkles, RefreshCw } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import TestimonialForm from './TestimonialForm'

interface Testimonial {
  id: string
  name: string
  email: string
  rating: number
  message: string
  service: string | null
  is_approved: boolean
  created_at: string
}

export default function Testimonials() {
  const { t } = useLanguage()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTestimonials = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/testimonials', {
        cache: 'no-store',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials')
      }
      
      const data = await response.json()
      setTestimonials(data)
    } catch (err) {
      console.error('Error fetching testimonials:', err)
      setError('Impossible de charger les avis')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  // Calculate statistics
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
    : '5.0'
  
  const totalCount = testimonials.length
  const satisfactionRate = testimonials.length > 0
    ? Math.round((testimonials.filter(t => t.rating >= 4).length / testimonials.length) * 100)
    : 100

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white/80">Témoignages</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            {t.testimonials.title}{' '}
            <span className="bg-gradient-to-r from-accent via-yellow-400 to-accent bg-clip-text text-transparent">
              {t.testimonials.titleAccent}
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t.testimonials.description}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        {isLoading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-8 h-8 text-accent" />
            </motion.div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchTestimonials}
              className="mt-4 px-6 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : testimonials.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-2xl mb-6">
              <Star className="w-10 h-10 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Soyez le premier à laisser un avis !
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Partagez votre expérience avec notre salon et aidez d&apos;autres clients à nous découvrir.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
          >
            {testimonials.map((testimonial) => {
              // Generate avatar emoji based on name first letter
              const firstLetter = testimonial.name.charAt(0).toUpperCase()
              const avatarEmoji = firstLetter.charCodeAt(0) % 2 === 0 ? '👨' : '👩'
              
              return (
                <motion.div
                  key={testimonial.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-5 sm:p-6 hover:border-accent/40 transition-all duration-500 shadow-xl shadow-black/20 overflow-hidden"
                >
                  {/* Background glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  </div>

                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Quote size={40} className="text-accent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <Star size={16} className="fill-accent text-accent" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Review Content */}
                    <p className="text-gray-300 mb-6 text-sm sm:text-base leading-relaxed line-clamp-4">
                      &ldquo;{testimonial.message}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center text-2xl">
                        {avatarEmoji}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{testimonial.name}</p>
                        {testimonial.service && (
                          <p className="text-accent/80 text-xs">{testimonial.service}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
        >
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
              {avgRating}/5
            </p>
            <p className="text-gray-400 text-sm mt-1">Note moyenne</p>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
              {totalCount}+
            </p>
            <p className="text-gray-400 text-sm mt-1">Avis clients</p>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
              {satisfactionRate}%
            </p>
            <p className="text-gray-400 text-sm mt-1">Satisfaction</p>
          </div>
        </motion.div>
      </div>

      {/* Testimonial Form - Floating Button */}
      <TestimonialForm onSuccess={fetchTestimonials} />
    </section>
  )
}
