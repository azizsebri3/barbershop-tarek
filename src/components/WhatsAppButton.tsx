'use client'

import { MessageCircle } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export default function WhatsAppButton() {
  const { locale } = useLanguage()
  const message = locale === 'fr'
    ? 'Bonjour, je voudrais prendre rendez-vous chez Tarek Salon.'
    : 'Hello, I would like to book an appointment at Tarek Salon.'

  return (
    <a
      href={`https://wa.me/32465632205?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={locale === 'fr' ? 'Contacter Tarek Salon sur WhatsApp' : 'Contact Tarek Salon on WhatsApp'}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/30 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary sm:bottom-6 sm:right-6"
    >
      <MessageCircle size={27} strokeWidth={2.2} />
    </a>
  )
}
