'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Smartphone } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { isAdmin, login, loading } = useAdminAuth()

  // Vérifier si déjà connecté
  useEffect(() => {
    if (!loading) {
      if (isAdmin) {
        router.push('/admin/dashboard')
      } else {
        setIsLoading(false)
      }
    }
  }, [isAdmin, loading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password.trim()) {
      setError('Veuillez entrer un mot de passe')
      return
    }

    setIsLoading(true)
    try {
      const result = await login(password)
      if (result.success) {
        toast.success('Connexion admin réussie')
        router.push('/admin/dashboard')
      } else {
        setError(result.error || 'Mot de passe incorrect')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
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

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-primary text-accent focus:ring-accent focus:ring-offset-0"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-300 flex items-center gap-2">
              <Smartphone size={16} className="text-accent" />
              Rester connecté 30 jours (recommandé pour PWA)
            </label>
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

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400 flex items-start gap-2">
            <Smartphone size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              <strong>Astuce PWA :</strong> Cochez &quot;Rester connecté&quot; pour recevoir les notifications push sans vous reconnecter à chaque ouverture de l&apos;app.
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}