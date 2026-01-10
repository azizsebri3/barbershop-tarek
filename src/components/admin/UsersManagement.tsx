'use client'

import { useState, useEffect } from 'react'
import { Users, Mail, UserPlus, Trash2, Shield, Clock, CheckCircle } from 'lucide-react'

interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  status: string
  created_at: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'admin' })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(`✅ Invitation envoyée à ${email}`)
        setEmail('')
        setShowInviteForm(false)
        fetchUsers()
        
        // Afficher le lien d'invitation (en dev)
        if (data.invitationLink) {
          console.log('Lien d\'invitation:', data.invitationLink)
        }
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Erreur lors de l\'invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Supprimer l'utilisateur ${username} ?`)) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (res.ok) {
        setMessage(`✅ Utilisateur ${username} supprimé`)
        fetchUsers()
      } else {
        const data = await res.json()
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Erreur lors de la suppression')
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Users className="text-accent" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h2>
            <p className="text-gray-400 text-sm">Inviter et gérer les administrateurs</p>
          </div>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-accent to-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-accent/20 transition-all"
        >
          <UserPlus size={18} />
          Inviter un utilisateur
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-500/10 border border-green-500/30 text-green-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
          {message}
        </div>
      )}

      {/* Formulaire d'invitation */}
      {showInviteForm && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Inviter un nouvel administrateur</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilisateur@exemple.com"
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <p className="text-sm text-gray-400 mt-1">
                L&apos;utilisateur choisira son nom d&apos;utilisateur lors de l&apos;activation
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={inviting}
                className="flex-1 bg-accent text-black font-semibold py-2.5 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {inviting ? 'Envoi...' : "Envoyer l'invitation"}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-6 bg-gray-700 text-white font-semibold py-2.5 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rôle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Dernière connexion</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-500 rounded-full flex items-center justify-center text-black font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail size={16} />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className={user.role === 'super_admin' ? 'text-accent' : 'text-blue-400'} />
                      <span className={`text-sm font-medium ${user.role === 'super_admin' ? 'text-accent' : 'text-blue-400'}`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'active' ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle size={16} />
                        <span className="text-sm">Actif</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Clock size={16} />
                        <span className="text-sm">En attente</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('fr-FR', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })
                      : 'Jamais'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'super_admin' && (
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
