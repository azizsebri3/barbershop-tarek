'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="py-12 sm:py-20 px-3 sm:px-4 md:px-6 lg:px-8 bg-secondary/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            {t.testimonials.title} <span className="text-accent">{t.testimonials.titleAccent}</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-base md:text-lg max-w-2xl mx-auto">
            {t.testimonials.description}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-primary border border-secondary rounded-xl p-4 sm:p-6 hover:border-accent transition-colors"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-accent text-accent sm:w-4 sm:h-4"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="text-2xl sm:text-3xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-bold text-white text-xs sm:text-sm">{testimonial.name}</p>
                  <p className="text-gray-400 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
