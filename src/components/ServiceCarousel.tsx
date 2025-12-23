'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import ServiceCard from './ServiceCard'
import { useServices } from '@/lib/useServices'
import { motion } from 'framer-motion'

export default function ServiceCarousel() {
  const { services, loading } = useServices()

  if (loading) {
    return (
      <section className="py-12 sm:py-20 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="text-gray-400 mt-4">Chargement des services...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-20 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            Nos Services <span className="text-accent">Premium</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-base md:text-lg max-w-2xl mx-auto">
            Découvrez notre gamme complète de services de coiffure pour hommes et femmes
          </p>
        </motion.div>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          navigation
          pagination={{ clickable: true, dynamicBullets: true }}
          breakpoints={{
            640: {
              slidesPerView: 1.2,
              spaceBetween: 12,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          className="!pb-16 sm:!pb-12"
        >
          {services.map((service) => (
            <SwiperSlide key={service.id}>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ServiceCard
                  title={service.name}
                  description={service.description}
                  price={service.price}
                  duration={service.duration}
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx>{`
        :global(.swiper-button-next),
        :global(.swiper-button-prev) {
          color: #d4af37;
          background: rgba(212, 175, 55, 0.15);
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          top: 50%;
          transform: translateY(-50%);
        }

        @media (max-width: 640px) {
          :global(.swiper-button-next),
          :global(.swiper-button-prev) {
            width: 36px;
            height: 36px;
            opacity: 0.7;
          }
        }

        :global(.swiper-button-next:hover),
        :global(.swiper-button-prev:hover) {
          background: rgba(212, 175, 55, 0.25);
        }

        :global(.swiper-button-next::after),
        :global(.swiper-button-prev::after) {
          font-size: 18px;
        }

        :global(.swiper-pagination) {
          padding: 12px 0 0 0;
        }

        :global(.swiper-pagination-bullet) {
          background: #d4af37;
          opacity: 0.3;
          width: 8px;
          height: 8px;
        }

        :global(.swiper-pagination-bullet-active) {
          background: #d4af37;
          opacity: 1;
          width: 24px;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          :global(.swiper-pagination-bullet) {
            width: 6px;
            height: 6px;
          }

          :global(.swiper-pagination-bullet-active) {
            width: 18px;
          }
        }
      `}</style>
    </section>
  )
}
