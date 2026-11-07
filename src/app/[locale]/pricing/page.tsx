import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PricingPageContent from '@/components/PricingPageContent'

const locales = ['fr', 'en', 'nl'] as const

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFrench = locale === 'fr'

  return {
    title: isFrench ? 'Tarifs | Tarek Salon' : 'Prices | Tarek Salon',
    description: isFrench
      ? 'Découvrez les prestations et tarifs de Tarek Salon à Namur.'
      : 'Discover Tarek Salon services and prices in Namur.',
    metadataBase: new URL('https://tareksalon.be'),
    alternates: {
      canonical: `https://tareksalon.be/${locale}/pricing`,
      languages: {
        'fr-BE': 'https://tareksalon.be/fr/pricing',
        'en-BE': 'https://tareksalon.be/en/pricing',
      },
    },
    openGraph: {
      title: isFrench ? 'Tarifs | Tarek Salon' : 'Prices | Tarek Salon',
      description: isFrench
        ? 'Prestations et tarifs de Tarek Salon à Namur.'
        : 'Tarek Salon services and prices in Namur.',
      url: `https://tareksalon.be/${locale}/pricing`,
      images: ['/hero-bg1.jpeg'],
    },
  }
}

export default async function LocalizedPricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound()
  }

  return <PricingPageContent />
}
