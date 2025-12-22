import { Metadata } from 'next'
import BookingForm from '@/components/BookingForm'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: 'Réserver un Rendez-vous | Style & Coupe',
  description: 'Réservez votre coupe, coloration ou rasage en ligne. Salon de coiffure en Belgique.',
}

export default function BookingPage() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Réservez Votre <span className="text-accent">Rendez-vous</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Choisissez votre service et votre date. Une confirmation sera envoyée à votre email.
          </p>
        </div>

        <BookingForm />
      </div>
    </div>
  )
}
