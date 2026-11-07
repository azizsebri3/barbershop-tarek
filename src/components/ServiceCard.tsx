'use client'

import { memo } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Clock, ArrowRight } from 'lucide-react'
import BookingLink from '@/components/BookingLink'

interface ServiceCardProps {
  id?: string
  translationKey?: string
  title: string
  description: string
  nameEn?: string
  descriptionEn?: string
  price: number
  duration: number
  icon?: React.ReactNode
}

const ServiceCard = memo(function ServiceCard({ id, translationKey, title, description, nameEn, descriptionEn, price, duration, icon }: ServiceCardProps) {
  const { t, locale } = useLanguage()
  const normalizedTitle = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const serviceId = translationKey || (['coupe homme', "men's haircut", 'herenkapsel'].includes(normalizedTitle) ? 'coupe-homme'
    : ['barbe + coupe', 'haircut + beard', 'kapsel + baard'].includes(normalizedTitle) ? 'barbe-coupe'
    : ['barbe', 'taille de barbe', 'beard trim', 'baard trimmen'].includes(normalizedTitle) ? 'barbe-seulement'
    : ['coupe enfant', "children's haircut", 'kinderkapsel'].includes(normalizedTitle) ? 'coupe-enfant'
    : ['coupe senior', 'senior haircut', 'seniorenkapsel'].includes(normalizedTitle) ? 'coupe-senior'
    : id && t.services.serviceCatalog[id as keyof typeof t.services.serviceCatalog] ? id : '')
  const localizedService = serviceId ? t.services.serviceCatalog[serviceId as keyof typeof t.services.serviceCatalog] : undefined
  const displayTitle = localizedService?.name || (locale === 'en' ? nameEn || title : title)
  const displayDescription = localizedService?.description || (locale === 'en' ? descriptionEn || description : description)

  return (
    <div
      className="group relative bg-white/[0.03] rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-accent/50 transition-all duration-500 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-accent/10 overflow-hidden animate-fadeInUp hover:scale-105 hover:-translate-y-2"
    >
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        {icon && (
          <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 text-accent text-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            {icon}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-bone mb-3 group-hover:text-accent transition-colors duration-300">
          {displayTitle}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed line-clamp-2">
          {displayDescription}
        </p>

        {/* Duration & Price */}
        <div className="flex items-center justify-between mb-6 py-4 px-4 -mx-4 bg-white/5 rounded-xl border-y border-white/5">
        <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={16} className="text-accent" />
            <span className="text-sm font-medium">{duration} {t.services.durationUnit}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{t.services.from}</p>
            <p className="text-2xl sm:text-3xl font-bold text-accent">
              {price}€
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <BookingLink
          fallbackHref={`/${locale}/booking?service=${encodeURIComponent(displayTitle)}`}
          className="group/btn w-full relative inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 bg-accent text-ink font-bold rounded-full overflow-hidden transition-all duration-300 shadow-lg shadow-accent/20 hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30 hover:scale-105 active:scale-98"
        >
          <span>{t.services.reserve}</span>
          <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
        </BookingLink>
      </div>
    </div>
  )
})

export default ServiceCard
