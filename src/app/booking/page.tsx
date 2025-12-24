import { Metadata } from 'next'
import BookingPageContent from '@/components/BookingPageContent'

export const metadata: Metadata = {
  title: 'Réserver un Rendez-vous | Coiffeur Namur',
  description: 'Réservez votre coupe de cheveux, barbe ou dégradé en ligne chez Tarek Salon à Namur. Réservation 24h/24, meilleur coiffeur barbershop de Namur, Belgique.',
  keywords: ['réservation coiffeur namur', 'rendez-vous barbershop namur', 'réserver coupe namur', 'tarek salon réservation'],
  openGraph: {
    title: 'Réserver chez Tarek Salon | Coiffeur Namur',
    description: 'Réservez votre rendez-vous en ligne chez le meilleur coiffeur de Namur. Service rapide et professionnel.',
    url: 'https://tareksalon.be/booking',
  },
}

export default function BookingPage() {
  return <BookingPageContent />
}
