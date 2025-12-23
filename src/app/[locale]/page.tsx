import { motion } from 'framer-motion'
import Hero from '@/components/Hero'
import ServiceCarousel from '@/components/ServiceCarousel'
import ClientPortfolio from '@/components/ClientPortfolio'
import Testimonials from '@/components/Testimonials'
import OpeningHours from '@/components/OpeningHours'
import { Star, Zap, Shield } from 'lucide-react'

export default function LocalePage() {
  const features = [
    { icon: Star, title: 'Excellence', desc: 'Service de qualité supérieure' },
    { icon: Zap, title: 'Rapidité', desc: 'Rendez-vous pris en quelques minutes' },
    { icon: Shield, title: 'Confiance', desc: 'Votre satisfaction est garantie' },
  ]

  return (
    <>
      <Hero />
      <section id="services">
        <ServiceCarousel />
      </section>
      <ClientPortfolio />

      <section className="py-20 px-4 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-accent">
            Nos Avantages
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-primary/50 rounded-lg p-6 border border-accent/20"
              >
                <feature.icon className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <OpeningHours />
      </section>

      <Testimonials />
    </>
  )
}
