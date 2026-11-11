'use client'

import { useEffect, useRef, useState } from 'react'
import { Package, Plus, Save } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { parsePriceCents, type Product, type ProductInput } from '@/lib/products'
import ProductPhotoUploader from './ProductPhotoUploader'
import ProductInventoryRow from './ProductInventoryRow'

const emptyProduct = (): ProductInput => ({
  name_en: '', name_fr: '', name_nl: '',
  description_en: '', description_fr: '', description_nl: '',
  price_cents: 0, stock: 0, show_when_out_of_stock: true, active: true, image_path: null,
})

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm">
    <span>{label}</span>
    <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="peer sr-only" />
    <span aria-hidden="true" className="relative h-6 w-11 rounded-full bg-gray-600 transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-white after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
  </label>
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<ProductInput>(emptyProduct)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [language, setLanguage] = useState<'en' | 'fr' | 'nl'>('en')
  const [price, setPrice] = useState('0.00')
  const [stock, setStock] = useState('0')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const editDialogRef = useRef<HTMLDialogElement>(null)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const load = async () => {
    const response = await fetch('/api/products?admin=true', { cache: 'no-store' })
    if (!response.ok) throw new Error('Unable to load products')
    setProducts((await response.json()).products)
  }
  useEffect(() => {
    load().catch(error => { console.error(error); toast.error('Unable to load products') }).finally(() => setLoading(false))
  }, [])
  useEffect(() => {
    const dialog = editDialogRef.current
    if (!dialog) return
    if (editingId && !dialog.open) dialog.showModal()
    if (!editingId && dialog.open) dialog.close()
  }, [editingId])
  useEffect(() => {
    const dialog = deleteDialogRef.current
    if (!dialog) return
    if (deleteTarget && !dialog.open) dialog.showModal()
    if (!deleteTarget && dialog.open) dialog.close()
  }, [deleteTarget])
  const reset = () => { setEditing(emptyProduct()); setEditingId(null); setPrice('0.00'); setStock('0'); setLanguage('en') }
  const select = (product: Product) => {
    setEditing(product); setEditingId(product.id); setPrice((product.price_cents / 100).toFixed(2)); setStock(String(product.stock)); setLanguage('en')
  }
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    const cents = parsePriceCents(price)
    if (cents === null || !/^\d+$/.test(stock) || Number(stock) > 100000) { toast.error('Enter a valid price and whole-number stock'); return }
    if (!editing.name_en.trim()) { setLanguage('en'); toast.error('English product name is required'); return }
    setBusy(true)
    try {
      const response = await fetch('/api/products', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editing, stock: Number(stock), price_cents: cents, ...(editingId ? { id: editingId } : {}) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to save product')
      reset()
      toast.success('Product saved')
      try { await load() } catch (error) { console.error(error); toast.error('Product saved, but the list could not be refreshed') }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save product')
    } finally { setBusy(false) }
  }
  const patch = async (product: Product, changes: { stock?: number; price_cents?: number; active?: boolean }) => {
    setBusy(true)
    try {
      const response = await fetch('/api/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, ...changes }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to update product')
      const updated: Product = data.product
      setProducts(current => current.map(item => item.id === updated.id ? updated : item))
      if (editingId === updated.id) {
        setEditing(current => ({ ...current, ...changes }))
        if (changes.stock !== undefined) setStock(String(changes.stock))
        if (changes.price_cents !== undefined) setPrice((changes.price_cents / 100).toFixed(2))
      }
      toast.success('Product updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update product')
    } finally { setBusy(false) }
  }
  const deleteProduct = async () => {
    if (!deleteTarget || busy) return
    setBusy(true)
    setDeleteError('')
    try {
      const response = await fetch(`/api/products?id=${encodeURIComponent(deleteTarget.id)}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to delete product')
      setProducts(current => current.filter(product => product.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success('Product deleted')
    } catch (error) {
      console.error('Unable to delete product:', error)
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete product')
    } finally { setBusy(false) }
  }
  const inputClass = 'mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-white outline-none focus:border-accent'
  const productForm = <form id="product-form" onSubmit={save} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
      <h3 id="product-form-title" className="flex items-center gap-2 text-lg font-semibold"><Plus size={18} />{editingId ? `Edit product: ${editing.name_en}` : 'Add product'}</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm">Product name (English) *<input className={inputClass} value={editing.name_en} maxLength={120} required onChange={event => setEditing(current => ({ ...current, name_en: event.target.value }))} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Price (€)<input className={inputClass} inputMode="decimal" value={price} onChange={event => setPrice(event.target.value)} required /></label>
            <label className="text-sm">Stock<input className={inputClass} type="number" min="0" max="100000" step="1" value={stock} onChange={event => setStock(event.target.value)} required /></label>
          </div>
          <ProductPhotoUploader path={editing.image_path} disabled={busy} onChange={path => setEditing(current => ({ ...current, image_path: path }))} onBusyChange={setBusy} />
          <Toggle label="Show product in shop" checked={editing.active} onChange={active => setEditing(current => ({ ...current, active }))} />
          <Toggle label="Show as sold out when stock is zero" checked={editing.show_when_out_of_stock} onChange={show_when_out_of_stock => setEditing(current => ({ ...current, show_when_out_of_stock }))} />
        </div>
        <div className="space-y-4">
          <div><h4 className="font-semibold">Descriptions & translations</h4><p className="mt-1 text-sm text-gray-400">French and Dutch are optional. Missing translations display in English.</p></div>
          <div className="flex gap-2" aria-label="Translation language">
            {(['en', 'fr', 'nl'] as const).map(item => <button key={item} type="button" aria-pressed={language === item} onClick={() => setLanguage(item)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${language === item ? 'bg-accent text-black' : 'bg-white/10 text-gray-300'}`}>{item.toUpperCase()}{item === 'en' ? ' (Main)' : ''}</button>)}
          </div>
          {language !== 'en' && <label className="block text-sm">Product name ({language.toUpperCase()})<input className={inputClass} maxLength={120} value={editing[`name_${language}`]} onChange={event => setEditing(current => ({ ...current, [`name_${language}`]: event.target.value }))} /></label>}
          <label className="block text-sm">Description ({language.toUpperCase()})<textarea className={`${inputClass} min-h-40`} maxLength={2000} value={editing[`description_${language}`]} onChange={event => setEditing(current => ({ ...current, [`description_${language}`]: event.target.value }))} /></label>
        </div>
      </div>
      <div className="flex gap-3"><button disabled={busy} className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 font-semibold text-black disabled:opacity-50"><Save size={17} />{busy ? 'Please wait...' : 'Save product'}</button>{editingId && <button type="button" onClick={reset} disabled={busy} className="rounded-xl border border-white/20 px-4">Cancel</button>}</div>
    </form>
  return <section className="space-y-6 text-white">
    {!editingId && <Toaster position="top-right" />}
    <div><h2 className="flex items-center gap-2 text-2xl font-bold"><Package className="text-accent" />Products</h2><p className="mt-1 text-sm text-gray-400">Manage the catalogue and update stock manually after each sale.</p></div>
    {!editingId && productForm}
    <dialog
      ref={editDialogRef}
      aria-labelledby="product-form-title"
      onCancel={event => { event.preventDefault(); if (!busy) reset() }}
      className="m-auto max-h-[90dvh] w-[min(94vw,900px)] overflow-y-auto rounded-2xl border border-white/15 bg-zinc-900 p-0 text-white shadow-2xl backdrop:bg-black/80"
    >
      {editingId && <Toaster position="top-right" />}
      {editingId && productForm}
    </dialog>
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
      {loading ? <p className="p-4">Loading products...</p> : products.length === 0 ? <p className="p-4 text-gray-400">No products yet.</p> : <table className="w-full text-left text-sm"><thead className="text-gray-400"><tr><th className="p-3">Product</th><th className="p-3">Price (€)</th><th className="p-3">Stock</th><th className="p-3">Visible</th><th className="p-3">Actions</th></tr></thead><tbody>{products.map(product => <ProductInventoryRow key={product.id} product={product} disabled={busy} onEdit={() => select(product)} onDelete={() => { setDeleteError(''); setDeleteTarget(product) }} onPatch={changes => patch(product, changes)} />)}</tbody></table>}
    </div>
    <dialog
      ref={deleteDialogRef}
      aria-labelledby="delete-product-title"
      aria-describedby="delete-product-description"
      onCancel={event => { event.preventDefault(); if (!busy) setDeleteTarget(null) }}
      className="m-auto w-[min(90vw,440px)] rounded-2xl border border-white/15 bg-zinc-900 p-6 text-white shadow-2xl backdrop:bg-black/80"
    >
      <h3 id="delete-product-title" className="text-xl font-semibold">Delete product?</h3>
      <p id="delete-product-description" className="mt-3 text-sm text-gray-300">Permanently delete <strong>{deleteTarget?.name_en}</strong>? This cannot be undone.</p>
      {deleteError && <p role="alert" className="mt-3 text-sm text-red-300">{deleteError}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void deleteProduct()} className="min-h-11 rounded-xl bg-red-600 px-4 font-semibold text-white disabled:opacity-50">{busy ? 'Deleting...' : 'Delete permanently'}</button>
        <button type="button" disabled={busy} onClick={() => setDeleteTarget(null)} className="min-h-11 rounded-xl border border-white/20 px-4 disabled:opacity-50">Cancel</button>
      </div>
    </dialog>
  </section>
}
