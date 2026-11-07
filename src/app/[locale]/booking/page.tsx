import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BookingPageContent from '@/components/BookingPageContent'

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
    title: isFrench
      ? 'Réserver un rendez-vous | Tarek Salon'
      : 'Book an appointment | Tarek Salon',
    description: isFrench
      ? 'Réservez votre rendez-vous chez Tarek Salon à Namur.'
      : 'Book your appointment at Tarek Salon in Namur.',
    alternates: {
      canonical: `https://tareksalon.be/${locale}/booking`,
      languages: {
        'fr-BE': 'https://tareksalon.be/fr/booking',
        'en-BE': 'https://tareksalon.be/en/booking',
      },
    },
    openGraph: {
      title: isFrench ? 'Réserver | Tarek Salon' : 'Book | Tarek Salon',
      description: isFrench
        ? 'Choisissez votre prestation et votre créneau chez Tarek Salon à Namur.'
        : 'Choose your service and time at Tarek Salon in Namur.',
      url: `https://tareksalon.be/${locale}/booking`,
      images: ['/hero-bg1.jpeg'],
    },
  }
}

export default async function LocalizedBookingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound()
  }

  return <BookingPageContent />
}
