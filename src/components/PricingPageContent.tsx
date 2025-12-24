'use client'

import { motion } from 'framer-motion'
import ServiceCard from '@/components/ServiceCard'
import { useServices } from '@/lib/useServices'
import { Check, Sparkles, HelpCircle, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import ClientPortfolio from '@/components/ClientPortfolio'
import Link from 'next/link'

export default function PricingPageContent() {
  const { t } = useLanguage()
  const { services, loading } = useServices()
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  if (loading) {
    return (
      <>
        <ClientPortfolio />
        <div className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
            </div>
            <p className="text-gray-400 mt-4">Chargement des tarifs...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* SEO Hidden Content */}
      <div className="sr-only">
        <h1>Tarifs Coiffeur Namur - Prix Tarek Salon Barbershop</h1>
        <p>
          Découvrez nos tarifs compétitifs pour tous nos services de coiffure à Namur.
          Coupe homme, dégradé, barbe, coloration. Meilleur rapport qualité-prix de Namur, Belgique.
        </p>
      </div>

      <ClientPortfolio />

      {/* Pricing Header */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          <motion.div 
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]" 
          />
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" 
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-white/80">Tarifs Transparents</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            {t.pricing.title}{' '}
            <span className="bg-gradient-to-r from-accent via-yellow-400 to-accent bg-clip-text text-transparent">
              {t.pricing.titleAccent}
            </span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {t.pricing.description} - Coiffeur à Namur, Belgique
          </p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {services.map((service) => (
            <motion.div key={service.id} variants={itemVariants}>
              <ServiceCard
                title={service.name}
                description={service.description}
                price={service.price}
                duration={service.duration}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 rounded-2xl p-8 sm:p-12 border border-accent/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Prêt à transformer votre look ?</h3>
              <p className="text-gray-400">Réservez votre rendez-vous dès maintenant</p>
            </div>
            <Link href="/booking">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-yellow-500 text-black font-bold rounded-xl shadow-lg shadow-accent/20"
              >
                Réserver maintenant
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section - SEO optimisé pour Namur */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto">
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
              <HelpCircle className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-white/80">FAQ</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Questions{' '}
              <span className="bg-gradient-to-r from-accent via-yellow-400 to-accent bg-clip-text text-transparent">
                Fréquentes
              </span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">Tout ce que vous devez savoir sur notre salon de coiffure à Namur</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              {
                question: 'Où se trouve Tarek Salon à Namur ?',
                answer: 'Passage de la Gare 5, en plein centre. Bus, train et parking sont à deux pas, venez quand ça vous arrange.',
              },
              {
                question: 'Puis-je modifier ma réservation ?',
                answer: "Bien sûr. Prévenez-nous 24h à l'avance et on ajuste votre créneau en douceur.",
              },
              {
                question: 'Offrez-vous des réductions pour les forfaits ?',
                answer: 'Oui, on a des tarifs doux pour les forfaits barbe + coupe et pour vos visites régulières.',
              },
              {
                question: 'Quel est le meilleur coiffeur à Namur ?',
                answer: 'Nos clients nous classent parmi les meilleures adresses de Namur (4.9/5). On vous accueille comme un habitué.',
              },
              {
                question: 'Acceptez-vous les paiements par carte ?',
                answer: 'Carte, Bancontact ou cash : payez comme vous préférez.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="group bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-accent/40 transition-all duration-300"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors">{faq.question}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Comparaison des{' '}
            <span className="bg-gradient-to-r from-accent via-yellow-400 to-accent bg-clip-text text-transparent">
              Services
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-sm"
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-5 px-6 font-bold text-white bg-white/5">Caractéristiques</th>
                {services.map(service => (
                  <th key={service.id} className="py-5 px-6 font-bold text-accent text-center bg-white/5">{service.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Durée', values: services.map(s => `${s.duration} min`) },
                { label: 'Support Client', values: services.map(() => '✓') },
                { label: 'Rapport Détaillé', values: services.map((_, i) => i >= 1 ? '✓' : '') },
                { label: 'Suivi Personnalisé', values: services.map((_, i) => i === 3 ? '✓' : '') },
              ].map((row, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-5 px-6 font-medium text-gray-300">{row.label}</td>
                  {row.values.map((value, idx) => (
                    <td key={idx} className="py-5 px-6 text-center text-gray-400">
                      {value ? (value === '✓' ? <Check className="text-accent mx-auto" size={20} /> : <span className="text-white font-medium">{value}</span>) : <span className="text-gray-600">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>
    </>
  )
}
