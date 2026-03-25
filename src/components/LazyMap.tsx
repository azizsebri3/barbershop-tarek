'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

export default function LazyMap() {
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '100px' }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trouvez-Nous à <span className="text-accent">Namur</span>
          </h2>
          <p className="text-gray-400 text-lg">Passage de la Gare 5, au cœur de Namur — parking et transports à proximité</p>
        </div>

        <div 
          ref={containerRef}
          className="rounded-2xl overflow-hidden shadow-2xl border border-primary/50 hover:border-accent/50 transition-colors mb-12 animate-fadeInUp" 
          style={{ animationDelay: '100ms' }}
        >
          {isLoaded ? (
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5125.421648937018!2d4.860792076398837!3d50.46784768611116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c199676d2eb1d5%3A0x560fefdeeb40e96e!2sGolden%20Salon!5e1!3m2!1sen!2sbe!4v1767402185853!5m2!1sen!2sbe"
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          ) : (
            <div className="w-full h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-accent mx-auto mb-3 animate-pulse" />
                <p className="text-gray-400">Chargement de la carte...</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="p-6 rounded-xl bg-primary border border-primary/50 hover:border-accent/50 transition-colors text-center">
            <MapPin className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Adresse</h3>
            <p className="text-gray-400">Passage de la Gare 5<br />5000 Namur, Belgique</p>
          </div>

          <div className="p-6 rounded-xl bg-primary border border-primary/50 hover:border-accent/50 transition-colors text-center">
            <div className="w-8 h-8 text-accent mx-auto mb-3">📞</div>
            <h3 className="text-lg font-bold text-white mb-2">Téléphone</h3>
            <p className="text-gray-400">+32 (0) 81 XX XX XX</p>
          </div>

          <div className="p-6 rounded-xl bg-primary border border-primary/50 hover:border-accent/50 transition-colors text-center">
            <div className="w-8 h-8 text-accent mx-auto mb-3">📧</div>
            <h3 className="text-lg font-bold text-white mb-2">Email</h3>
            <p className="text-gray-400">contact@tareksalon.be</p>
          </div>
        </div>
      </div>
    </section>
  )
}
