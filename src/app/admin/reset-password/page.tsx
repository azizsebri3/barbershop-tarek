'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Sparkles } from 'lucide-react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setMessage('❌ Invalid reset link')
      setIsSuccess(false)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    // Validation
    if (newPassword.length < 6) {
      setMessage('❌ Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('❌ Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Password reset successfully!')
        setIsSuccess(true)
        
        // Rediriger vers la page de login après 2 secondes
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      } else {
        setMessage(`❌ ${data.error}`)
        setIsSuccess(false)
      }
    } catch {
      setMessage('❌ Error resetting password')
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
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
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-400">Create a new password for your account</p>
        </div>

        {/* Formulaire */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {!token ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-start gap-3">
              <XCircle className="text-red-400 mt-0.5" size={24} />
              <div>
                <p className="text-red-300 font-semibold mb-2">Invalid Reset Link</p>
                <p className="text-red-300/80 text-sm">This password reset link is invalid or has expired.</p>
                <button
                  onClick={() => router.push('/admin')}
                  className="mt-4 text-accent hover:text-yellow-500 text-sm font-medium transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 flex items-start gap-3">
              <CheckCircle className="text-green-400 mt-0.5" size={24} />
              <div>
                <p className="text-green-300 font-semibold mb-2">Password Reset Successfully!</p>
                <p className="text-green-300/80 text-sm">You will be redirected to the login page...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-500" size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    required
                    minLength={6}
                    autoFocus
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

              {/* Confirmer le mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-500" size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className={`rounded-xl p-4 flex items-start gap-3 ${
                  isSuccess 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  {isSuccess ? (
                    <CheckCircle className="text-green-400 mt-0.5" size={20} />
                  ) : (
                    <XCircle className="text-red-400 mt-0.5" size={20} />
                  )}
                  <p className={`text-sm ${isSuccess ? 'text-green-300' : 'text-red-300'}`}>
                    {message}
                  </p>
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-500 hover:to-accent text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>

              {/* Retour au login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Tarek Salon © 2026 - All rights reserved
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
