'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Sparkles } from 'lucide-react'

export default function AcceptInvitation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [invitationData, setInvitationData] = useState<{ email: string } | null>(null)

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      setError('Token d&apos;invitation manquant')
      return
    }

    // Récupérer les infos de l'invitation
    fetch(`/api/admin/invitation?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setInvitationData(data)
        }
      })
      .catch(() => {
        setError('Erreur lors de la vérification de l&apos;invitation')
      })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (username.length < 3) {
      setError('Le nom d&apos;utilisateur doit contenir au moins 3 caractères')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      } else {
        setError(data.error || 'Erreur lors de l&apos;activation du compte')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Compte activé !</h2>
            <p className="text-gray-400">Redirection vers la page de connexion...</p>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-white mb-2">Activation du compte</h1>
          <p className="text-gray-400">Créez votre nom d&apos;utilisateur et mot de passe</p>
          {invitationData && (
            <p className="text-accent mt-2">{invitationData.email}</p>
          )}
        </div>

        {/* Formulaire d'activation */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {error && !invitationData && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {invitationData && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}

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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    placeholder="Choisissez un nom d'utilisateur"
                    required
                    minLength={3}
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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    placeholder="Créez un mot de passe"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>

              {/* Champ Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-500" size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                </div>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-accent to-yellow-500 text-black font-semibold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-accent/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Activation...' : 'Activer mon compte'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
