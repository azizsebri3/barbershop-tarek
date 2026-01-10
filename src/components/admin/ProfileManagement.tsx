'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Mail, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

interface UserProfile {
  username: string
  email: string
  role: string
  created_at: string
}

export default function ProfileManagement() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile')
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setIsSuccess(false)

    // Validation
    if (newPassword.length < 6) {
      setMessage('New password must contain at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      setMessage('New password must be different from current password')
      return
    }

    setUpdating(true)

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('✅ Password changed successfully')
        setIsSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage(`❌ ${data.error}`)
        setIsSuccess(false)
      }
    } catch (error) {
      setMessage('❌ Error changing password')
      setIsSuccess(false)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent/20 rounded-lg">
          <User className="text-accent" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">My Profile</h2>
          <p className="text-gray-400 text-sm">Manage your information and security</p>
        </div>
      </div>

      {/* Informations du profil */}
      {profile && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
              <User className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-400">Username</p>
                <p className="text-white font-medium">{profile.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
              <Shield className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-400">Role</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profile.role === 'super_admin' 
                    ? 'bg-accent/20 text-accent' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
              <CheckCircle className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-400">Member since</p>
                <p className="text-white font-medium">
                  {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Changer le mot de passe */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            isSuccess 
              ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-gray-500" size={20} />
              </div>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Your current password"
                required
              />
            </div>
          </div>

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
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirmer le mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-gray-500" size={20} />
              </div>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 pl-12 pr-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-gradient-to-r from-accent to-yellow-500 text-black font-semibold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Security Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                <li>Use at least 8 characters</li>
                <li>Mix letters, numbers and symbols</li>
                <li>Don&apos;t reuse an old password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
