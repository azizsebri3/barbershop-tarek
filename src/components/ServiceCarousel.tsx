'use client'

import { memo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import ServiceCard from './ServiceCard'
import { useServices } from '@/lib/useServicesCached'
import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'

const ServiceCarousel = memo(function ServiceCarousel() {
  const { services, loading } = useServices()
  const { t } = useLanguage()

  if (loading) {
    return (
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
            </div>
            <p className="text-gray-400 mt-4">{t.services.loading}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="services" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6"
          >
            <span className="w-10 h-px bg-accent" />
            <span className="text-sm font-medium text-white/80">{t.services.badge}</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            {t.services.title}{' '}
            <span className="text-accent">
              {t.services.titleAccent}
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t.services.description}
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
              640: {
                slidesPerView: 1.2,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 32,
              },
            }}
            className="!pb-16 sm:!pb-14"
          >
            {services.map((service, index) => (
              <SwiperSlide key={service.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ServiceCard
                    id={service.id}
                    translationKey={service.translationKey}
                    title={service.name}
                    description={service.description}
                    nameEn={service.nameEn}
                    descriptionEn={service.descriptionEn}
                    price={service.price}
                    duration={service.duration}
                  />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>

      <style jsx>{`
        :global(.swiper-button-next),
        :global(.swiper-button-prev) {
          color: #b87333;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          width: 48px;
          height: 48px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          top: 50%;
          transform: translateY(-50%);
        }

        @media (max-width: 640px) {
          :global(.swiper-button-next),
          :global(.swiper-button-prev) {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }
        }

        :global(.swiper-button-next:hover),
        :global(.swiper-button-prev:hover) {
          background: rgba(215, 25, 32, 0.1);
          border-color: rgba(215, 25, 32, 0.4);
          transform: translateY(-50%) scale(1.05);
        }

        :global(.swiper-button-next::after),
        :global(.swiper-button-prev::after) {
          font-size: 16px;
          font-weight: bold;
        }

        :global(.swiper-pagination) {
          padding: 16px 0 0 0;
        }

        :global(.swiper-pagination-bullet) {
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }

        :global(.swiper-pagination-bullet-active) {
          background: #b87333;
          width: 32px;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          :global(.swiper-pagination-bullet) {
            width: 6px;
            height: 6px;
          }

          :global(.swiper-pagination-bullet-active) {
            width: 24px;
          }
        }
      `}</style>
    </section>
  )
})

export default ServiceCarousel
