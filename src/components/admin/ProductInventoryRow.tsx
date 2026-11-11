'use client'

import { useEffect, useState } from 'react'
import { Pencil, Save, Trash2 } from 'lucide-react'
import ProductImage from '@/components/ProductImage'
import { parsePriceCents, type Product } from '@/lib/products'
import toast from 'react-hot-toast'

export default function ProductInventoryRow({ product, disabled, onEdit, onDelete, onPatch }: {
  product: Product; disabled: boolean; onEdit: () => void; onDelete: () => void
  onPatch: (changes: { price_cents?: number; stock?: number; active?: boolean }) => Promise<void>
}) {
  const [price, setPrice] = useState((product.price_cents / 100).toFixed(2))
  const [stock, setStock] = useState(String(product.stock))
  useEffect(() => { setPrice((product.price_cents / 100).toFixed(2)); setStock(String(product.stock)) }, [product.price_cents, product.stock])
  const save = () => {
    const cents = parsePriceCents(price)
    if (cents === null || !/^\d+$/.test(stock) || Number(stock) > 100000) {
      toast.error('Enter a valid price and whole-number stock')
      return
    }
    const changes: { price_cents?: number; stock?: number } = {}
    if (cents !== product.price_cents) changes.price_cents = cents
    if (Number(stock) !== product.stock) changes.stock = Number(stock)
    if (Object.keys(changes).length) void onPatch(changes)
  }
  return <tr className="border-t border-white/10">
    <td className="p-3"><div className="flex min-w-48 items-center gap-3"><ProductImage path={product.image_path} name={product.name_en} className="h-12 w-12 shrink-0 rounded-lg" /><span className="font-medium">{product.name_en}</span></div></td>
    <td className="p-3"><label className="sr-only" htmlFor={`price-${product.id}`}>Price for {product.name_en}</label><input id={`price-${product.id}`} inputMode="decimal" value={price} onChange={event => setPrice(event.target.value)} disabled={disabled} className="w-24 rounded-lg border border-white/15 bg-black/30 px-2 py-2" /></td>
    <td className="p-3"><label className="sr-only" htmlFor={`stock-${product.id}`}>Stock for {product.name_en}</label><input id={`stock-${product.id}`} type="number" min="0" max="100000" step="1" value={stock} onChange={event => setStock(event.target.value)} disabled={disabled} className="w-20 rounded-lg border border-white/15 bg-black/30 px-2 py-2" /></td>
    <td className="p-3"><button type="button" role="switch" aria-checked={product.active} aria-label={`Show ${product.name_en} in shop`} disabled={disabled} onClick={() => void onPatch({ active: !product.active })} className={`rounded-full px-3 py-2 text-xs font-semibold ${product.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-gray-300'}`}>{product.active ? 'On' : 'Off'}</button></td>
    <td className="p-3"><div className="flex gap-2"><button type="button" disabled={disabled} onClick={save} aria-label={`Save price and stock for ${product.name_en}`} className="rounded-lg border border-white/20 p-2 hover:text-accent"><Save size={18} /></button><button type="button" disabled={disabled} onClick={onEdit} aria-label={`Edit ${product.name_en}`} className="rounded-lg border border-white/20 p-2 hover:text-accent"><Pencil size={18} /></button><button type="button" disabled={disabled} onClick={onDelete} aria-label={`Delete ${product.name_en}`} className="rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/20"><Trash2 size={18} /></button></div></td>
  </tr>
}
