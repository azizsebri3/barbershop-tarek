'use client'

import { motion } from 'framer-motion'
import { Clock, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react'
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
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 sm:p-8 max-w-md mx-auto border border-white/10 shadow-xl shadow-black/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Clock className="text-accent animate-pulse" size={24} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Chargement...</h3>
            <p className="text-gray-400 text-sm">Veuillez patienter</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 sm:p-8 max-w-md mx-auto border border-white/10 shadow-xl shadow-black/20 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      {/* Header */}
      <div className="relative flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
          <Clock className="text-accent" size={26} />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">{t.hours.title}</h3>
          <p className="text-gray-400 text-sm">Horaires d&apos;ouverture</p>
        </div>
      </div>

      {/* Status Badge */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`relative mb-6 p-4 rounded-xl border ${
          open 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          {open ? (
            <CheckCircle className="text-green-400" size={22} />
          ) : (
            <XCircle className="text-red-400" size={22} />
          )}
          <div>
            <p className={`font-bold text-base ${open ? 'text-green-400' : 'text-red-400'}`}>
              {open ? t.hours.open : t.hours.closed}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {open ? 'Nous sommes disponibles' : 'Revenez bientôt'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Hours List */}
      <div className="space-y-2 mb-6">
        {days.map(([day, dayHours], index) => {
          const isToday = day === today
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className={`flex justify-between items-center p-3 rounded-xl transition-all duration-300 ${
                isToday 
                  ? 'bg-accent/10 border border-accent/20' 
                  : 'hover:bg-white/5'
              }`}
            >
              <span className={`capitalize font-medium text-sm ${isToday ? 'text-accent' : 'text-gray-400'}`}>
                {isToday && <span className="mr-2">•</span>}
                {day}
              </span>
              <span className={`text-sm font-medium ${
                dayHours.closed 
                  ? 'text-red-400/80' 
                  : isToday ? 'text-white' : 'text-gray-300'
              }`}>
                {dayHours.closed ? t.hours.closed : `${dayHours.open} - ${dayHours.close}`}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Contact Info */}
      <div className="pt-6 border-t border-white/10 space-y-4">
        <motion.a
          whileHover={{ x: 4 }}
          href="tel:+3221234567"
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Phone size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Téléphone</p>
            <p className="text-white font-medium text-sm">+32465632205</p>
          </div>
        </motion.a>
        
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <MapPin size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Adresse</p>
            <p className="text-white font-medium text-sm">Belgique</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
