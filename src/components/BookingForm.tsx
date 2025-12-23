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
      className="bg-secondary rounded-xl p-4 sm:p-6 md:p-8 max-w-2xl mx-auto"
    >
      <Toaster position="top-right" />
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">{t.booking.title}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          {/* Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">{t.booking.fullName} *</label>
            <input
              {...register('name', { required: t.booking.errors.nameRequired })}
              type="text"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
              placeholder={t.booking.placeholders.name}
            />
            {errors.name && <p className="text-accent text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">{t.booking.email} *</label>
            <input
              {...register('email', {
                required: t.booking.errors.emailRequired,
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t.booking.errors.emailInvalid },
              })}
              type="email"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
              placeholder={t.booking.placeholders.email}
            />
            {errors.email && <p className="text-accent text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">{t.booking.phone} *</label>
            <input
              {...register('phone', { required: t.booking.errors.phoneRequired })}
              type="tel"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
              placeholder={t.booking.placeholders.phone}
            />
            {errors.phone && <p className="text-accent text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* Service */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">{t.booking.service} *</label>
            <select
              {...register('service', { required: t.booking.errors.serviceRequired })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-primary border border-primary rounded-lg text-white text-sm focus:outline-none focus:border-accent"
              disabled={servicesLoading}
            >
              <option value="">
                {servicesLoading ? 'Chargement...' : t.booking.chooseService}
              </option>
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            {errors.service && <p className="text-accent text-xs mt-1">{errors.service.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">{t.booking.date} *</label>
            <input
              {...register('date', { required: t.booking.errors.dateRequired })}
              type="date"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-primary border border-primary rounded-lg text-white text-sm focus:outline-none focus:border-accent"
            />
            {errors.date && <p className="text-accent text-xs mt-1">{errors.date.message}</p>}
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">{t.booking.time} *</label>
            <input
              {...register('time', { required: t.booking.errors.timeRequired })}
              type="time"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-primary border border-primary rounded-lg text-white text-sm focus:outline-none focus:border-accent"
            />
            {errors.time && <p className="text-accent text-xs mt-1">{errors.time.message}</p>}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">{t.booking.message}</label>
          <textarea
            {...register('message')}
            rows={3}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
            placeholder={t.booking.placeholders.message}
          />
        </div>

        {/* Opening Hours Info */}
        <div className="bg-primary/50 rounded-lg p-4 border border-accent/20">
          <h4 className="text-accent font-semibold text-sm mb-2">ℹ️ Horaires d&apos;ouverture</h4>
          <div className="text-xs text-gray-300 space-y-1">
            <p>Lundi - Jeudi : 9h00 - 19h00</p>
            <p>Vendredi : 9h00 - 20h00</p>
            <p>Samedi : 9h00 - 18h00</p>
            <p>Dimanche : Fermé</p>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-accent text-primary py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? t.booking.submitting : t.booking.submit}
        </motion.button>
      </form>
    </motion.div>
  )
}
