'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { track } from '@vercel/analytics'

export default function LazyMap() {
  const { t } = useLanguage()
  const googleProfileUrl = 'https://maps.app.goo.gl/YePu1ryxNkNZUgvZ8'
  const googleReviewUrl = 'https://g.page/r/CQIG5Mt4inBSEBM/review'
  const whatsappUrl = `https://wa.me/32465632205?text=${encodeURIComponent(
    t.location.whatsapp === 'Écrire sur WhatsApp'
      ? 'Bonjour, je voudrais prendre rendez-vous chez Tarek Salon.'
      : 'Hello, I would like to book an appointment at Tarek Salon.'
  )}`
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.location.title} <span className="text-accent">{t.location.titleAccent}</span>
          </h2>
          <p className="text-gray-400 text-lg">{t.location.description}</p>
        </div>

        <div 
          className="rounded-2xl overflow-hidden shadow-2xl border border-primary/50 hover:border-accent/50 transition-colors mb-12 animate-fadeInUp" 
          style={{ animationDelay: '100ms' }}
        >
          {isLoaded ? (
            <iframe
              src="https://www.google.com/maps?q=Rue+Rogier+7A%2C+5000+Namur&output=embed"
              title={t.location.title + ' ' + t.location.titleAccent}
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          ) : (
            <div className="relative flex h-[500px] w-full items-center justify-center bg-slate-900">
              <Image
                src="/hero-bg1.jpeg"
                alt="TODO(contenu): photo de façade du salon"
                fill
                sizes="100vw"
                className="object-cover opacity-35"
              />
              <div className="text-center">
                <MapPin className="w-12 h-12 text-accent mx-auto mb-3 animate-pulse" />
                <p className="mb-4 text-gray-400">{t.location.mapLoading}</p>
                <button
                  type="button"
                  onClick={() => setIsLoaded(true)}
                  className="min-h-11 rounded-full bg-accent px-5 py-3 font-semibold text-primary hover:bg-accent-hover"
                >
                  {t.location.mapButton}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-5 animate-fadeInUp sm:grid-cols-2 lg:grid-cols-3" style={{ animationDelay: '200ms' }}>
          <div className="min-w-0 rounded-xl bg-primary p-6 text-center border border-primary/50 hover:border-accent/50 transition-colors">
            <MapPin className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Adresse</h3>
            <p className="break-words text-gray-400">{t.location.addressValue}</p>
            <div className="mt-5 flex flex-col items-center gap-2">
              <a
                href={googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-xs rounded-lg border border-accent/40 bg-accent/5 px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-primary"
              >
                {t.location.mapButton}
              </a>
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-xs rounded-lg border border-accent/40 bg-accent/5 px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-primary"
              >
                {t.location.reviewGoogle}
              </a>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Rue+Rogier+7A%2C+5000+Namur"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-xs rounded-lg border border-accent/40 bg-accent/5 px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-primary"
              >
                {t.location.directions}
              </a>
            </div>
          </div>

          <div className="min-w-0 rounded-xl bg-primary p-6 text-center border border-primary/50 hover:border-accent/50 transition-colors">
            <Phone aria-hidden="true" className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">{t.location.phone}</h3>
            <div className="mt-1 flex flex-col items-center gap-3">
              <a href="tel:+32465632205" onClick={() => track('phone_click', { source: 'contact-card' })} className="text-gray-400 hover:text-accent transition-colors">+32 465 63 22 05</a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-xs rounded-lg bg-[#25D366]/15 px-3 py-2 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/25"
              >
                {t.location.whatsapp}
              </a>
            </div>
          </div>

          <div className="min-w-0 rounded-xl bg-primary p-6 text-center border border-primary/50 hover:border-accent/50 transition-colors sm:col-span-2 lg:col-span-1">
            <Mail aria-hidden="true" className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">{t.location.email}</h3>
            <a href="mailto:contact@tareksalon.be" className="break-all text-gray-400 hover:text-accent transition-colors">contact@tareksalon.be</a>
          </div>
        </div>
      </div>
    </section>
  )
}
