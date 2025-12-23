'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'
import { useRouter } from 'next/navigation'

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-secondary rounded-xl p-6 sm:p-8 border border-secondary hover:border-accent transition-all duration-300 group shadow-lg hover:shadow-accent/20"
    >
      {icon && (
        <div className="text-accent text-3xl sm:text-4xl mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{title}</h3>
      <p className="text-gray-400 text-sm sm:text-base mb-4">{description}</p>

      <div className="flex justify-between items-end mb-4 pt-4 border-t border-accent/20">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">{t.services.duration}</p>
          <p className="text-white font-bold text-sm sm:text-base">{duration} min</p>
        </div>
        <div className="text-right">
          <p className="text-xs sm:text-sm text-gray-500">{t.services.from}</p>
          <p className="text-accent text-xl sm:text-2xl font-bold">{price}€</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReserve}
        className="w-full bg-accent text-primary py-2 sm:py-3 rounded-lg font-bold hover:bg-accent/90 transition-colors text-sm sm:text-base cursor-pointer"
      >
        {t.services.reserve}
      </motion.button>
    </motion.div>
  )
}
