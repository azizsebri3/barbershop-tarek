'use client'

import { motion } from 'framer-motion'
import { Star, Quote, Sparkles } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    role: 'Client régulier',
    content: 'Excellent service ! Les coiffeurs sont très professionnels et à l\'écoute. Je reviens toujours satisfait.',
    rating: 5,
    avatar: '👨',
  },
  {
    id: '2',
    name: 'Marie Bernard',
    role: 'Première visite',
    content: 'Ambiance chaleureuse et coiffeurs talentueux. Ma coloration est parfaite ! Je recommande vivement.',
    rating: 5,
    avatar: '👩',
  },
  {
    id: '3',
    name: 'Thomas Martin',
    role: 'Client depuis 2 ans',
    content: 'Le meilleur salon de coiffure de la région ! Accueil formidable et résultats toujours impeccables.',
    rating: 5,
    avatar: '👨',
  },
  {
    id: '4',
    name: 'Sophie Lefevre',
    role: 'Client régulier',
    content: 'Produits de qualité, coiffeurs expérimentés et un accueil sympathique. Je suis ravie !',
    rating: 5,
    avatar: '👩',
  },
]

export default function Testimonials() {
  const { t } = useLanguage()
  
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {testimonials.map((testimonial, index) => (
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
                      <Star
                        size={16}
                        className="fill-accent text-accent"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Review Content */}
                <p className="text-gray-300 mb-6 text-sm sm:text-base leading-relaxed line-clamp-4">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{testimonial.name}</p>
                    <p className="text-accent/80 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
              4.9/5
            </p>
            <p className="text-gray-400 text-sm mt-1">Note moyenne</p>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
              500+
            </p>
            <p className="text-gray-400 text-sm mt-1">Avis clients</p>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block" />
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
              98%
            </p>
            <p className="text-gray-400 text-sm mt-1">Satisfaction</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
