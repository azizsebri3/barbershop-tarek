'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import { motion } from 'framer-motion'

interface ClientPhoto {
  id: string
  name: string
  service: string
  image: string
}

// Mock data - à remplacer par vos vraies photos
const clientPhotos: ClientPhoto[] = [
  {
    id: '1',
    name: 'Coupe Moderne',
    service: 'Coupe Homme Premium',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23d4af37" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23000000"%3ECoupe 1%3C/text%3E%3C/svg%3E',
  },
  {
    id: '2',
    name: 'Coloration Tendance',
    service: 'Coloration Premium',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%231a1a1a" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23d4af37"%3EColoration 2%3C/text%3E%3C/svg%3E',
  },
  {
    id: '3',
    name: 'Rasage Traditionnel',
    service: 'Rasage & Barbe',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23000000" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23d4af37"%3ERasage 3%3C/text%3E%3C/svg%3E',
  },
  {
    id: '4',
    name: 'Dégradé Parfait',
    service: 'Coupe Homme ',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%231a1a1a" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23d4af37"%3EDégradé 4%3C/text%3E%3C/svg%3E',
  },
  {
    id: '5',
    name: 'Coupe Femme Moderne',
    service: 'Coupe Femme',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23d4af37" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23000000"%3ECoupe Femme 5%3C/text%3E%3C/svg%3E',
  },
  {
    id: '6',
    name: 'Soin Intensif',
    service: 'Soin Cheveux',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23000000" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%23d4af37"%3ESoin 6%3C/text%3E%3C/svg%3E',
  },
]

export default function ClientPortfolio() {
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
            loop={true}
            className="!w-full !pb-8"
          >
            {clientPhotos.map((photo) => (
              <SwiperSlide key={photo.id} className="!w-72 sm:!w-80 !h-80 sm:!h-96">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl group"
                >
                  {/* Image */}
                  <img
                    src={photo.image}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Text Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">{photo.name}</h3>
                    <p className="text-accent text-xs sm:text-sm font-semibold">{photo.service}</p>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx>{`
        :global(.swiper-slide-shadow-l),
        :global(.swiper-slide-shadow-r) {
          background: none;
        }
      `}</style>
    </section>
  )
}
