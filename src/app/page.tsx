'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Star, Zap, Shield, MapPin, Phone, Clock, Scissors } from 'lucide-react'
import Link from 'next/link'

// Lazy load des composants lourds
const Hero = dynamic(() => import('@/components/Hero'), { ssr: true })
const ServiceCarousel = dynamic(() => import('@/components/ServiceCarousel'), { ssr: false })
const ClientPortfolio = dynamic(() => import('@/components/ClientPortfolio'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false })
const OpeningHours = dynamic(() => import('@/components/OpeningHours'), { ssr: false })

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <>
      <Hero />

      {/* SEO Content Section - Invisible mais indexé */}
      <section className="sr-only">
        <h1>Tarek Salon — Maison de coiffure & barbershop signature à Namur</h1>
        <p>
          Rendez-vous dans notre salon signature à Namur pour des coupes modernes, des dégradés précis et une barbe entretenue avec soin.
          Nous travaillons des looks sur-mesure avec des produits professionnels et un accueil chaleureux, du premier clic à votre sortie du fauteuil.
          Réservation en ligne 24h/24.
        </p>
      </section>

      {/* Local Info Banner - SEO + UX */}
      <section className="py-6 bg-accent/10 border-y border-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-sm md:text-base">
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-5 h-5 text-accent" />
              <span>Passage de la Gare 5, Namur</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-5 h-5 text-accent" />
              <a href="tel:+32465632205" className="hover:text-accent transition-colors">
                +32 465 63 22 05
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-5 h-5 text-accent" />
              <span>Lun-Sam: 9h-18h</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Scissors className="w-5 h-5 text-accent" />
              <span>Coupe • Dégradé • Barbe soignée</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Carousel */}
      <section id="services">
        <ServiceCarousel />
      </section>

      {/* Client Portfolio */}
      <ClientPortfolio />

      {/* Features Section - SEO optimisé */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pourquoi Choisir <span className="text-accent">Tarek Salon</span> à Namur ?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Une équipe passionnée, des looks taillés pour vous et une ambiance chaleureuse.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Star, title: 'Signature sur-mesure', description: 'Looks personnalisés, conseils dédiés et finitions couture.' },
              { icon: Zap, title: 'Expérience fluide', description: 'Rendez-vous rapides, gestes précis, zéro minute perdue.' },
              { icon: Shield, title: 'Soins haute qualité', description: 'Produits pros, rituels barbe & cheveux pensés pour durer.' },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="text-center p-8 rounded-xl bg-primary border border-primary hover:border-accent transition-colors"
                >
                  <Icon className="text-accent text-4xl mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Opening Hours Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Horaires <span className="text-accent">d&apos;Ouverture</span>
          </h2>
          <p className="text-gray-400 text-lg">Votre coiffeur à Namur vous accueille du lundi au samedi</p>
        </motion.div>

        <OpeningHours />
      </section>

      {/* Location Section with Maps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trouvez-Nous à <span className="text-accent">Namur</span>
            </h2>
            <p className="text-gray-400 text-lg">Passage de la Gare 5, au cœur de Namur — parking et transports à proximité</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl overflow-hidden shadow-2xl border border-primary/50 hover:border-accent/50 transition-colors mb-12"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2543.0826844788233!2d4.424165!3d50.468686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c23c1d0c0c0c0d%3A0x0!2zVGFyZWsgU2Fsb24!5e0!3m2!1sfr!2sbe!4v1702828800000"
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 rounded-xl bg-primary border border-primary/50 hover:border-accent/50 transition-colors text-center">
              <MapPin className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Adresse</h3>
              <p className="text-gray-400">Passage de la Gare 5<br />5000 Namur, Belgique</p>
            </div>
            <div className="p-6 rounded-xl bg-primary border border-primary/50 hover:border-accent/50 transition-colors text-center">
              <Phone className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Téléphone</h3>
              <a href="tel:+32465632205" className="text-gray-400 hover:text-accent transition-colors">
                +32 465 63 22 05
              </a>
            </div>
            <div className="p-6 rounded-xl bg-primary border border-primary/50 hover:border-accent/50 transition-colors text-center">
              <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Horaires</h3>
              <p className="text-gray-400">Lun-Sam: 9h-18h<br />Dimanche: Fermé</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-accent/20 to-accent/10 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Réservez votre créneau à Namur
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Choisissez l&apos;heure qui vous arrange, on s&apos;occupe du reste avec un accueil chaleureux et des finitions impeccables.
          </p>

          <Link href="/booking">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-accent text-primary font-bold rounded-lg hover:bg-accent/80 transition-colors text-lg"
            >
              Réserver un Rendez-vous
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </>
  )
}
