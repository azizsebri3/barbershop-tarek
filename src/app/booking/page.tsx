import { Metadata } from 'next'
import BookingPageContent from '@/components/BookingPageContent'

export const metadata: Metadata = {
  title: 'Réserver un Rendez-vous | Style & Coupe',
  description: 'Réservez votre coupe, coloration ou rasage en ligne. Salon de coiffure en Belgique.',
}

export default function BookingPage() {
  return <BookingPageContent />
}
