'use client'

import { motion } from 'framer-motion'
import BookingForm from '@/components/BookingForm'
import { useLanguage } from '@/lib/language-context'

export default function BookingPageContent() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.bookingPage.title} <span className="text-accent">{t.bookingPage.titleAccent}</span>
          </h1>
          <p className="text-gray-400 text-lg">
            {t.bookingPage.description}
          </p>
        </motion.div>

        <BookingForm />
      </div>
    </div>
  )
}