'use client'

import { MessageCircle } from 'lucide-react'
import BookingLink from '@/components/BookingLink'
import { useLanguage } from '@/lib/language-context'
import { track } from '@vercel/analytics'
import { usePathname } from 'next/navigation'

export default function MobileBottomNav() {
  const { locale, t } = useLanguage()
  const pathname = usePathname()

  if (pathname?.startsWith('/admin') || pathname?.includes('/booking')) {
    return null
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <BookingLink className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-accent-hover">
          {t.nav.booking}
        </BookingLink>
        <a
          href={`https://wa.me/32465632205?text=${encodeURIComponent(
            locale === 'fr'
              ? 'Bonjour, je voudrais prendre rendez-vous chez Tarek Salon.'
              : 'Hello, I would like to book an appointment at Tarek Salon.',
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_click', { source: 'mobile-bar' })}
          aria-label={locale === 'fr' ? 'Contacter Tarek Salon sur WhatsApp' : 'Contact Tarek Salon on WhatsApp'}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform hover:scale-105"
        >
          <MessageCircle aria-hidden="true" size={22} />
        </a>
      </div>
    </nav>
  )
}
