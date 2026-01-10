import fetch from 'node-fetch'

async function createAdminUser() {
  try {
    console.log('Création d\'un utilisateur admin...')

    const response = await fetch('http://localhost:3001/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        name: 'Admin',
        role: 'admin',
        password: 'admin123'
      })
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Admin créé avec succès!')
      console.log('Email: admin@test.com')
      console.log('Mot de passe: admin123')
    } else {
      console.error('❌ Erreur:', result.error)
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
  }
}

createAdminUser()