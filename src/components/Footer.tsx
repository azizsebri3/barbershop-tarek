'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary/30 border-t border-secondary/50 mt-20">
      {/* SEO Footer Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* À propos */}
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">✂️ Tarek Salon Namur</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Votre coiffeur et barbershop de confiance à Namur, Belgique. 
                Spécialisés dans les coupes hommes, dégradés modernes, entretien de barbe 
                et soins capillaires professionnels. Plus de 10 ans d&apos;expérience au service 
                de la clientèle namuroise.
              </p>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">Nos Services</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>✂️ Coupe homme à Namur</li>
                <li>✂️ Dégradé américain</li>
                <li>✂️ Taille de barbe</li>
                <li>✂️ Coloration</li>
                <li>✂️ Soins capillaires</li>
                <li>✂️ Coupe enfant Namur</li>
              </ul>
            </div>

            {/* Zone de service */}
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">Zone de Service</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>📍 Namur Centre</li>
                <li>📍 Jambes</li>
                <li>📍 Salzinnes</li>
                <li>📍 Saint-Servais</li>
                <li>📍 Bouge</li>
                <li>📍 Province de Namur</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xl font-bold text-accent mb-4">Contact</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>📍 Passage de la Gare 5, 5000 Namur</li>
                <li>📞 <a href="tel:+32465632205" className="hover:text-accent transition-colors">+32 465 63 22 05</a></li>
                <li>📧 <a href="mailto:contact@tareksalon.be" className="hover:text-accent transition-colors">contact@tareksalon.be</a></li>
                <li>🌐 <a href="https://tareksalon.be" className="hover:text-accent transition-colors">tareksalon.be</a></li>
              </ul>
              <div className="mt-4">
                <Link href="/booking" className="inline-block px-4 py-2 bg-accent text-primary font-bold rounded-lg hover:bg-accent/80 transition-colors text-sm">
                  Réserver
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Keywords cloud for SEO */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 pt-8 border-t border-gray-700"
          >
            <p className="text-gray-500 text-xs text-center mb-6">
              Coiffeur Namur • Barbershop Namur • Salon de coiffure Namur • Coiffeur homme Namur • 
              Dégradé Namur • Barbe Namur • Meilleur coiffeur Namur Belgique • Tarek Salon • 
              Coupe cheveux Namur • Barbier Namur Centre • Coiffeur pas cher Namur
            </p>
            <p className="text-center text-gray-500 text-sm">
              &copy; {currentYear} Tarek Salon. Tous droits réservés.
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
