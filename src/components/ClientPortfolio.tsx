'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'

interface Photo {
  id: string
  name: string
  url: string
  createdAt: string
}

export default function ClientPortfolio() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      setPhotos(data.photos || [])
    } catch (error) {
      console.error('❌ Portfolio - Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12 sm:py-20 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        </div>
      </section>
    )
  }

  if (photos.length === 0) {
    return null // Ne rien afficher si pas de photos
  }
  return (
    <section className="py-12 sm:py-20 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-b from-transparent via-secondary/30 to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            Portfolio <span className="text-accent">Clients</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-base md:text-lg max-w-2xl mx-auto">
            Découvrez les magnifiques transformations réalisées pour nos clients satisfaits
          </p>
        </motion.div>

        <div className="relative px-2 sm:px-0">
          <Swiper
            modules={[Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={photos.length > 2}
            className="!w-full !pb-8"
          >
            {photos.map((photo) => (
              <SwiperSlide key={photo.id} className="!w-72 sm:!w-80 !h-80 sm:!h-96">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl group"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPhoto(photo)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedPhoto(photo)
                    }
                  }}
                >
                  {/* Image */}
                  <Image
                    src={photo.url}
                    alt={photo.name}
                    fill
                    sizes="(max-width: 768px) 80vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Text Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Portfolio Tarek Salon</h3>
                    <p className="text-accent text-xs sm:text-sm font-semibold">Coiffure Premium</p>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              aria-label="Fermer l'image"
              className="absolute top-6 right-6 text-white hover:text-accent transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedPhoto(null)
              }}
            >
              <X size={32} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                unoptimized
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        :global(.swiper-slide-shadow-l),
        :global(.swiper-slide-shadow-r) {
          background: none;
        }
      `}</style>
    </section>
  )
}
