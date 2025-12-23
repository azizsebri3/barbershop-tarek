'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple password check (in production, use proper authentication)
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

    if (password === adminPassword) {
      localStorage.setItem('adminAuthenticated', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Mot de passe incorrect')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-secondary rounded-xl p-8 max-w-md w-full border border-accent/20"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
            <Lock className="text-accent" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Administration</h1>
          <p className="text-gray-400">Accès réservé aux administrateurs</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe administrateur
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-primary border border-primary rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent pr-12"
                placeholder="Entrez le mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && (
              <p className="text-accent text-sm mt-2">{error}</p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-accent text-primary py-3 rounded-lg font-bold hover:bg-accent/80 transition-colors"
          >
            Se connecter
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Mot de passe par défaut : admin123
          </p>
        </div>
      </motion.div>
    </div>
  )
}