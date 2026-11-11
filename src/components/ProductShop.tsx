'use client'

import { useEffect, useState } from 'react'
import type { Product } from '@/lib/products'
import { productText, reconcileBasket } from '@/lib/products'
import { useLanguage } from '@/lib/language-context'
import ProductCard from '@/components/ProductCard'

const copy = {
  en: {
    title: 'Products', intro: 'Discover our products and collect them at the salon.', loading: 'Loading products...', empty: 'No products are available yet.', error: 'Unable to load products. Please try again.',
    soldOut: 'Sold out', inStock: 'In stock', quickView: 'Quick view', close: 'Close', add: 'Add to basket', basket: 'Your basket', basketEmpty: 'Your basket is empty.', remove: 'Remove', total: 'Estimated total', quantity: 'Quantity',
    disclaimer: 'This is a request, not a confirmed order. Tarek must confirm availability and stock. Pay at the salon when you collect your products.',
    whatsapp: 'Request via WhatsApp', email: 'Request via email', changed: 'Product availability or prices have changed. Please review your basket before trying again.',
    checking: 'Checking products...', subject: 'Product request', greeting: 'Hello Tarek, I would like to request these products for collection at the salon:',
    messageEnd: 'Please confirm availability. I will pay at the salon.', contactError: 'The contact details are unavailable.',
  },
  fr: {
    title: 'Produits', intro: 'Découvrez nos produits et retirez-les au salon.', loading: 'Chargement des produits...', empty: 'Aucun produit disponible pour le moment.', error: 'Impossible de charger les produits. Veuillez réessayer.',
    soldOut: 'Épuisé', inStock: 'En stock', quickView: 'Aperçu rapide', close: 'Fermer', add: 'Ajouter au panier', basket: 'Votre panier', basketEmpty: 'Votre panier est vide.', remove: 'Retirer', total: 'Total estimé', quantity: 'Quantité',
    disclaimer: 'Ceci est une demande, pas une commande confirmée. Tarek doit confirmer la disponibilité et le stock. Paiement au salon lors du retrait.',
    whatsapp: 'Demander par WhatsApp', email: 'Demander par e-mail', changed: 'La disponibilité ou les prix ont changé. Vérifiez votre panier avant de réessayer.',
    checking: 'Vérification des produits...', subject: 'Demande de produits', greeting: 'Bonjour Tarek, je souhaite demander ces produits à retirer au salon :',
    messageEnd: 'Merci de confirmer leur disponibilité. Je paierai au salon.', contactError: 'Les coordonnées sont indisponibles.',
  },
  nl: {
    title: 'Producten', intro: 'Ontdek onze producten en haal ze op in het salon.', loading: 'Producten laden...', empty: 'Er zijn momenteel geen producten beschikbaar.', error: 'Producten laden is niet gelukt. Probeer opnieuw.',
    soldOut: 'Uitverkocht', inStock: 'Op voorraad', quickView: 'Snel bekijken', close: 'Sluiten', add: 'Toevoegen aan winkelmand', basket: 'Uw winkelmand', basketEmpty: 'Uw winkelmand is leeg.', remove: 'Verwijderen', total: 'Geschat totaal', quantity: 'Aantal',
    disclaimer: 'Dit is een aanvraag, geen bevestigde bestelling. Tarek moet de beschikbaarheid en voorraad bevestigen. U betaalt bij afhaling in het salon.',
    whatsapp: 'Aanvragen via WhatsApp', email: 'Aanvragen via e-mail', changed: 'De beschikbaarheid of prijzen zijn gewijzigd. Controleer uw winkelmand en probeer opnieuw.',
    checking: 'Producten controleren...', subject: 'Productaanvraag', greeting: 'Hallo Tarek, ik wil graag deze producten aanvragen om af te halen in het salon:',
    messageEnd: 'Bevestig de beschikbaarheid. Ik betaal in het salon.', contactError: 'De contactgegevens zijn niet beschikbaar.',
  },
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products', { cache: 'no-store' })
  if (!response.ok) throw new Error('Unable to load products')
  return (await response.json()).products
}

export default function ProductShop() {
  const { locale } = useLanguage()
  const t = copy[locale]
  const [products, setProducts] = useState<Product[]>([])
  const [basket, setBasket] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchProducts().then(data => { if (active) setProducts(data) }).catch(err => {
      console.error(err)
      if (active) setError('load')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const selected = products.filter(product => basket[product.id] > 0)
  const total = selected.reduce((sum, product) => sum + product.price_cents * basket[product.id], 0)
  const money = (cents: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100)

  const send = async (method: 'whatsapp' | 'email') => {
    if (!selected.length) return
    setChecking(true)
    setError('')
    try {
      const latest = await fetchProducts()
      const reconciliation = reconcileBasket(products, latest, basket)
      if (reconciliation.changed) {
        setProducts(latest)
        setBasket(reconciliation.basket)
        setError('changed')
        return
      }
      const lines = selected.map(product => `${basket[product.id]} x ${productText(product, 'name', locale)} — ${money(product.price_cents * basket[product.id])}`)
      const message = [t.greeting, '', ...lines, '', `${t.total}: ${money(total)}`, '', t.messageEnd].join('\n')
      if (method === 'whatsapp') {
        window.location.href = `https://wa.me/32465632205?text=${encodeURIComponent(message)}`
      } else {
        const response = await fetch('/api/settings', { cache: 'no-store' })
        if (!response.ok) { setError('contact'); return }
        const data = await response.json()
        const email = typeof data.settings?.email === 'string' ? data.settings.email.trim() : ''
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('contact'); return }
        window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(message)}`
      }
    } catch (err) {
      console.error('Unable to check products:', err)
      setError('load')
    } finally { setChecking(false) }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 pb-36 pt-32 text-white">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">Tarek Salon</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t.title}</h1><p className="mt-3 max-w-2xl text-gray-400">{t.intro}</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-900/40 p-3 text-red-200">{error === 'changed' ? t.changed : error === 'contact' ? t.contactError : t.error}</p>}
      {loading ? <p className="mt-8">{t.loading}</p> : products.length === 0 && !error ? <p className="mt-8 text-gray-400">{t.empty}</p> : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map(product => <ProductCard key={product.id} product={product} name={productText(product, 'name', locale)} description={productText(product, 'description', locale)} price={money(product.price_cents)} quantity={basket[product.id] || 0} labels={t} onAdd={() => setBasket(current => ({ ...current, [product.id]: Math.min(product.stock, (current[product.id] || 0) + 1) }))} />)}
          </div>
          <aside className="h-fit space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-xl font-semibold">{t.basket}</h2>
            {selected.length === 0 ? <p className="text-gray-400">{t.basketEmpty}</p> : selected.map(product => <div key={product.id} className="border-b border-white/10 pb-3">
              <p>{productText(product, 'name', locale)} — {money(product.price_cents)}</p>
              <label className="mt-2 flex items-center gap-2 text-sm">{t.quantity}<input type="number" min="1" max={product.stock} value={basket[product.id]} onChange={event => {
                const quantity = event.currentTarget.valueAsNumber
                if (Number.isInteger(quantity) && quantity >= 1 && quantity <= product.stock) setBasket(current => ({ ...current, [product.id]: quantity }))
              }} className="w-16 rounded border border-white/20 bg-black/30 p-1" /></label>
              <button type="button" className="mt-2 text-sm text-red-300 underline" onClick={() => setBasket(current => { const next = { ...current }; delete next[product.id]; return next })}>{t.remove}</button>
            </div>)}
            <p aria-live="polite" className="font-semibold">{t.total}: {money(total)}</p><p className="text-sm text-gray-400">{t.disclaimer}</p>
            <button type="button" disabled={!selected.length || checking} onClick={() => void send('whatsapp')} className="w-full rounded-lg bg-green-600 px-3 py-2 font-semibold disabled:opacity-50">{checking ? t.checking : t.whatsapp}</button>
            <button type="button" disabled={!selected.length || checking} onClick={() => void send('email')} className="w-full rounded-lg border border-accent px-3 py-2 font-semibold text-accent disabled:opacity-50">{checking ? t.checking : t.email}</button>
          </aside>
        </div>
      )}
    </main>
  )
}
