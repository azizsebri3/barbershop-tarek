import { Metadata } from 'next'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import heavy component with SSR enabled for SEO
const PricingPageContent = dynamic(() => import('@/components/PricingPageContent'), {
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
    </div>
  ),
  ssr: true,
})

export const metadata: Metadata = {
  title: 'Tarifs & Prix | Coiffeur Namur - Tarek Salon',
  description: 'Découvrez nos tarifs compétitifs chez Tarek Salon à Namur. Coupe homme dès 15€, barbe, dégradé, coloration. Meilleur rapport qualité-prix coiffeur Namur, Belgique.',
  keywords: ['prix coiffeur namur', 'tarif barbershop namur', 'coupe homme prix namur', 'tarek salon tarifs', 'coiffeur pas cher namur'],
  openGraph: {
    title: 'Tarifs Tarek Salon | Coiffeur Barbershop Namur',
    description: 'Nos prix pour coupes, barbes et dégradés à Namur. Tarifs transparents, service premium.',
    url: 'https://tareksalon.be/pricing',
  },
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  )
}
