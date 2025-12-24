'use client'

import { useState, useEffect } from 'react'

export default function TestGalleryPage() {
  const [photos, setPhotos] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testGallery()
  }, [])

  const testGallery = async () => {
    try {
      console.log('🧪 Test 1 - Appel API...')
      const response = await fetch('/api/gallery')
      
      console.log('🧪 Test 2 - Statut:', response.status)
      const data = await response.json()
      
      console.log('🧪 Test 3 - Données reçues:', data)
      console.log('🧪 Test 4 - Nombre de photos:', data.photos?.length)
      
      if (data.photos && data.photos.length > 0) {
        console.log('🧪 Test 5 - Première URL:', data.photos[0].url)
        setPhotos(data.photos)
      } else {
        setError('Aucune photo trouvée')
      }
    } catch (err: any) {
      console.error('❌ Erreur test:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testDirectUrl = () => {
    if (photos.length === 0) return

    const testUrl = photos[0].url
    console.log('🧪 Test URL directe:', testUrl)
    
    // Test avec fetch
    fetch(testUrl, { mode: 'no-cors' })
      .then(() => console.log('✅ Fetch réussi'))
      .catch(err => console.error('❌ Fetch échoué:', err))

    // Ouvrir dans un nouvel onglet
    window.open(testUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-4">🧪 Test Gallery</h1>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">🧪 Test Gallery - Diagnostic</h1>
        
        {error && (
          <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg mb-4">
            <p className="text-red-400">❌ Erreur : {error}</p>
          </div>
        )}

        <div className="bg-secondary p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-3">📊 Résultats</h2>
          <div className="space-y-2 text-gray-300">
            <p>✅ API accessible</p>
            <p>📸 Nombre de photos : <span className="text-accent font-bold">{photos.length}</span></p>
            <p>🌐 Supabase URL : <span className="text-xs text-gray-400">{process.env.NEXT_PUBLIC_SUPABASE_URL}</span></p>
          </div>
        </div>

        {photos.length > 0 && (
          <>
            <button
              onClick={testDirectUrl}
              className="mb-6 px-4 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80 transition-colors font-bold"
            >
              🔗 Tester l&apos;URL directement
            </button>

            <div className="bg-secondary p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-white mb-3">🔗 URLs Générées</h2>
              <div className="space-y-2">
                {photos.map((photo, i) => (
                  <div key={i} className="bg-primary p-3 rounded text-xs break-all">
                    <p className="text-accent mb-1">{photo.name}</p>
                    <a 
                      href={photo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {photo.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">🖼️ Test 1 : Balise IMG standard</h2>
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, i) => (
                  <div key={i} className="bg-secondary p-2 rounded-lg">
                    <img 
                      src={photo.url} 
                      alt={photo.name}
                      className="w-full h-40 object-cover rounded"
                      onLoad={() => console.log('✅ Image chargée:', photo.name)}
                      onError={(e) => {
                        console.error('❌ Erreur chargement:', photo.name, photo.url)
                        e.currentTarget.style.border = '2px solid red'
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-2 truncate">{photo.name}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold text-white mt-8">🖼️ Test 2 : Avec crossOrigin</h2>
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, i) => (
                  <div key={i} className="bg-secondary p-2 rounded-lg">
                    <img 
                      src={photo.url} 
                      alt={photo.name}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-full h-40 object-cover rounded"
                      onLoad={() => console.log('✅ Image crossOrigin chargée:', photo.name)}
                      onError={(e) => {
                        console.error('❌ Erreur crossOrigin:', photo.name, photo.url)
                        e.currentTarget.style.border = '2px solid red'
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-2 truncate">{photo.name}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold text-white mt-8">🖼️ Test 3 : Image avec cache busting</h2>
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, i) => (
                  <div key={i} className="bg-secondary p-2 rounded-lg">
                    <img 
                      src={`${photo.url}?t=${Date.now()}`}
                      alt={photo.name}
                      className="w-full h-40 object-cover rounded"
                      onLoad={() => console.log('✅ Image cache-bust chargée:', photo.name)}
                      onError={(e) => {
                        console.error('❌ Erreur cache-bust:', photo.name)
                        e.currentTarget.style.border = '2px solid red'
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-2 truncate">{photo.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-8 bg-yellow-900/20 border border-yellow-500 p-4 rounded-lg">
          <h3 className="text-yellow-400 font-bold mb-2">💡 Instructions</h3>
          <ol className="text-gray-300 space-y-1 text-sm list-decimal list-inside">
            <li>Ouvrez la console (F12)</li>
            <li>Regardez les logs de chargement</li>
            <li>Vérifiez si les images ont une bordure rouge (= erreur)</li>
            <li>Cliquez sur &quot;Tester l&apos;URL directement&quot; pour ouvrir l&apos;image</li>
            <li>Si l&apos;image s&apos;ouvre mais ne s&apos;affiche pas ici = problème CORS</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
