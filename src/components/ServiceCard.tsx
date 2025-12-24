'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import { useRouter } from 'next/navigation'
import { Clock, ArrowRight, Sparkles } from 'lucide-react'

interface ServiceCardProps {
  title: string
  description: string
  price: number
  duration: number
  icon?: React.ReactNode
}

export default function ServiceCard({ title, description, price, duration, icon }: ServiceCardProps) {
  const { t } = useLanguage()
  const router = useRouter()

  const handleReserve = () => {
    // Rediriger vers la page booking avec le service pré-sélectionné
    router.push(`/booking?service=${encodeURIComponent(title)}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-accent/50 transition-all duration-500 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-accent/10 overflow-hidden"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        {icon && (
          <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 text-accent text-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            {icon}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-accent transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Duration & Price */}
        <div className="flex items-center justify-between mb-6 py-4 px-4 -mx-4 bg-white/5 rounded-xl border-y border-white/5">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={16} className="text-accent" />
            <span className="text-sm font-medium">{duration} min</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{t.services.from}</p>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-accent to-yellow-400 bg-clip-text text-transparent">
              {price}€
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReserve}
          className="group/btn w-full relative inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 bg-gradient-to-r from-accent to-yellow-500 text-black font-bold rounded-xl overflow-hidden transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
        >
          <Sparkles size={16} className="transition-transform group-hover/btn:rotate-12" />
          <span>{t.services.reserve}</span>
          <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
        </motion.button>
      </div>
    </motion.div>
  )
}
