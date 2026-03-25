import { Metadata } from 'next'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import heavy component with SSR disabled
const BookingPageContent = dynamic(() => import('@/components/BookingPageContent'), {
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
    </div>
  ),
  ssr: true,
})

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
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  )
}
