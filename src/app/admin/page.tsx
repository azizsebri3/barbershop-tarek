'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')

  // Vérifier si déjà connecté
  useEffect(() => {
    const token = document.cookie.includes('admin_token=')
    if (token) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Log pour debug
        console.log('✅ Login réussi:', data)
        console.log('🍪 Cookies:', document.cookie)
        
        // Petit délai pour laisser le cookie se définir
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Redirection forcée
        window.location.href = '/admin/dashboard'
      } else {
        setError(data.error || 'Identifiants incorrects')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingEmail(true)
    setEmailMessage('')

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailMessage('✅ If this email exists, a reset link has been sent')
        setForgotEmail('')
      } else {
        setEmailMessage(`❌ ${data.error || 'Error sending reset email'}`)
      }
    } catch {
      setEmailMessage('❌ Error sending reset email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Effet de particules dorées */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-accent/5 rounded-full blur-3xl top-10 -left-48"></div>
        <div className="absolute w-96 h-96 bg-accent/5 rounded-full blur-3xl bottom-10 -right-48"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-yellow-500 rounded-2xl mb-4 shadow-2xl shadow-accent/20">
            <Sparkles className="text-black" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
          <p className="text-gray-400">Accès réservé aux administrateurs</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom d&apos;utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-gray-500" size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Champ Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-500" size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-400 mt-0.5" size={20} />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-500 hover:to-accent text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-accent hover:text-yellow-500 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
              <button
                onClick={() => {
                  setShowForgotModal(false)
                  setEmailMessage('')
                  setForgotEmail('')
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Lock className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Password Reset</h3>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    required
                    autoFocus
                  />
                </div>

                {emailMessage && (
                  <div className={`rounded-xl p-4 text-sm ${
                    emailMessage.startsWith('✅') 
                      ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
                      : 'bg-red-500/10 border border-red-500/30 text-red-300'
                  }`}>
                    {emailMessage}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false)
                      setEmailMessage('')
                      setForgotEmail('')
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="flex-1 bg-accent hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingEmail ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Tarek Salon © 2026 - Tous droits réservés
        </p>
      </div>
    </div>
  )
}
