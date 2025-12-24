'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useServices } from '@/lib/useServices'
import { useOpeningHours } from '@/lib/useOpeningHours'
import { useLanguage } from '@/lib/language-context'

interface BookingFormData {
  name: string
  email: string
  phone: string
  date: string
  time: string
  service: string
  message?: string
}

export default function BookingForm() {
  const { t } = useLanguage()
  const { services, loading: servicesLoading } = useServices()
  const { hours: openingHours } = useOpeningHours()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookingFormData>()

  const validateBookingTime = (date: string, time: string) => {
    const bookingDate = new Date(`${date}T${time}`)
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const hours = openingHours[dayOfWeek as keyof typeof openingHours]

    if (!hours || hours.closed) {
      return false
    }

    const bookingTime = time
    return bookingTime >= hours.open && bookingTime <= hours.close
  }

  const onSubmit = async (data: BookingFormData) => {
    // Validate booking time
    if (!validateBookingTime(data.date, data.time)) {
      toast.error('Le salon est fermé à cette heure. Veuillez choisir un autre horaire.')
      return
    }

    try {
      setIsSubmitting(true)

      // Send to API route for booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('✅ Rendez-vous réservé ! Un email de confirmation vous a été envoyé.')
        reset()
      } else {
        toast.error(result.error || 'Erreur lors de la réservation')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(t.booking.title)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-2xl p-6 sm:p-8 md:p-10 max-w-2xl mx-auto border border-white/10 shadow-2xl shadow-black/30 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
      
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="relative mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{t.booking.title}</h2>
        <p className="text-gray-400 text-sm sm:text-base">Remplissez le formulaire pour réserver votre créneau</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{t.booking.fullName} *</label>
            <input
              {...register('name', { required: t.booking.errors.nameRequired })}
              type="text"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent focus:bg-white/10 transition-all duration-300"
              placeholder={t.booking.placeholders.name}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{t.booking.email} *</label>
            <input
              {...register('email', {
                required: t.booking.errors.emailRequired,
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t.booking.errors.emailInvalid },
              })}
              type="email"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent focus:bg-white/10 transition-all duration-300"
              placeholder={t.booking.placeholders.email}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{t.booking.phone} *</label>
            <input
              {...register('phone', { required: t.booking.errors.phoneRequired })}
              type="tel"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent focus:bg-white/10 transition-all duration-300"
              placeholder={t.booking.placeholders.phone}
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* Service */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{t.booking.service} *</label>
            <select
              {...register('service', { required: t.booking.errors.serviceRequired })}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-accent focus:bg-white/10 transition-all duration-300 cursor-pointer"
              disabled={servicesLoading}
            >
              <option value="" className="bg-black">
                {servicesLoading ? 'Chargement...' : t.booking.chooseService}
              </option>
              {services.map(service => (
                <option key={service.id} value={service.name} className="bg-black">{service.name}</option>
              ))}
            </select>
            {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{t.booking.date} *</label>
            <input
              {...register('date', { required: t.booking.errors.dateRequired })}
              type="date"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-accent focus:bg-white/10 transition-all duration-300"
            />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{t.booking.time} *</label>
            <input
              {...register('time', { required: t.booking.errors.timeRequired })}
              type="time"
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-accent focus:bg-white/10 transition-all duration-300"
            />
            {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time.message}</p>}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">{t.booking.message}</label>
          <textarea
            {...register('message')}
            rows={3}
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent focus:bg-white/10 transition-all duration-300 resize-none"
            placeholder={t.booking.placeholders.message}
          />
        </div>

        {/* Opening Hours Info */}
        <div className="bg-accent/5 rounded-xl p-5 border border-accent/20">
          <h4 className="text-accent font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center text-xs">ℹ️</span>
            Horaires d&apos;ouverture
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
            <p>Lundi - Jeudi</p><p className="text-right text-white">9h00 - 19h00</p>
            <p>Vendredi</p><p className="text-right text-white">9h00 - 20h00</p>
            <p>Samedi</p><p className="text-right text-white">9h00 - 18h00</p>
            <p>Dimanche</p><p className="text-right text-red-400">Fermé</p>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.2)' }}
          whileTap={{ scale: 0.99 }}
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-gradient-to-r from-accent to-yellow-500 text-black py-4 rounded-xl font-bold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-accent/20"
        >
          {isSubmitting ? t.booking.submitting : t.booking.submit}
        </motion.button>
      </form>
    </motion.div>
  )
}
