'use client'

import { motion } from 'framer-motion'
import { Clock, MapPin, Phone } from 'lucide-react'
import { useOpeningHours } from '@/lib/useOpeningHours'
import { useLanguage } from '@/lib/language-context'

export default function OpeningHours() {
  const { t } = useLanguage()
  const { hours, loading } = useOpeningHours()

  // Fonction pour vérifier si le salon est ouvert maintenant
  const isOpenNow = () => {
    if (loading) return false

    const now = new Date()
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const todayHours = hours[dayOfWeek as keyof typeof hours]
    if (!todayHours || todayHours.closed) return false

    const [openHour, openMinute] = todayHours.open.split(':').map(Number)
    const [closeHour, closeMinute] = todayHours.close.split(':').map(Number)

    const openTime = openHour * 60 + openMinute
    const closeTime = closeHour * 60 + closeMinute

    return currentTime >= openTime && currentTime < closeTime
  }

  const open = isOpenNow()
  const days = Object.entries(hours)

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary rounded-xl p-6 sm:p-8 max-w-md mx-auto border border-accent/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-accent animate-pulse" size={24} />
          <h3 className="text-lg sm:text-xl font-bold text-white">Chargement...</h3>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-secondary rounded-xl p-6 sm:p-8 max-w-md mx-auto border border-accent/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <Clock className="text-accent" size={24} />
        <h3 className="text-lg sm:text-xl font-bold text-white">{t.hours.title}</h3>
      </div>

      <div className="mb-6 p-3 sm:p-4 bg-primary rounded-lg border-l-4 border-accent">
        <p className={`font-bold text-sm sm:text-base ${open ? 'text-accent' : 'text-gray-400'}`}>
          {open ? `✓ ${t.hours.open}` : `✗ ${t.hours.closed}`}
        </p>
      </div>

      <div className="space-y-2 sm:space-y-3 mb-6">
        {days.map(([day, hours]) => (
          <div key={day} className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-gray-400 capitalize font-medium">{day}</span>
            <span className="text-white text-right">
              {hours.closed ? t.hours.closed : `${hours.open} - ${hours.close}`}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-accent/20">
        <div className="flex items-center gap-3">
          <Phone size={16} className="text-accent flex-shrink-0" />
          <span className="text-gray-300 text-xs sm:text-sm">+32 2 123 45 67</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin size={16} className="text-accent flex-shrink-0" />
          <span className="text-gray-300 text-xs sm:text-sm">Belgique</span>
        </div>
      </div>
    </motion.div>
  )
}
