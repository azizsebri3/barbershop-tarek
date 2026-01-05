'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'

export default function AdminLogin() {
  const router = useRouter()
  const { isAdmin, loading } = useAdminAuth()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (isAdmin) {
        setShowSuccess(true)
        // Naviguer après 2 secondes
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      }
    }
  }, [isAdmin, loading, router])

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary border border-accent/30 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              {/* Animated Circle Background */}
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-3xl border-2 border-accent"
                />
              </div>

              {/* Content */}
              <div className="relative space-y-6 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                  className="flex justify-center"
                >
                  <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50">
                    <CheckCircle size={40} className="text-white" />
                  </div>
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Accès Autorisé !
                  </h2>
                  <p className="text-gray-300 text-lg">
                    Bienvenue dans le panel d&apos;administration
                  </p>
                </motion.div>

                {/* Loading Bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <div className="w-full h-1 bg-secondary/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                      className="h-full bg-gradient-to-r from-accent via-blue-400 to-accent"
                    />
                  </div>
                  <p className="text-xs text-gray-400">Redirection en cours...</p>
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex justify-center gap-2 pt-4"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.2,
                        repeat: Infinity
                      }}
                      className="w-2 h-2 bg-accent rounded-full"
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
