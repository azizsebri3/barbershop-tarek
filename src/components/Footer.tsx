'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Globe, ArrowRight, Sparkles, Clock, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    services: [
      { label: 'Coupe homme', href: '/pricing' },
      { label: 'Dégradé', href: '/pricing' },
      { label: 'Taille de barbe', href: '/pricing' },
      { label: 'Coupe enfant', href: '/pricing' },
    ],
    zones: [
      'Namur Centre',
    ],
    contact: {
      address: 'Passage de la Gare 5, 5000 Namur',
      phone: '+32 465 63 22 05',
      email: 'contact@tareksalon.be',
      website: 'tareksalon.be',
    }
  }

  return (
    <footer className="relative bg-black border-t border-white/10 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Main Footer Content */}
      <div className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            
            {/* Brand Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Link href="/" className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-yellow-500 rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-accent/20">
                  ✂️
                </div>
                <span className="text-xl font-bold text-white">Tarek Salon</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Votre coiffeur et barbershop de confiance à Namur, Belgique. 
                Spécialisés dans les coupes hommes, dégradés modernes et entretien de barbe.
              </p>
              <div className="flex items-center gap-3">
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-accent hover:border-accent/50 transition-all duration-300"
                >
                  <Instagram size={18} />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-accent hover:border-accent/50 transition-all duration-300"
                >
                  <Facebook size={18} />
                </motion.a>
              </div>
            </motion.div>

            {/* Services Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-accent" />
                Nos Services
              </h3>
              <ul className="space-y-3">
                {footerLinks.services.map((service, index) => (
                  <li key={index}>
                    <Link
                      href={service.href}
                      className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      <ArrowRight size={14} className="text-accent opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      <span className="text-sm">{service.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Zone de Service Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-accent" />
                Zone de Service
              </h3>
              <ul className="space-y-3">
                {footerLinks.zones.map((zone, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {zone}
                  </li>
                ))}
              </ul>
              
              {/* Opening Hours Preview */}
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white font-medium mb-2">
                  <Clock size={16} className="text-accent" />
                  <span className="text-sm">Horaires</span>
                </div>
                <p className="text-gray-400 text-xs">Lun-Sam: 9h00 - 19h00</p>
                <p className="text-gray-400 text-xs">Dimanche: Fermé</p>
              </div>
            </motion.div>

            {/* Contact Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Phone size={18} className="text-accent" />
                Contact
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-sm">{footerLinks.contact.address}</span>
                </li>
                <li>
                  <a href={`tel:${footerLinks.contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-gray-400 hover:text-accent transition-colors duration-300">
                    <Phone size={18} className="text-accent flex-shrink-0" />
                    <span className="text-sm">{footerLinks.contact.phone}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${footerLinks.contact.email}`} className="flex items-center gap-3 text-gray-400 hover:text-accent transition-colors duration-300">
                    <Mail size={18} className="text-accent flex-shrink-0" />
                    <span className="text-sm">{footerLinks.contact.email}</span>
                  </a>
                </li>
                <li>
                  <a href={`https://${footerLinks.contact.website}`} className="flex items-center gap-3 text-gray-400 hover:text-accent transition-colors duration-300">
                    <Globe size={18} className="text-accent flex-shrink-0" />
                    <span className="text-sm">{footerLinks.contact.website}</span>
                  </a>
                </li>
              </ul>
              
              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6"
              >
                <Link 
                  href="/booking" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-yellow-500 text-black font-bold rounded-xl transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
                >
                  <Sparkles size={16} />
                  Réserver
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            {/* SEO Keywords */}
            <p className="text-gray-600 text-xs text-center mb-6 max-w-4xl mx-auto">
              Coiffeur Namur • Barbershop Namur • Salon de coiffure Namur • Coiffeur homme Namur • 
              Dégradé Namur • Barbe Namur • Meilleur coiffeur Namur Belgique • Tarek Salon
            </p>
            
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                &copy; {currentYear} Tarek Salon. Tous droits réservés.
              </p>
              <div className="flex items-center gap-6 text-xs text-gray-500">
                <Link href="#" className="hover:text-accent transition-colors">Politique de confidentialité</Link>
                <Link href="#" className="hover:text-accent transition-colors">Conditions d&apos;utilisation</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
