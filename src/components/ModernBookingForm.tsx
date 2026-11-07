'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Calendar,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import CalendarBooking from './CalendarBooking'
import { useServices } from '@/lib/useServicesCached'
import { track } from '@vercel/analytics'
import { useLanguage } from '@/lib/language-context'

interface BookingFormData {
  name: string
  email: string
  phone: string
  message?: string
}

type BookingStep = 'service' | 'datetime' | 'details' | 'confirm'

export default function ModernBookingForm() {
  const { t, locale } = useLanguage()
  const { services, loading: servicesLoading } = useServices()
  const [currentStep, setCurrentStep] = useState<BookingStep>('service')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: string; time: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormData>()

  useEffect(() => {
    if (currentStep === 'service') return

    const formTop = formRef.current?.getBoundingClientRect().top
    if (formTop === undefined) return

    window.scrollTo({
      top: window.scrollY + formTop - 24,
      behavior: 'smooth',
    })
  }, [currentStep])

  const steps = useMemo(() => [
    { id: 'service', label: t.booking.serviceStep, icon: Sparkles },
    { id: 'datetime', label: t.booking.dateTimeStep, icon: Calendar },
    { id: 'details', label: t.booking.detailsStep, icon: User },
  ], [t.booking])

  const handleServiceSelect = useCallback((serviceId: string) => {
    setSelectedService(serviceId)
    setCurrentStep('datetime')
    track('booking_step_completed', { step: 'service' })
  }, [])

  const handleDateTimeSelect = useCallback((booking: { date: string; time: string; service: string }) => {
    setSelectedDateTime({ date: booking.date, time: booking.time })
    setCurrentStep('details')
    track('booking_step_completed', { step: 'datetime' })
  }, [])

  const handleBack = useCallback(() => {
    if (currentStep === 'datetime') setCurrentStep('service')
    else if (currentStep === 'details') setCurrentStep('datetime')
    else if (currentStep === 'confirm') setCurrentStep('details')
  }, [currentStep])

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedService || !selectedDateTime) {
      toast.error(`${t.booking.errors.serviceRequired} / ${t.booking.errors.dateRequired}`)
      return
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      toast.error(t.booking.errors.emailInvalid)
      return
    }

    try {
      setIsSubmitting(true)

      // Récupérer le nom du service sélectionné
      const selectedServiceData = services.find(s => s.id === selectedService)
      const serviceName = selectedServiceData?.name || selectedService

      const bookingData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        date: selectedDateTime.date,
        time: selectedDateTime.time,
        service: serviceName,
        message: data.message || '',
        status: 'pending' as const,
        language: locale
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t.booking.submitError)
      }

      setCurrentStep('confirm')
      toast.success(t.booking.success)
      track('booking_confirmed', { source: 'modern-booking-form' })
    } catch (error) {
      console.error('Erreur:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réservation. Veuillez réessayer.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderServiceStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{t.booking.chooseService}</h2>
        <p className="text-gray-400">{t.booking.chooseServiceDescription}</p>
      </div>

      {servicesLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleServiceSelect(service.id)}
              className={`p-6 rounded-xl border text-left transition-all ${
                selectedService === service.id
                  ? 'bg-accent/20 border-accent'
                  : 'bg-secondary/50 border-accent/20 hover:border-accent/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{t.services.serviceCatalog[service.translationKey as keyof typeof t.services.serviceCatalog]?.name || service.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{t.services.serviceCatalog[service.translationKey as keyof typeof t.services.serviceCatalog]?.description || service.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-accent font-semibold">{service.price}€</span>
                    <span className="text-gray-400 text-sm">{service.duration} {t.services.durationUnit}</span>
                  </div>
                </div>
                <ChevronRight className="text-accent" size={20} />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  )

  const renderDateTimeStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{t.booking.chooseDateTime}</h2>
        <p className="text-gray-400">{t.booking.chooseDateTimeDescription}</p>
      </div>

      <CalendarBooking
        onBookingSelect={handleDateTimeSelect}
        selectedService={selectedService}
      />
    </motion.div>
  )

  const renderDetailsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{t.booking.yourInformation}</h2>
        <p className="text-gray-400">{t.booking.yourInformationDescription}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t.booking.fullName}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                {...register('name', { required: t.booking.errors.nameRequired })}
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
                placeholder={t.booking.placeholders.name}
              />
            </div>
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t.booking.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                {...register('email', {
                  required: t.booking.errors.emailRequired,
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: t.booking.errors.emailInvalid
                  }
                })}
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
                placeholder={t.booking.placeholders.email}
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t.booking.phone}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                {...register('phone', { required: t.booking.errors.phoneRequired })}
                type="tel"
                className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
                placeholder={t.booking.placeholders.phone}
              />
            </div>
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t.booking.message}
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
            <textarea
              {...register('message')}
              rows={4}
              className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors resize-none"
              placeholder={t.booking.placeholders.message}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
            {t.booking.back}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                {t.booking.submit}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )

  const renderConfirmStep = () => {
    const selectedServiceData = services.find(s => s.id === selectedService)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-400" size={40} />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">{t.booking.confirmedTitle}</h2>
        <p className="text-gray-400 mb-8">
          {t.booking.confirmedDescription}
        </p>

        <div className="bg-secondary/50 backdrop-blur-md border border-accent/20 rounded-xl p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4">{t.booking.detailsTitle}</h3>

          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-400">{t.booking.service}:</span>
              <span className="text-white">{selectedServiceData ? t.services.serviceCatalog[selectedServiceData.translationKey as keyof typeof t.services.serviceCatalog]?.name || selectedServiceData.name : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t.booking.date}:</span>
              <span className="text-white">
                {selectedDateTime && format(new Date(selectedDateTime.date), 'dd/MM/yyyy', { locale: fr })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t.booking.time}:</span>
              <span className="text-white">{selectedDateTime?.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t.booking.price}:</span>
              <span className="text-accent font-semibold">{selectedServiceData?.price}€</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
          >
            {t.booking.backHome}
          </button>
          <button
            onClick={() => {
              setCurrentStep('service')
              setSelectedService('')
              setSelectedDateTime(null)
            }}
            className="px-6 py-3 bg-secondary/50 hover:bg-secondary/70 text-white rounded-lg transition-colors"
          >
            {t.booking.newBooking}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div ref={formRef} className="max-w-4xl mx-auto">
      <Toaster position="top-right" />

      {/* Progress Steps */}
      {currentStep !== 'confirm' && (
      <div className="mb-8">
        <div className="mx-auto flex w-full max-w-md items-center justify-center px-2 sm:max-w-lg">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'border-accent text-accent'
                    : 'border-gray-600 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle size={20} />
                  ) : (
                    <step.icon size={18} />
                  )}
                </div>
                  <span className="text-xs text-zinc-400">{index + 1}/3</span>
                  </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 min-w-8 flex-1 mx-2 sm:min-w-12 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'service' && renderServiceStep()}
        {currentStep === 'datetime' && renderDateTimeStep()}
        {currentStep === 'details' && renderDetailsStep()}
        {currentStep === 'confirm' && renderConfirmStep()}
      </AnimatePresence>

      {/* Navigation */}
      {currentStep === 'datetime' && (
        <div className="flex justify-start mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-secondary/50 hover:bg-secondary/70 text-white rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
            {t.booking.back}
          </button>
        </div>
      )}
    </div>
  )
}