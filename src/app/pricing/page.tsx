import { Metadata } from 'next'
import PricingPageContent from '@/components/PricingPageContent'

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
  return <PricingPageContent />
}
